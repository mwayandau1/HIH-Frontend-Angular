import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsPageComponent } from './settings.component';
import { provideHttpClient } from '@angular/common/http';

describe('SettingsPageComponent', () => {
  let component: SettingsPageComponent;
  let fixture: ComponentFixture<SettingsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsPageComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render the logs page', () => {
    expect(component).toBeTruthy();
  });
});
