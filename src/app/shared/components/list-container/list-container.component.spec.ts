import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListContainerComponent } from './list-container.component';
import { ButtonComponent } from '../button/button.component';
import { ContextHeaderComponent } from '../context-header/context-header.component';
import { CommonModule } from '@angular/common';

describe('ListContainerComponent', () => {
  let component: ListContainerComponent;
  let fixture: ComponentFixture<ListContainerComponent>;
  const mockEvent = new Event('test-event');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListContainerComponent, ButtonComponent, ContextHeaderComponent, CommonModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ListContainerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('icon', 'test-icon');
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.componentRef.setInput('subtitle', 'Test Subtitle');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have required inputs', () => {
    fixture.detectChanges();
    expect(component.icon()).toBe('test-icon');
    expect(component.title()).toBe('Test Title');
    expect(component.subtitle()).toBe('Test Subtitle');
  });

  it('should use default button variants', () => {
    expect(component.primaryButtonVariant()).toBe('primary');
    expect(component.secondaryButtonVariant()).toBe('secondary');
  });

  it('should emit primaryButtonClick event', () => {
    const spy = jest.fn();
    component.primaryButtonClick.subscribe(spy);
    component.primaryButtonClick.emit(mockEvent);
    expect(spy).toHaveBeenCalled();
  });

  it('should emit secondaryButtonClick event', () => {
    const spy = jest.fn();
    component.secondaryButtonClick.subscribe(spy);
    component.secondaryButtonClick.emit(mockEvent);
    expect(spy).toHaveBeenCalled();
  });

  it('should accept optional button inputs', () => {
    fixture.componentRef.setInput('primaryButtonText', 'Primary');
    fixture.componentRef.setInput('primaryButtonTitle', 'Primary Title');
    fixture.componentRef.setInput('secondaryButtonText', 'Secondary');
    fixture.componentRef.setInput('secondaryButtonTitle', 'Secondary Title');

    fixture.detectChanges();
    expect(component.primaryButtonText()).toBe('Primary');
    expect(component.primaryButtonTitle()).toBe('Primary Title');
    expect(component.secondaryButtonText()).toBe('Secondary');
    expect(component.secondaryButtonTitle()).toBe('Secondary Title');
  });
});
