import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsHeadingComponent } from './settings-heading.component';

describe('SettingsHeadingComponent', () => {
  let component: SettingsHeadingComponent;
  let fixture: ComponentFixture<SettingsHeadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsHeadingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsHeadingComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Settings');
    fixture.componentRef.setInput('description', 'Manage your settings here');
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });
});
