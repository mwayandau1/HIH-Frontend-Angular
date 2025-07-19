import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { of, throwError, Subject } from 'rxjs';
import { UserEffects } from './user.effects';
import * as UserActions from '../actions/user.actions';
import { UserService } from '@core/services/user/user.service';
import { UserProfile, Gender, UserResponse } from '@shared/models';
import { Action } from '@ngrx/store';

const mockUser: UserProfile = {
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

const mockUserResponse: UserResponse = {
  success: true,
  message: 'Fetched',
  data: mockUser,
  timestamp: '2024-01-01T00:00:00Z',
};

describe('UserEffects', () => {
  let actions$: Subject<Action>;
  let effects: UserEffects;
  let userService: jest.Mocked<UserService>;

  beforeEach(() => {
    actions$ = new Subject<Action>();
    userService = {
      getUserInfo: jest.fn(),
      changeUserPassword: jest.fn(),
      updateUserInfo: jest.fn(),
      updateMfa: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      toggleStatus: jest.fn(),
      getUsers: jest.fn(),
      deleteUser: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    TestBed.configureTestingModule({
      providers: [
        UserEffects,
        provideMockActions(() => actions$),
        { provide: UserService, useValue: userService },
      ],
    });

    effects = TestBed.inject(UserEffects);
  });

  it('should dispatch loadUserProfileSuccess on successful user fetch', (done) => {
    userService.getUserInfo.mockReturnValue(of(mockUserResponse));
    effects.loadUserProfile$.subscribe((result) => {
      expect(result).toEqual(UserActions.loadUserProfileSuccess({ data: mockUser }));
      done();
    });
    actions$.next(UserActions.loadUserProfile());
  });

  it('should dispatch loadUserProfileFailure on error', (done) => {
    userService.getUserInfo.mockReturnValue(throwError(() => ({ message: 'Failed' })));
    effects.loadUserProfile$.subscribe((result) => {
      expect(result).toEqual(UserActions.loadUserProfileFailure({ error: 'Failed' }));
      done();
    });
    actions$.next(UserActions.loadUserProfile());
  });
});
