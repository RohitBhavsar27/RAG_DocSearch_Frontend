import { ChangeDetectionStrategy, Component, EventEmitter, Output, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RagApiService, UploadEvent } from '../services/api-service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-doc-upload-component',
    standalone: true,
    imports: [CommonModule,],
    templateUrl: './doc-upload-component.html',
    styleUrl: './doc-upload-component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocUploadComponent {
    @Output() fileSelected = new EventEmitter<File>();
    @Output() fileCleared = new EventEmitter<void>();
    @Output() processStarted = new EventEmitter<File>();
    @Output() processCompleted = new EventEmitter<File>();

    private api = inject(RagApiService);
    private destroyRef = inject(DestroyRef);

    selectedFile: File | null = null;
    isDragOver = false;

    // UI states
    isUploading = false;     // HTTP upload bytes
    isProcessing = false;    // server-side processing after upload completes
    uploadProgress = 0;      // 0-100 during upload
    error = '';

    onFileInputChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0] ?? null;
        if (file) this.handleFile(file);
        input.value = '';
        // Optional: blur focus to avoid accidental re-trigger via keyboard
        if (typeof document !== 'undefined') (document.activeElement as HTMLElement | null)?.blur?.();
    }

    onDragOver(event: DragEvent): void {
        event.preventDefault();
        this.isDragOver = true;
    }
    onDragLeave(_: DragEvent): void {
        this.isDragOver = false;
    }
    onDrop(event: DragEvent): void {
        event.preventDefault();
        this.isDragOver = false;
        const file = event.dataTransfer?.files?.[0] ?? null;
        if (file) this.handleFile(file);
    }

    removeFile(): void {
        this.selectedFile = null;
        this.resetStates();
        this.fileCleared.emit();
    }

    private handleFile(file: File): void {
        this.error = '';

        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        if (!isPdf) {
            this.error = 'Please upload a PDF file.';
            return;
        }
        const maxBytes = 20 * 1024 * 1024; // 20 MB
        if (file.size > maxBytes) {
            this.error = 'File is too large. Maximum size is 20 MB.';
            return;
        }

        this.selectedFile = file;
        this.fileSelected.emit(file);

        this.isUploading = true;
        this.uploadProgress = 0;
        this.isProcessing = false;
        this.processStarted.emit(file);

        this.api.uploadDocument(file)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (ev: UploadEvent) => {
                    if (ev.kind === 'sent') {
                        // keep isUploading true
                    } else if (ev.kind === 'upload-progress') {
                        this.uploadProgress = ev.progress;
                        // When upload reaches 100%, switch UI to "processing" (server work)
                        if (this.uploadProgress >= 100) {
                            this.isUploading = false;
                            this.isProcessing = true;
                        }
                    } else if (ev.kind === 'processing') {
                        // some browsers may fire this between progress and response
                        this.isUploading = false;
                        this.isProcessing = true;
                    } else if (ev.kind === 'done') {
                        this.isUploading = false;
                        this.isProcessing = false;
                        this.processCompleted.emit(this.selectedFile!);
                    }
                },
                error: (err) => {
                    this.isUploading = false;
                    this.isProcessing = false;
                    this.error = this.humanizeError(err);
                },
            });
    }

    private resetStates(): void {
        this.isUploading = false;
        this.isProcessing = false;
        this.uploadProgress = 0;
        this.error = '';
    }

    formatBytes(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'] as const;
        const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
        const val = bytes / Math.pow(k, i);
        return `${val.toFixed(val >= 100 ? 0 : val >= 10 ? 1 : 2)} ${sizes[i]}`;
    }

    private humanizeError(err: any): string {
        // FastAPI handlers return detail, or validation JSON; unify messages
        const detail = err?.error?.detail ?? err?.message ?? 'Upload failed.';
        if (Array.isArray(detail)) {
            // Validation error array -> take first
            return detail[0]?.msg || 'Validation error.';
        }
        return typeof detail === 'string' ? detail : 'Upload failed.';
    }
}
