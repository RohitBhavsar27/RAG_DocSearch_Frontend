import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-prompt-chips-component',
    imports: [CommonModule],
    templateUrl: './prompt-chips-component.html',
    styleUrl: './prompt-chips-component.css'
})
export class PromptChipsComponent {
    /** List of quick prompts to render as chips */
    @Input() prompts: string[] = [
        'Summarize the document',
        'List 5 key takeaways',
        'Who is the author?',
        'What is the main problem?',
        'Give me an executive summary',
    ];

    /** Disable interaction (e.g., while AI is typing) */
    @Input() disabled = false;

    /** Emits the selected prompt text */
    @Output() selectPrompt = new EventEmitter<string>();

    onSelect(p: string) {
        if (this.disabled) return;
        this.selectPrompt.emit(p);
    }

    /** trackBy for *ngFor to avoid re-rendering unchanged chips */
    trackByPrompt(_index: number, prompt: string): string {
        return prompt; // prompts are unique strings
    }
}
