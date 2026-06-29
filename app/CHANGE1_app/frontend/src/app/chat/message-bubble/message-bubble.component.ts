import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { ChatMessage } from '../../services/chat.service';

@Component({
  selector: 'app-message-bubble',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule],
  templateUrl: './message-bubble.component.html',
  styleUrl: './message-bubble.component.scss',
})
export class MessageBubbleComponent {
  @Input({ required: true }) message!: ChatMessage;

  get isUser(): boolean {
    return this.message.role === 'user';
  }

  /** Render newlines as HTML breaks for display. */
  get formattedContent(): string {
    return this.message.content.replace(/\n/g, '<br>');
  }
}
