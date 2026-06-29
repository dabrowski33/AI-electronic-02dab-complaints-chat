import {
  Component, inject, OnInit, OnDestroy,
  ViewChild, ElementRef, AfterViewChecked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';

import { ChatService, ChatMessage, ChatContext } from '../../services/chat.service';
import { MessageBubbleComponent } from '../message-bubble/message-bubble.component';

@Component({
  selector: 'app-chat-interface',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MessageBubbleComponent,
  ],
  templateUrl: './chat-interface.component.html',
  styleUrl: './chat-interface.component.scss',
})
export class ChatInterfaceComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageList') private messageListEl!: ElementRef;

  private chatService = inject(ChatService);
  private streamSub?: Subscription;

  messages: ChatMessage[] = [];
  inputText = '';
  isLoading = false;
  context!: ChatContext;

  ngOnInit(): void {
    const raw = sessionStorage.getItem('copilot_session');
    if (raw) {
      const session = JSON.parse(raw);
      this.context = {
        requestType: session.formData.requestType,
        equipmentCategory: session.formData.equipmentCategory,
        equipmentModel: session.formData.equipmentModel,
        purchaseDate: session.formData.purchaseDate,
        complaintReason: session.formData.complaintReason,
        imageConditionSummary: session.imageAnalysis.conditionSummary,
        decisionResult: session.decision.decision,
        decisionJustification: session.decision.justification,
        rulesApplied: session.decision.rulesApplied,
      };

      this.messages.push({
        role: 'assistant',
        content: this.buildDecisionMessage(session.decision),
      });
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.streamSub?.unsubscribe();
  }

  sendMessage(): void {
    const text = this.inputText.trim();
    if (!text || this.isLoading) return;

    this.messages.push({ role: 'user', content: text });
    this.inputText = '';
    this.isLoading = true;

    const assistantMsg: ChatMessage = { role: 'assistant', content: '' };
    this.messages.push(assistantMsg);

    this.streamSub = this.chatService.streamChat(this.messages.slice(0, -1), this.context)
      .subscribe({
        next: (chunk) => { assistantMsg.content += chunk; },
        error: () => {
          assistantMsg.content = 'Błąd połączenia. Spróbuj ponownie.';
          this.isLoading = false;
        },
        complete: () => { this.isLoading = false; },
      });
  }

  newSession(): void {
    sessionStorage.removeItem('copilot_session');
    window.location.href = '/';
  }

  private buildDecisionMessage(decision: { decision: string; justification: string; nextSteps: string[]; disclaimer: string }): string {
    const label = { zaakceptowano: 'Zaakceptowano', odrzucono: 'Odrzucono', wymaga_weryfikacji: 'Wymaga weryfikacji' }[decision.decision] ?? decision.decision;
    const steps = decision.nextSteps?.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n') ?? '';
    return `**Decyzja: ${label}**\n\n${decision.justification}\n\n**Kolejne kroki:**\n${steps}\n\n_${decision.disclaimer}_`;
  }

  private scrollToBottom(): void {
    if (this.messageListEl) {
      const el = this.messageListEl.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
