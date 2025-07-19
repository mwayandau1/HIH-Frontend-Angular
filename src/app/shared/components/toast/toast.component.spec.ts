import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastComponent } from './toast.component';
import { Toast } from '@shared/models/toast';
import { ButtonComponent } from '../button/button.component';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastComponent, CommonModule, ButtonComponent, LucideAngularModule],
    });

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should add a toast message', () => {
    const toast: Omit<Toast, 'id'> = {
      title: 'Test Title',
      message: 'This is a test message',
      type: 'info',
    };

    component.addMessage(toast);

    const currentToasts = component['toasts']();
    expect(currentToasts.length).toBe(1);
    expect(currentToasts[0].title).toBe('Test Title');
    expect(currentToasts[0].message).toBe('This is a test message');
    expect(currentToasts[0].type).toBe('info');
  });

  it('should remove a toast after 5 seconds', fakeAsync(() => {
    const toast: Omit<Toast, 'id'> = {
      title: 'Auto Remove',
      message: 'Will disappear',
      type: 'success',
    };

    component.addMessage(toast);
    expect(component['toasts']().length).toBe(1);

    tick(5000);
    expect(component['toasts']().length).toBe(0);
  }));

  it('should manually remove a toast', () => {
    const toast: Omit<Toast, 'id'> = {
      title: 'Manual Remove',
      message: 'Should be removed',
      type: 'warning',
    };

    component.addMessage(toast);
    const addedToast = component['toasts']()[0];

    component.removeToast(addedToast.id);
    expect(component['toasts']().length).toBe(0);
  });
});
