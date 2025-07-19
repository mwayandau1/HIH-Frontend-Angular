import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { UserService } from '@core/services/user/user.service';
import * as UserActions from '../actions/user.actions';
import { catchError, map, mergeMap, of } from 'rxjs';

@Injectable()
export class UserEffects {
  private readonly actions$ = inject(Actions);
  private readonly userService = inject(UserService);

  loadUserProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUserProfile),
      mergeMap(() =>
        this.userService.getUserInfo().pipe(
          map((res) => UserActions.loadUserProfileSuccess({ data: res.data })),
          catchError((error) => {
            return of(UserActions.loadUserProfileFailure({ error: error.message }));
          }),
        ),
      ),
    ),
  );
}
