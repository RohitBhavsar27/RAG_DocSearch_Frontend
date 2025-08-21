import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ChatComponent } from './chat-component/chat-component';
import { DocUploadComponent } from './doc-upload-component/doc-upload-component';

@Component({
    selector: 'app-root',
    imports: [ChatComponent, DocUploadComponent],
    templateUrl: './app.html',
    styleUrl: './app.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
    protected readonly title = signal('RAG_DocSearch_Frontend');

    documentName: string | null = null;

    onFileSelected(file: File): void {
        this.documentName = file?.name ?? null;
    }

    onFileCleared(): void {
        this.documentName = null;
    }

    onProcessStarted(_file: File): void { }
    onProcessCompleted(_file: File): void { }
}
