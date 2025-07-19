import { ActionReducerMap } from '@ngrx/store';
import { AppState } from '../app.state';
import { userReducer } from './user.reducer';

export const reducers: ActionReducerMap<AppState> = {
  user: userReducer,
};
