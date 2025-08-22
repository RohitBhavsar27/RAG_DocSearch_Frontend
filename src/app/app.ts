import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ChatComponent } from './chat-component/chat-component';
import { DocUploadComponent } from './doc-upload-component/doc-upload-component';

type ActiveDoc = { name: string; docId: string } | null;

@Component({
    selector: 'app-root',
    imports: [ChatComponent, DocUploadComponent,],
    templateUrl: './app.html',
    styleUrl: './app.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
    protected readonly title = signal('RAG_DocSearch_Frontend');

    active: ActiveDoc = null;

    onDocumentChange(doc: ActiveDoc) {
        this.active = doc;
    }

    get documentName(): string {
        return this.active?.name ?? 'No document selected';
    }

    get docId(): string | null {
        return this.active?.docId ?? null;
    }
}
