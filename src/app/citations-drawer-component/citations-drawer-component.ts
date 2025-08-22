import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfPreviewComponent } from '../pdf-preview-component/pdf-preview-component';

export interface Citation {
    id: string;
    title: string;
    page: number;
    snippet: string;
    pdfUrl: string;
}
@Component({
  selector: 'app-citations-drawer-component',
  imports: [CommonModule, PdfPreviewComponent,],
  templateUrl: './citations-drawer-component.html',
  styleUrl: './citations-drawer-component.css'
})
export class CitationsDrawerComponent {

    // add a viewer height you like
    viewerHeight = 'calc(100vh - 160px)'

    @Input() open = false;
    @Input() citations: Citation[] = [];
    @Input() activeIndex = 0;

    @Output() close = new EventEmitter<void>();
    @Output() changeActive = new EventEmitter<number>();

    onSelect(i: number) { this.changeActive.emit(i); }
}
