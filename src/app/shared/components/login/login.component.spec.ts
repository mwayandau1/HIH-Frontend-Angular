import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPageComponent } from './login.component';
import { provideHttpClient } from '@angular/common/http';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render the login page', () => {
    expect(component).toBeTruthy();
  });
});
