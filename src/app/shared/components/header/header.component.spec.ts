import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { loadUserProfile } from '@core/store';
import { LucideAngularModule } from 'lucide-angular';
import { UserProfile, Gender } from '@shared/models';

const mockUserProfile: UserProfile = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phoneNumber: '+1234567890',
  dateOfBirth: '11/11/1111',
  bio: '',
  gender: Gender.Male,
  profilePictureUrl: '',
  residentialAddress: 'Nowhere',
  twoFactorEnabled: false,
  twoFactorMethod: 'EMAIL',
  roles: [],
  title: 'Mr.',
  department: 'General',
  licenseNumber: '12345',
};

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent, LucideAngularModule],
      providers: [
        provideMockStore({
          initialState: {
            user: {
              data: mockUserProfile,
              loading: false,
              error: null,
            },
          },
        }),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch loadUserProfile on init', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    component.ngOnInit();
    expect(dispatchSpy).toHaveBeenCalledWith(loadUserProfile());
  });

  it('should render user name from store', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('John Doe');
  });

  it('should handle null user data gracefully', () => {
    store.setState({
      user: {
        data: null,
        loading: false,
        error: null,
      },
    });
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    // Should not throw, and should not render a name
    expect(compiled.textContent).not.toContain('John Doe');
  });
});
