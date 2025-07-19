import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';
import { CommonModule } from '@angular/common';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;
  let buttonEl: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Click Me');
    buttonEl = fixture.debugElement.query(By.css('button'));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('handleClick', () => {
    it('should emit clickEvent when called', () => {
      const mockEvent = new Event('click');
      jest.spyOn(component.clickEvent, 'emit');

      component['handleClick'](mockEvent);

      expect(component.clickEvent.emit).toHaveBeenCalledWith(mockEvent);
    });

    it('should emit clickEvent when button is clicked', () => {
      const emitSpy = jest.spyOn(component.clickEvent, 'emit');
      buttonEl.triggerEventHandler('click', new Event('click'));
      expect(emitSpy).toHaveBeenCalled();
    });

    it('should not emit when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const emitSpy = jest.spyOn(component.clickEvent, 'emit');
      buttonEl.triggerEventHandler('click', new Event('click'));
      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('Input bindings', () => {
    it('should set the button title', () => {
      const testTitle = 'Test Button';
      fixture.componentRef.setInput('title', testTitle);
      fixture.detectChanges();
      expect(buttonEl.attributes['title']).toEqual(testTitle);
    });

    it('should set the button type', () => {
      fixture.componentRef.setInput('type', 'submit');
      fixture.detectChanges();
      expect(buttonEl.nativeElement.type).toBe('submit');
    });

    it('should apply disabled attribute when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(buttonEl.nativeElement.disabled).toBe(true);
    });
  });
});
