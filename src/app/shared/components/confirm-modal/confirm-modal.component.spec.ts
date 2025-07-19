import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmModalComponent } from './confirm-modal.component';
import { Role, User } from '@shared/models';
import { By } from '@angular/platform-browser';

describe('ConfirmModalComponent', () => {
  let component: ConfirmModalComponent;
  let fixture: ComponentFixture<ConfirmModalComponent>;

  const testUser: User = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    active: true,
    roles: [],
    department: 'NA',
  };

  const testRole: Role = {
    id: 1,
    name: 'Administrator',
    permissions: [],
    active: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('displayName()', () => {
    it('should return firstName for User', () => {
      fixture.componentRef.setInput('pendingAction', testUser);
      expect(component.displayName()).toBe('John');
    });

    it('should return name for Role', () => {
      fixture.componentRef.setInput('pendingAction', testRole);
      expect(component.displayName()).toBe('Administrator');
    });

    it('should return empty string for null', () => {
      fixture.componentRef.setInput('pendingAction', null);
      expect(component.displayName()).toBe('');
    });
  });

  describe('UI Rendering', () => {
    it('should not render modal if isOpen is false', () => {
      fixture.componentRef.setInput('isOpen', false);

      fixture.detectChanges();
      const modal = fixture.debugElement.query(By.css('.fixed'));
      expect(modal).toBeFalsy();
    });

    it('should render modal with user displayName', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('pendingAction', testUser);
      fixture.componentRef.setInput('confirmationAction', 'toggle-status');
      fixture.detectChanges();

      const heading = fixture.debugElement.query(By.css('h2')).nativeElement.textContent;
      expect(heading).toContain('Deactivate');
      expect(heading).toContain('John');
    });

    it('should render modal with role displayName', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('pendingAction', testRole);
      fixture.componentRef.setInput('confirmationAction', 'toggle-status');
      fixture.detectChanges();

      const heading = fixture.debugElement.query(By.css('h2')).nativeElement.textContent;
      expect(heading).toContain('Activate');
      expect(heading).toContain('Administrator');
    });

    it('should show delete action text', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('pendingAction', testUser);
      fixture.componentRef.setInput('confirmationAction', 'delete');
      fixture.detectChanges();

      const heading = fixture.debugElement.query(By.css('h2')).nativeElement.textContent;
      expect(heading).toContain('Delete');
    });
  });

  describe('Button Interactions', () => {
    it('should emit closeConfirmationModal on cancel click', () => {
      const spy = jest.spyOn(component.closeConfirmationModal, 'emit');
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('pendingAction', testUser);
      fixture.componentRef.setInput('confirmationAction', 'delete');
      fixture.detectChanges();

      const cancelButton = fixture.debugElement.queryAll(By.css('app-button'))[0];
      cancelButton.triggerEventHandler('clickEvent', new Event('click'));

      expect(spy).toHaveBeenCalled();
    });

    it('should emit confirmAction on confirm click', () => {
      const spy = jest.spyOn(component.confirmAction, 'emit');

      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('pendingAction', testUser);
      fixture.componentRef.setInput('confirmationAction', 'delete');
      fixture.detectChanges();

      const confirmButton = fixture.debugElement.queryAll(By.css('app-button'))[1];
      confirmButton.triggerEventHandler('clickEvent', new Event('click'));

      expect(spy).toHaveBeenCalled();
    });

    it('should disable confirm button when loading is true', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('pendingAction', testUser);
      fixture.componentRef.setInput('confirmationAction', 'delete');
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const confirmButton = fixture.debugElement.queryAll(By.css('app-button'))[1];
      expect(confirmButton.componentInstance.disabled()).toBe(true);
    });
  });
});
