import { ChangeDetectionStrategy, Component, EventEmitter, Output, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RagApiService, UploadEvent } from '../services/api-service';
import { CommonModule } from '@angular/common';
import { RecentDocsService, RecentDoc } from '../services/recent-docs-service';
import { RecentDocsComponent } from '../recent-docs-component/recent-docs-component';

@Component({
    selector: 'app-doc-upload-component',
    standalone: true,
    imports: [CommonModule, RecentDocsComponent,],
    templateUrl: './doc-upload-component.html',
    styleUrl: './doc-upload-component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocUploadComponent {
    private api = inject(RagApiService);
    private recent = inject(RecentDocsService);

    /** Bubble the active doc name up to AppComponent */
    @Output() documentChange = new EventEmitter<{ name: string; docId: string }>();

    // local UI state (simplified)
    selectedFile?: File;
    isUploading = false;
    isProcessing = false;
    progress = 0;

    onFileInput(files: FileList | null) {
        if (!files || files.length === 0) return;
        const file = files.item(0)!;
        if (file.type !== 'application/pdf') return; // basic guard
        this.selectedFile = file;
        this.uploadSelected();
    }

    dropFile(file: File) {
        if (!file || file.type !== 'application/pdf') return;
        this.selectedFile = file;
        this.uploadSelected();
    }

    removeSelection() {
        this.selectedFile = undefined;
        this.progress = 0;
        this.isUploading = false;
        this.isProcessing = false;
    }

    // When a recent is clicked
    onRecentSelect(d: RecentDoc) {
        this.documentChange.emit({ name: d.name, docId: d.docId });
    }

    /** Upload and update Recent + active header name */
    private uploadSelected() {
        if (!this.selectedFile) return;

        this.isUploading = true;
        this.isProcessing = false;
        this.progress = 0;

        this.api.uploadDocument(this.selectedFile).subscribe({
            next: (ev) => {
                if (ev.kind === 'done') {
                    const docId = ev.data.doc_id;
                    this.recent.add({
                        name: this.selectedFile!.name,
                        size: this.selectedFile!.size,
                        uploadedAt: new Date().toISOString(),
                        chunks: ev.data?.chunks_created,
                        docId,
                    });
                    this.documentChange.emit({ name: this.selectedFile!.name, docId });
                }
            },
            error: () => {
                this.isUploading = false;
                this.isProcessing = false;
                // (Optional) show error toast
            }
        });
    }
}