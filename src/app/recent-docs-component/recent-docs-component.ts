import { Component, EventEmitter, Output, inject } from '@angular/core';
import { RecentDocsService, RecentDoc } from '../services/recent-docs-service';
// ✅ Import the standalone pipes you use in the template
import { AsyncPipe, DatePipe, DecimalPipe, CommonModule } from '@angular/common';

@Component({
    selector: 'app-recent-docs-component',
    imports: [AsyncPipe, DatePipe, DecimalPipe, CommonModule],
    templateUrl: './recent-docs-component.html',
    styleUrl: './recent-docs-component.css'
})
export class RecentDocsComponent {
    private svc = inject(RecentDocsService);
    docs$ = this.svc.docs$;

    @Output() select = new EventEmitter<RecentDoc>();

    onOpen(d: RecentDoc) { this.select.emit(d); }
    onRemove(i: number) { this.svc.removeByIndex(i); }
    onClear() { this.svc.clear(); }
}
