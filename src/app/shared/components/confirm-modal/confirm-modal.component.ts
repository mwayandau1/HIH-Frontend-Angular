import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { CommonModule } from '@angular/common';
import { Role, User } from '@shared/models';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [ButtonComponent, CommonModule],
  templateUrl: './confirm-modal.component.html',
})
export class ConfirmModalComponent {
  public readonly isOpen = input.required<boolean>();
  public readonly pendingAction = input.required<Role | User | null>();
  public readonly confirmationAction = input.required<'toggle-status' | 'delete' | null>();

  public readonly loading = input<boolean>(false);
  public readonly confirmAction = output<Event>();
  public readonly closeConfirmationModal = output<Event>();

  displayName(): string {
    const action = this.pendingAction();

    if (action && 'firstName' in action) {
      return action.firstName;
    }
    if (action && 'name' in action) {
      return action.name;
    }
    return '';
  }
}
