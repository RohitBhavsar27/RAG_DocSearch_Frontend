import { ChangeDetectionStrategy, Component, EventEmitter, Output, DestroyRef, inject, ChangeDetectorRef } from '@angular/core';
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
    private cdr = inject(ChangeDetectorRef); // ✅

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
        this.cdr.markForCheck(); // ✅

        this.api.uploadDocument(this.selectedFile).subscribe({
            next: (ev: UploadEvent) => {
                switch (ev.kind) {
                    case 'upload-progress':
                        this.progress = ev.progress ?? 0;
                        // show “Processing…” when we reach 100 while the server indexes
                        if (this.progress >= 100) this.isProcessing = true;
                        break;

                    case 'processing':
                        this.isProcessing = true;
                        break;

                    case 'done': {
                        // ✅ clear banner
                        this.isUploading = false;
                        this.isProcessing = false;
                        this.progress = 100;

                        const docId = ev.data.doc_id;
                        this.recent.add({
                            name: this.selectedFile!.name,
                            size: this.selectedFile!.size,
                            uploadedAt: new Date().toISOString(),
                            chunks: ev.data?.chunks_created,
                            docId,
                        });
                        this.documentChange.emit({ name: this.selectedFile!.name, docId });
                        break;
                    }
                }
                this.cdr.markForCheck(); // ✅ update view with OnPush
            },
            error: () => {
                // ✅ always clear on error
                this.isUploading = false;
                this.isProcessing = false;
                this.cdr.markForCheck();
            }
        });
    }
}
