// src/app/chat/chat-component.ts
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
import { RagApiService } from '../services/api-service'; // <- adjust path if needed
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type Role = 'user' | 'ai';
interface ChatMessage { role: Role; content: string; }

@Component({
    selector: 'app-chat-component',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './chat-component.html',
    styleUrls: ['./chat-component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements AfterViewInit {
    @Input() documentName = 'No document selected';
    @ViewChild('scroller') scroller!: ElementRef<HTMLDivElement>;

    private api = inject(RagApiService);
    private destroyRef = inject(DestroyRef);
    private cdr = inject(ChangeDetectorRef);

    messages: ChatMessage[] = [
        { role: 'ai', content: 'Hi! Upload a PDF on the left, then ask me anything about it.' },
    ];

    question = '';
    isTyping = false;

    get isSendDisabled(): boolean {
        return this.isTyping || this.question.trim().length === 0;
    }

    ngAfterViewInit(): void {
        this.scrollToBottom();
    }

    onSend(): void {
        const content = this.question.trim();
        if (!content || this.isTyping) return;

        // push user message
        this.messages = [...this.messages, { role: 'user', content }];
        this.question = '';
        this.scrollToBottom();

        this.isTyping = true;
        this.cdr.markForCheck(); // 🔔 ensure OnPush picks up the typing change

        this.api.chat(content).pipe(
            timeout(30000),
            takeUntilDestroyed(this.destroyRef),
            catchError((err) => {
                const detail = err?.error?.detail;
                if (err?.name === 'TimeoutError') {
                    return of({ answer: 'The server took too long to respond. Please try again.' });
                }
                if (err?.status === 404) {
                    return of({ answer: 'No document index found. Please upload a PDF first.' });
                }
                let msg = 'Sorry—something went wrong while contacting the server.';
                if (typeof detail === 'string') msg = detail;
                if (Array.isArray(detail)) msg = detail[0]?.msg || msg;
                return of({ answer: msg });
            })
        ).subscribe({
            next: (res) => {
                this.isTyping = false;                  // ✅ always clear typing
                const answer = res?.answer ?? '(No answer returned)';
                this.messages = [...this.messages, { role: 'ai', content: answer }];
                this.cdr.markForCheck();                // 🔔 force repaint after state changes
                this.scrollToBottom();
            },
            error: (_err) => {
                this.isTyping = false;                  // ✅ clear typing on error too
                this.messages = [...this.messages, { role: 'ai', content: 'Request failed.' }];
                this.cdr.markForCheck();                // 🔔 force repaint
                this.scrollToBottom();
            }
        });
    }

    private scrollToBottom(): void {
        const el = this.scroller?.nativeElement;
        if (!el) return;
        setTimeout(() => { el.scrollTop = el.scrollHeight; }, 0);
    }
}
