import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface HealthResponse { status: 'ok'; message: string; }
export interface UploadResponse {
    filename: string;
    chunks_created: number;
    status: string;
    doc_id: string;
    pdf_url: string;
}
export type UploadEvent =
    | { kind: 'sent' }
    | { kind: 'upload-progress'; progress: number }
    | { kind: 'processing' }
    | { kind: 'done'; data: UploadResponse };

export interface BackendCitation {
    title: string;
    page: number;
    snippet: string;
    pdf_url: string;     // relative to backend origin
}
export interface ChatResponse {
    answer: string;
    citations?: BackendCitation[];
}

@Injectable({ providedIn: 'root' })
export class RagApiService {
    private http = inject(HttpClient);
    private base = environment.apiBase ?? ''; // e.g. 'http://127.0.0.1:8000'

    health(): Observable<HealthResponse> {
        return this.http.get<HealthResponse>(`${this.base}/api/health`);
    }

    uploadDocument(file: File): Observable<UploadEvent> {
        const form = new FormData();
        form.append('file', file, file.name);

        const req = new HttpRequest('POST', `${this.base}/api/upload`, form, {
            reportProgress: true,
            responseType: 'json',
        });

        return this.http.request<UploadResponse>(req).pipe(
            map((event: HttpEvent<UploadResponse>): UploadEvent => {
                switch (event.type) {
                    case HttpEventType.Sent:
                        return { kind: 'sent' };
                    case HttpEventType.UploadProgress: {
                        const total = (event.total ?? file.size ?? 1);
                        const loaded = (event.loaded ?? 0);
                        const pct = Math.min(100, Math.round((loaded / total) * 100));
                        return { kind: 'upload-progress', progress: pct };
                    }
                    case HttpEventType.Response:
                        return { kind: 'done', data: event.body as UploadResponse };
                    default:
                        return { kind: 'processing' };
                }
            })
        );
    }

    chat(question: string, docId: string) {
        return this.http.post<ChatResponse>(
            `${this.base}/api/chat`,
            { question, doc_id: docId },
            { headers: { 'Content-Type': 'application/json' } }
        );
    }

    // api-service.ts
    absolutePdfUrl(rel: string) {
        if (!rel) return '';
        if (rel.startsWith('http')) return rel;
        return `${this.base}${rel}`; // base = http://127.0.0.1:8000
    }

}
