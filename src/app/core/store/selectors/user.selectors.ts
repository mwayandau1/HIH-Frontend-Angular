import { createSelector } from '@ngrx/store';

import { AppState } from '../app.state';

export const selectUserState = (state: AppState) => state.user;

export const selectUserProfile = createSelector(selectUserState, (state) => state.data);

export const selectUserLoading = createSelector(selectUserState, (state) => state.loading);

export const selectUserError = createSelector(selectUserState, (state) => state.error);
