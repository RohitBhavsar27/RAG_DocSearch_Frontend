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
    PLATFORM_ID,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BackendCitation, RagApiService } from '../services/api-service'; // adjust path if needed
import { timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PromptChipsComponent } from "../prompt-chips-component/prompt-chips-component";
import { MarkdownMessageComponent } from '../markdown-message-component/markdown-message-component';
import { HealthIndicatorComponent } from '../health-indicator-component/health-indicator-component';
import { ExportDialogComponent } from '../export-dialog-component/export-dialog-component';
import { CitationsDrawerComponent, type Citation } from '../citations-drawer-component/citations-drawer-component';
import { SourceChipComponent } from '../source-chip-component/source-chip-component';
import { isPlatformBrowser } from '@angular/common';

type Role = 'user' | 'ai';
interface ChatMessage { role: Role; content: string; citations?: Citation[]; }

@Component({
    selector: 'app-chat-component',
    standalone: true,
    imports: [FormsModule, PromptChipsComponent, MarkdownMessageComponent, HealthIndicatorComponent, ExportDialogComponent, CitationsDrawerComponent, SourceChipComponent,],
    templateUrl: './chat-component.html',
    styleUrls: ['./chat-component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements AfterViewInit {
    @Input() documentName = 'No document selected';
    @Input() docId: string | null = null;       // <- NEW    @ViewChild('scroller') scroller!: ElementRef<HTMLDivElement>;
    @ViewChild('questionInput') questionInput!: ElementRef<HTMLInputElement>;

    // ✅ This is the missing property
    @ViewChild('scroller', { static: false })
    scroller?: ElementRef<HTMLDivElement>;
    
    private api = inject(RagApiService);
    private destroyRef = inject(DestroyRef);
    private cdr = inject(ChangeDetectorRef);
    private platformId = inject(PLATFORM_ID);
    isBrowser = isPlatformBrowser(this.platformId);

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
    drawerOpen = false;
    drawerCitations: Citation[] = [];
    drawerActive = 0;

    get isSendDisabled(): boolean {
        return this.isTyping || !this.docId || this.question.trim().length === 0;
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
        if (!content || this.isTyping || !this.docId) return;

        this.messages = [...this.messages, { role: 'user', content }];
        this.question = '';
        this.scrollToBottom();

        this.isTyping = true;
        this.cdr.markForCheck();

        this.api.chat(content, this.docId!).subscribe({
            next: (res) => {
                const answer = res?.answer ?? '(No answer returned)';

                // Map backend citations -> UI citations (and make PDF URL absolute)
                const mapped: Citation[] = (res?.citations ?? []).map((c: BackendCitation) => ({
                    id: crypto.randomUUID(),
                    title: c.title,
                    page: c.page,
                    snippet: c.snippet,
                    pdfUrl: this.api.absolutePdfUrl(c.pdf_url),
                }));

                this.messages = [...this.messages, { role: 'ai', content: answer, citations: mapped }];
                this.isTyping = false;
                this.cdr.markForCheck();
                if (this.isBrowser) this.scrollToBottom();
            },
            error: () => {
                this.isTyping = false;
                this.messages = [...this.messages, { role: 'ai', content: 'Request failed.' }];
                this.cdr.markForCheck();
                this.scrollToBottom();
            }
        });
    }
    openCitationsFor(messageIndex: number, citationIndex: number) {
        const msg = this.messages[messageIndex];
        if (!msg?.citations?.length) return;
        this.drawerCitations = msg.citations;
        this.drawerActive = citationIndex;
        this.drawerOpen = true;
        this.cdr.markForCheck();
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
