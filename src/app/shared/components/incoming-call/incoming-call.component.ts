import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Phone, Video } from 'lucide-angular';
import { ButtonComponent } from '@shared/components';

@Component({
  selector: 'app-incoming-call-notification',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ButtonComponent],
  templateUrl: './incoming-call.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomingCallNotificationComponent {
  public readonly callerName = input.required<string>();
  public readonly isVideoCall = input.required<boolean>();
  public readonly accept = output<void>();
  public readonly decline = output<void>();

  protected readonly icons = { Phone, Video };

  protected getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
