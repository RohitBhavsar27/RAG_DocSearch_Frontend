// src/app/services/rag-api.service.ts
import { Injectable, inject } from '@angular/core';
import {
    HttpClient,
    HttpEvent,
    HttpEventType,
    HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface HealthResponse { status: 'ok'; message: string; }
export interface UploadResponse {
  filename: string;
  chunks_created: number;
  status: string;
  doc_id: string;          // <- NEW
}
export type UploadEvent =
    | { kind: 'sent' }
    | { kind: 'upload-progress'; progress: number }
    | { kind: 'processing' }
    | { kind: 'done'; data: UploadResponse };

export interface ChatResponse { answer: string; }

@Injectable({ providedIn: 'root' })
export class RagApiService {
    private http = inject(HttpClient);
    // If you use an Angular proxy, set this to ''.
    private base = environment.apiBase ?? '';

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
                    case HttpEventType.UploadProgress:
                        return {
                            kind: 'upload-progress',
                            progress: event.total ? Math.round((event.loaded / event.total) * 100) : 0,
                        };
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
}
