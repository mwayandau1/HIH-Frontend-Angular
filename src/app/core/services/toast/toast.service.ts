import { Injectable } from '@angular/core';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { ToastAction, ToastType } from '@shared/models/toast';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastRef?: ToastComponent;

  public register(toast: ToastComponent) {
    this.toastRef = toast;
  }

  public show(
    title: string,
    type: ToastType = 'info',
    message?: string,
    actions?: ToastAction[],
    triggerBy?: { name: string; imageSrc: string },
  ) {
    this.toastRef?.addMessage({ title, message, type, actions, triggerBy });
  }
}
