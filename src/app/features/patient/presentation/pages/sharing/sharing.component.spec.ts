import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharingPageComponent } from './sharing.component';

describe('SharingPageComponent', () => {
  let component: SharingPageComponent;
  let fixture: ComponentFixture<SharingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharingPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SharingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });
});
