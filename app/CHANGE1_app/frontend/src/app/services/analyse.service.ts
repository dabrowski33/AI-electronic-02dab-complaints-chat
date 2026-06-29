import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AnalyseRequest {
  requestType: 'reklamacja' | 'zwrot';
  equipmentCategory: string;
  equipmentModel: string;
  purchaseDate: string;
  complaintReason?: string;
  imageBase64: string;
  imageMimeType: string;
}

export interface ImageAnalysisResult {
  status: 'ok' | 'unreadable';
  conditionSummary: string;
  damagePresent: boolean;
  damageType: string | null;
  likelyCause: string | null;
  signsOfUse: boolean | null;
  resalable: boolean | null;
  unreadableReason: string | null;
}

export interface AgentDecision {
  decision: 'zaakceptowano' | 'odrzucono' | 'wymaga_weryfikacji';
  justification: string;
  rulesApplied: string[];
  nextSteps: string[];
  disclaimer: string;
}

export interface AnalyseResponse {
  imageAnalysis: ImageAnalysisResult;
  decision: AgentDecision;
}

@Injectable({ providedIn: 'root' })
export class AnalyseService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/analyse`;

  analyse(request: AnalyseRequest): Observable<AnalyseResponse> {
    return this.http.post<AnalyseResponse>(this.apiUrl, request);
  }

  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
