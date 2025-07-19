import { Injectable } from '@angular/core';
import {
  genericResponses,
  keywordResponses,
  responsePatterns,
} from '@shared/constants/smart-reply';

@Injectable({ providedIn: 'root' })
export class SmartReplyService {
  private readonly keywordResponses = keywordResponses;
  private readonly genericResponses = genericResponses;
  get responsePatterns() {
    return responsePatterns;
  }

  public generateSmartReplies(lastMessage: string): string[] {
    if (!lastMessage) return this.getGreetings();

    const lowerMessage = lastMessage.toLowerCase();

    for (const { pattern, responses } of this.responsePatterns) {
      if (pattern.test(lowerMessage)) return this.shuffleArray([...responses]).slice(0, 3);
    }

    for (const [keyword, responses] of Object.entries(this.keywordResponses)) {
      if (lowerMessage.includes(keyword)) return this.shuffleArray([...responses]).slice(0, 3);
    }

    return this.shuffleArray([...this.genericResponses]).slice(0, 3);
  }

  private getGreetings(): string[] {
    return this.shuffleArray([...this.keywordResponses['hello']]);
  }

  private shuffleArray(array: string[]): string[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); //NOSONAR
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
