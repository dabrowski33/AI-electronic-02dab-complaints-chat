import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatContext {
  requestType: string;
  equipmentCategory: string;
  equipmentModel: string;
  purchaseDate: string;
  complaintReason?: string;
  imageConditionSummary: string;
  decisionResult: string;
  decisionJustification: string;
  rulesApplied: string[];
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/chat`;

  /**
   * Stream chat response from Spring Boot SSE endpoint (POST /api/chat → text/event-stream).
   * Uses the fetch + ReadableStream API — EventSource only supports GET,
   * so we use fetch for POST+SSE instead.
   */
  streamChat(messages: ChatMessage[], context: ChatContext): Observable<string> {
    return new Observable<string>((observer) => {
      const controller = new AbortController();
      const body = JSON.stringify({ messages, context });

      const pump = (reader: ReadableStreamDefaultReader<Uint8Array>, decoder: TextDecoder): Promise<void> =>
        reader.read().then(({ done, value }) => {
          if (done) { observer.complete(); return; }
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split('\n')) {
            const text = line.startsWith('data:') ? line.slice(5).trim() : null;
            if (text && text !== '[DONE]') observer.next(text);
          }
          return pump(reader, decoder);
        });

      fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: controller.signal,
      })
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return pump(response.body!.getReader(), new TextDecoder());
        })
        .catch((err) => {
          if (err.name !== 'AbortError') observer.error(err);
        });

      // Teardown: cancel fetch if the subscriber unsubscribes
      return () => controller.abort();
    });
  }
}
