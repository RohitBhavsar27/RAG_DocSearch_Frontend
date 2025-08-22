import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

@Component({
  selector: 'app-markdown-message-component',
  imports: [],
  templateUrl: './markdown-message-component.html',
  styleUrl: './markdown-message-component.css'
})
export class MarkdownMessageComponent implements OnChanges {
    @Input() content = '';
    /** Set true to remove id="" from h1–h6 (to avoid anchor links). */
    @Input() stripHeadingIds = false;

    safeHtml: SafeHtml = '';

    constructor(private sanitizer: DomSanitizer) {
        // Marked v12+ supported options
        marked.setOptions({
            gfm: true,
            breaks: true,
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('content' in changes || 'stripHeadingIds' in changes) {
            const rawHtml = (marked.parse(this.content || '') as string) ?? '';

            // Sanitize first
            const clean = DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });

            // Optionally remove id attributes on headings (v12 may add them)
            const finalHtml = this.stripHeadingIds ? this.removeHeadingIds(clean) : clean;

            this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(finalHtml);
        }
    }

    /** Remove id="" from h1–h6 after sanitization (runs in the browser). */
    private removeHeadingIds(html: string): string {
        try {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            doc.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h => h.removeAttribute('id'));
            return doc.body.innerHTML;
        } catch {
            return html; // fallback if DOMParser unavailable
        }
    }
}