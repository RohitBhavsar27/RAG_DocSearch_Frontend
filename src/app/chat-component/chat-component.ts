import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    ViewChild,
    DestroyRef,
    inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RagApiService } from '../services/api-service'; // adjust path if needed
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PromptChipsComponent } from "../prompt-chips-component/prompt-chips-component";

type Role = 'user' | 'ai';
interface ChatMessage { role: Role; content: string; }

@Component({
    selector: 'app-chat-component',
    standalone: true,
    imports: [FormsModule, PromptChipsComponent],
    templateUrl: './chat-component.html',
    styleUrls: ['./chat-component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements AfterViewInit {
    @Input() documentName = 'No document selected';
    @ViewChild('scroller') scroller!: ElementRef<HTMLDivElement>;
    @ViewChild('questionInput') questionInput!: ElementRef<HTMLInputElement>;

    private api = inject(RagApiService);
    private destroyRef = inject(DestroyRef);
    private cdr = inject(ChangeDetectorRef);

    messages: ChatMessage[] = [
        { role: 'ai', content: 'Hi! Upload a PDF on the left, then ask me anything about it.' },
    ];

    promptSuggestions: string[] = [
        'Summarize the document',
        'Give me 5 key points',
        'What is the main objective?',
        'List important dates',
        'Any action items?',
    ];

    question = '';
    isTyping = false;

    // tiny toast
    toastMsg = '';
    toastVisible = false;
    private toastTimer?: any;

    get isSendDisabled(): boolean {
        return this.isTyping || this.question.trim().length === 0;
    }

    ngAfterViewInit(): void {
        this.scrollToBottom();
    }

    onPromptChip(p: string): void {
        if (this.isTyping) return;
        this.question = p;
        this.cdr.markForCheck();
        this.focusInput();
        // If you prefer auto-send: this.onSend();
    }

    onSend(): void {
        const content = this.question.trim();
        if (!content || this.isTyping) return;

        this.messages = [...this.messages, { role: 'user', content }];
        this.question = '';
        this.scrollToBottom();

        this.isTyping = true;
        this.cdr.markForCheck();

        this.api.chat(content).pipe(
            timeout(30000),
            takeUntilDestroyed(this.destroyRef),
            catchError((err) => {
                const detail = err?.error?.detail;
                if (err?.name === 'TimeoutError') return of({ answer: 'The server took too long to respond. Please try again.' });
                if (err?.status === 404) return of({ answer: 'No document index found. Please upload a PDF first.' });
                let msg = 'Sorry—something went wrong while contacting the server.';
                if (typeof detail === 'string') msg = detail;
                if (Array.isArray(detail)) msg = detail[0]?.msg || msg;
                return of({ answer: msg });
            })
        ).subscribe({
            next: (res) => {
                this.isTyping = false;
                const answer = res?.answer ?? '(No answer returned)';
                this.messages = [...this.messages, { role: 'ai', content: answer }];
                this.cdr.markForCheck();
                this.scrollToBottom();
            },
            error: () => {
                this.isTyping = false;
                this.messages = [...this.messages, { role: 'ai', content: 'Request failed.' }];
                this.cdr.markForCheck();
                this.scrollToBottom();
            }
        });
    }

    // --- Message actions ---
    copyMessage(content: string): void {
        navigator.clipboard?.writeText(content)
            .then(() => this.showToast('Copied to clipboard'))
            .catch(() => this.showToast('Copy failed'));
    }

    deleteMessage(index: number): void {
        // Optional: prevent deleting the very first system/AI greeting
        if (index === 0 && this.messages[0]?.content.startsWith('Hi! Upload')) {
            this.showToast('Cannot delete the greeting');
            return;
        }
        this.messages = this.messages.filter((_, i) => i !== index);
        this.cdr.markForCheck();
    }

    // --- tiny toast helper ---
    private showToast(msg: string): void {
        this.toastMsg = msg;
        this.toastVisible = true;
        this.cdr.markForCheck();
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
            this.toastVisible = false;
            this.cdr.markForCheck();
        }, 1400);
    }

    private scrollToBottom(): void {
        const el = this.scroller?.nativeElement;
        if (!el) return;
        setTimeout(() => { el.scrollTop = el.scrollHeight; }, 0);
    }

    private focusInput(): void {
        try { this.questionInput?.nativeElement?.focus(); } catch { }
    }
}
