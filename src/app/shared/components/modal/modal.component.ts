import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent, LucideAngularModule],
  templateUrl: './modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  public readonly title = input.required<string>();
  public readonly loading = input<boolean>(false);
  public readonly subTitle = input<string>('');
  public readonly isOpen = input<boolean>(false);
  public readonly closeModal = output<Event>();
  protected readonly closeIcon = X;
  public readonly primaryButtonText = input<string>('');
  public readonly secondaryButtonText = input<string>('');

  public readonly primaryButtonClick = output<Event>();
  public readonly secondaryButtonClick = output<Event>();
}
