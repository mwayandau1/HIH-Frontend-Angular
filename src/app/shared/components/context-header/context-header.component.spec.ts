import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContextHeaderComponent } from './context-header.component';

describe('ContextHeaderComponent', () => {
  let component: ContextHeaderComponent;
  let fixture: ComponentFixture<ContextHeaderComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContextHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContextHeaderComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.componentRef.setInput('icon', 'test-icon.png');
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.componentRef.setInput('subtitle', 'Test Subtitle');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct title', () => {
    const titleElement = element.querySelector('h2');
    expect(titleElement?.textContent).toBe('Test Title');
  });

  it('should display the correct subtitle', () => {
    const subtitleElement = element.querySelector('p');
    expect(subtitleElement?.textContent).toBe('Test Subtitle');
  });

  it('should display the correct icon', () => {
    const imgElement = element.querySelector('img') as HTMLImageElement;
    expect(imgElement.src).toContain('test-icon.png');
    expect(imgElement.alt).toBe('Test Title icon');
  });

  it('should apply default icon size styles', () => {
    const imgElement = element.querySelector('img');
    expect(imgElement?.style.width).toBe('24px');
    expect(imgElement?.style.height).toBe('24px');
  });

  it('should update icon size when input changes', () => {
    fixture.componentRef.setInput('iconSize', 32);
    fixture.detectChanges();

    const imgElement = element.querySelector('img');
    expect(imgElement?.style.width).toBe('32px');
    expect(imgElement?.style.height).toBe('32px');
  });

  it('should render ng-content', () => {
    const testContent = document.createElement('div');
    testContent.textContent = 'Test Content';
    element.appendChild(testContent);
    fixture.detectChanges();

    expect(element.textContent).toContain('Test Content');
  });

  it('should update when inputs change', () => {
    fixture.componentRef.setInput('title', 'New Title');
    fixture.componentRef.setInput('subtitle', 'New Subtitle');
    fixture.componentRef.setInput('icon', 'new-icon.png');
    fixture.detectChanges();

    const titleElement = element.querySelector('h2');
    const subtitleElement = element.querySelector('p');
    const imgElement = element.querySelector('img') as HTMLImageElement;

    expect(titleElement?.textContent).toBe('New Title');
    expect(subtitleElement?.textContent).toBe('New Subtitle');
    expect(imgElement.src).toContain('new-icon.png');
    expect(imgElement.alt).toBe('New Title icon');
  });
});
