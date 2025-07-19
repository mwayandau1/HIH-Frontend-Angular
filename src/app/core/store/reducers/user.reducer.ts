import { createReducer, on } from '@ngrx/store';
import * as UserActions from '../actions/user.actions';
import { UserState } from '@shared/models';

export const initialUserState: UserState = {
  data: null,
  loading: false,
  error: null,
};

export const userReducer = createReducer(
  initialUserState,
  on(UserActions.loadUserProfile, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UserActions.loadUserProfileSuccess, (state, { data }) => ({
    ...state,
    data,
    loading: false,
  })),
  on(UserActions.loadUserProfileFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),
);
