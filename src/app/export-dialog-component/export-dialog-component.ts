import { Component, Input } from '@angular/core';

type Role = 'user' | 'ai';
interface ChatMessage { role: Role; content: string;}

@Component({
  selector: 'app-export-dialog-component',
  imports: [],
  templateUrl: './export-dialog-component.html',
  styleUrl: './export-dialog-component.css'
})
export class ExportDialogComponent {
    @Input() messages: ChatMessage[] = [];
    @Input() documentName = 'document';

    menuOpen = false;

    toggleMenu() { this.menuOpen = !this.menuOpen; }
    closeMenu() { this.menuOpen = false; }

    exportMarkdown(): void {
        const ts = this.ts();
        const title = `Chat Export — ${this.documentName} — ${ts}`;
        const header = `# ${title}\n\n`;
        const body = this.messages.map(m => {
            return m.role === 'user'
                ? `**You:** ${m.content}\n`
                : `**AI:**\n\n${m.content}\n`;
        }).join('\n');
        this.download(`${this.safeName(this.documentName)}-${ts}.md`, header + body, 'text/markdown');
        this.closeMenu();
    }

    exportText(): void {
        const ts = this.ts();
        const lines = this.messages.map(m => (m.role === 'user' ? 'You: ' : 'AI: ') + m.content);
        const text = `Chat Export - ${this.documentName} - ${ts}\n\n` + lines.join('\n\n');
        this.download(`${this.safeName(this.documentName)}-${ts}.txt`, text, 'text/plain');
        this.closeMenu();
    }

    private download(filename: string, content: string, mime: string) {
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename; a.rel = 'noopener';
        document.body.appendChild(a); a.click();
        a.remove(); URL.revokeObjectURL(url);
    }

    private ts() {
        const d = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
    }

    private safeName(s: string) {
        return (s || 'chat').toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/-+/g, '-');
    }
}