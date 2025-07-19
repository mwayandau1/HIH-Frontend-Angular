import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemedLoaderComponent } from './themed-loader.component';

describe('ThemedLoaderComponent', () => {
  let component: ThemedLoaderComponent;
  let fixture: ComponentFixture<ThemedLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemedLoaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemedLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render loader component', () => {
    expect(component).toBeTruthy();
  });
});
