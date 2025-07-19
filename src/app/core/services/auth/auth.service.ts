import { inject, Injectable } from '@angular/core';
import { interval, Observable, of, Subscription, switchMap, takeWhile, tap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { LoginRequest, LoginResponse, Role } from '@shared/models/auth';
import { UserRole } from '@shared/models/userRoles';
import { endpoints } from '@shared/constants/endpoints';
import { environment } from '@core/environments/environments';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiService = inject(ApiService);
  private readonly endpoints = endpoints.auth;
  private readonly baseUrl = environment.gatewayUrl;
  private readonly tokenCheckInterval = 60000;
  private tokenCheckSubscription?: Subscription;

  public login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.apiService
      .post<LoginResponse>(this.baseUrl, this.endpoints.login, credentials)
      .pipe(
        tap((res) => {
          localStorage.setItem('accessToken', res.accessToken);
          localStorage.setItem('user', JSON.stringify(res.roles));
          this.startTokenExpirationCheck();
        }),
      );
  }

  public logout(): void {
    this.stopTokenExpirationCheck();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }

  public isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  public getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  public getUserRole(): UserRole | null {
    try {
      const userJson = localStorage.getItem('user') ?? '[]';
      const user = JSON.parse(userJson);
      const userRoles = user.map((role: Role) => role.name);

      if (!userRoles.length) return null;
      if (userRoles.includes('ADMIN')) return UserRole.Admin;
      return userRoles[0].toLowerCase() as UserRole;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  public sendVerificationCode(email: string): Observable<void> {
    return this.apiService.post(this.baseUrl, this.endpoints.initaitePasswordReset(email));
  }

  public resendVerificationCode(email: string): Observable<void> {
    return this.apiService.post(this.baseUrl, this.endpoints.verificationCodeResend(email));
  }

  public verifyCode(token: string): Observable<void> {
    return this.apiService.post(this.baseUrl, this.endpoints.verifyCode(token));
  }

  public setPassword(token: string, password: string): Observable<void> {
    return this.apiService.post(this.baseUrl, this.endpoints.setPassword, { token, password });
  }

  public startTokenExpirationCheck(): void {
    this.stopTokenExpirationCheck();

    this.tokenCheckSubscription = interval(this.tokenCheckInterval)
      .pipe(
        switchMap(() => {
          if (!this.isAuthenticated()) {
            this.logout();
            return of(null);
          }
          return of(true);
        }),
        takeWhile((val) => val !== null),
      )
      .subscribe();
  }

  public stopTokenExpirationCheck(): void {
    if (this.tokenCheckSubscription) {
      this.tokenCheckSubscription.unsubscribe();
      this.tokenCheckSubscription = undefined;
    }
  }
}
