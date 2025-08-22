import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-pdf-preview-component',
  imports: [NgxExtendedPdfViewerModule],
  templateUrl: './pdf-preview-component.html',
  styleUrl: './pdf-preview-component.css'
})
export class PdfPreviewComponent {
    /** PDF URL or Blob URL */
    @Input({ required: true }) src!: string;
    /** 1-based page */
    @Input() page = 1;
    /** height of the viewer */
    @Input() height = '100%';
}
