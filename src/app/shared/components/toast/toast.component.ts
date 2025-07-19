import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Toast } from '@shared/models/toast';
import { LucideAngularModule, X } from 'lucide-angular';
import { ButtonComponent } from '../button/button.component';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ButtonComponent],
  templateUrl: './toast.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 })),
      ]),
    ]),
  ],
})
export class ToastComponent {
  protected readonly icons = { X };
  protected readonly toasts = signal<Toast[]>([]);

  public addMessage(toast: Omit<Toast, 'id'>) {
    const id = Date.now();
    this.toasts.update((prev) => [...prev, { ...toast, id }]);

    setTimeout(() => this.removeToast(id), 5000);
  }

  public removeToast(id: number) {
    this.toasts.update((prev) => prev.filter((toast) => toast.id !== id));
  }
}
