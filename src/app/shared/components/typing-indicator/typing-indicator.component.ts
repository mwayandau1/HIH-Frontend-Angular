/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-typing-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './typing-indicator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypingIndicatorComponent {
  public readonly typingUsers = input<Map<string, boolean>>(new Map());
  public readonly name = input.required<string>();

  get typingText(): string {
    const typingUserIds = Array.from(this.typingUsers().entries())
      .filter(([_, isTyping]) => isTyping)
      .map(([userId, _]) => userId);

    if (typingUserIds.length === 0) return '';
    if (typingUserIds.length === 1) return `${this.name()} is typing...`;
    return `${typingUserIds.length} people are typing...`;
  }
}
