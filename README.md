# DocuMentor — RAG Chatbot UI (Angular)
A modern, responsive UI to chat with your PDFs. Upload a document, ask questions, and see page-level citations with an inline PDF preview. Built with Angular standalone components and Tailwind CSS.

This repo contains the frontend only. The backend (FastAPI) lives in a separate repository and exposes `/api/*` endpoints.

## ✨ Features
- Two-pane layout: Left = Document manager. Right = Chat.
- Upload with status: drag-and-drop + file picker, progress bar, “Processing…” state.
- Chat experience: user/AI bubbles, typing indicator, send button with accessibility focus ring.
- Prompt chips: one-click suggestions (e.g., Summarize, Key points).
- Citations UI: source chips under AI replies → opens a right-side drawer.
- PDF preview: inline viewer (lazy-loaded) showing the exact cited page.
- Export chat: download conversation in Markdown/JSON.
- Recent documents: quick list of your latest uploads; switch context by selecting a doc.
- Health indicator: quick backend connectivity check.

## 🧱 Tech Stack
- Angular 20.1.x (standalone components, new control flow `@if/@for`)
- Tailwind CSS utility-first styling (no SCSS required)
- ngx-extended-pdf-viewer (lazy-loaded) for inline PDF previews
- Markdown rendering for AI messages
- ChangeDetection.OnPush + clean, reusable components
- HttpClient (XHR backend) for upload progress & chat calls
  
## Architecture (high level)
```
AppComponent
├─ DocumentUploadComponent
│  ├─ RecentDocsComponent
│  └─ (emits) documentChange { name, docId }
└─ ChatComponent
   ├─ MarkdownMessageComponent
   ├─ PromptChipsComponent
   ├─ ExportDialogComponent
   ├─ HealthIndicatorComponent
   └─ CitationsDrawerComponent
       └─ PdfPreviewComponent (lazy-loaded wrapper for ngx-extended-pdf-viewer)
```

## ⚙️ Prerequisites
- Node.js 18+ and npm
- Backend running locally (default `http://localhost:8000`) or a deployed backend URL

## 🔧 Local Setup
```
# install deps
npm ci

# start dev server on http://localhost:4200
npm run start
# or: ng serve
```

### Environment configuration
Edit `src/environments/environment.ts` (dev) and 
`src/environments/environment.prod.ts` (prod):

```
// environment.ts (dev)
export const environment = {
  production: false,
  apiBase: 'http://localhost:8000'
};

// environment.prod.ts (prod)
export const environment = {
  production: true,
  apiBase: 'https://YOUR-BACKEND-ORIGIN' // e.g. https://rag-backend.onrender.com
};
```

## 🧩 Key Components & Services

- `DocumentUploadComponent`
  - Handles file selection & drag-drop.
  - Shows upload progress (`HttpClient` progress events).
  - Emits `{ name, docId }` on successful upload to set active chat context.

- `ChatComponent`
  - Keeps a `messages` array `({ role: 'user'|'ai', content, citations? })`.
  - Calls `RagApiService.chat(question, docId)` and renders AI replies.
  - Renders source chips; clicking opens `CitationsDrawerComponent`.

- `CitationsDrawerComponent`
  - Right-side drawer with snippet, page number, and inline PDF.
  - Uses a lazy-loaded `PdfPreviewComponent` (to keep initial bundle small).
    
- `RagApiService`
  - `health()` → `GET /api/health`
  - `uploadDocument(file)` → `POST /api/upload` (multipart, emits progress)
  - `chat(question, docId)` → `POST /api/chat` → `{ answer, citations[] }`
 
## 📦 Building for Production
```
npm run build
# outputs to dist/<project-name>/browser
```

## API Contract (expected from backend)

- `POST /api/upload` → `200 OK`
```
{
  "filename": "report.pdf",
  "chunks_created": 33,
  "status": "Vector store created and saved successfully.",
  "doc_id": "abc123hex",
  "pdf_url": "/pdfs/abc123hex.pdf"
}
```

- `POST /api/chat` (body: `{ "question": ". . .", "doc_id": "abc123hex" })` → `200 OK`
```
{
  "answer": "…",
  "citations": [
    { "title": "report.pdf", "page": 3, "snippet": "…", "pdf_url": "/pdfs/abc123hex.pdf" }
  ]
}
```
