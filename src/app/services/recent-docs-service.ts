import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface RecentDoc {
    name: string;
    size: number;
    uploadedAt: string;
    chunks?: number;
    docId: string;           // <- NEW
}


const STORAGE_KEY = 'recentDocs.v1';
const MAX_ITEMS = 10;

@Injectable({ providedIn: 'root' })
export class RecentDocsService {
    private _docs$ = new BehaviorSubject<RecentDoc[]>(this.load());
    readonly docs$ = this._docs$.asObservable();

    add(doc: RecentDoc) {
        const list = [doc, ...this._docs$.value.filter(d => d.name !== doc.name)];
        const trimmed = list.slice(0, MAX_ITEMS);
        this.save(trimmed);
    }

    removeByIndex(i: number) {
        const list = this._docs$.value.filter((_, idx) => idx !== i);
        this.save(list);
    }

    clear() { this.save([]); }

    private save(list: RecentDoc[]) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        this._docs$.next(list);
    }

    private load(): RecentDoc[] {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
        catch { return []; }
    }
}
