import { userReducer, initialUserState } from './user.reducer';
import * as UserActions from '../actions/user.actions';
import { UserProfile, Gender, UserState } from '@shared/models';
import { Action } from '@ngrx/store';

describe('userReducer', () => {
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

  it('should return the initial state', () => {
    const state = userReducer(undefined, { type: '@@INIT' } as Action);
    expect(state).toEqual(initialUserState);
  });

  it('should set loading true and clear error on loadUserProfile', () => {
    const prevState: UserState = { ...initialUserState, error: 'Some error' };
    const state = userReducer(prevState, UserActions.loadUserProfile());
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should set user data and loading false on loadUserProfileSuccess', () => {
    const prevState: UserState = { ...initialUserState, loading: true };
    const state = userReducer(prevState, UserActions.loadUserProfileSuccess({ data: mockUser }));
    expect(state.data).toEqual(mockUser);
    expect(state.loading).toBe(false);
  });

  it('should set error and loading false on loadUserProfileFailure', () => {
    const prevState: UserState = { ...initialUserState, loading: true };
    const state = userReducer(prevState, UserActions.loadUserProfileFailure({ error: 'Failed' }));
    expect(state.error).toBe('Failed');
    expect(state.loading).toBe(false);
  });
});
