import { createAction, props } from '@ngrx/store';
import { UserProfile } from '@shared/models';

export const loadUserProfile = createAction('[User] Load Profile');
export const loadUserProfileSuccess = createAction(
  '[User] Load Profile Success',
  props<{ data: UserProfile }>(),
);
export const loadUserProfileFailure = createAction(
  '[User] Load Profile Failure',
  props<{ error: string }>(),
);
