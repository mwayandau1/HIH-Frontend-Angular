import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Observable } from 'rxjs';
import {
  UserResponse,
  User,
  UserDataResponse,
  ProivderInfo,
  PatientInfo,
  FetchParams,
  ChangeUserPassword,
  PaginatedUserResponse,
} from '@shared/models';
import { endpoints } from '@shared/constants/endpoints';
import { environment } from '@core/environments/environments';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiService = inject(ApiService);
  private readonly endpoints = endpoints.user;

  private readonly baseUrl = environment.gatewayUrl;
  public getUserInfo(): Observable<UserResponse> {
    return this.apiService.get<UserResponse>(this.baseUrl, this.endpoints.getInfo);
  }

  public changeUserPassword({
    currentPassword,
    newPassword,
    confirmPassword,
  }: ChangeUserPassword): Observable<void> {
    return this.apiService.put(this.baseUrl, this.endpoints.updatePassword, {
      currentPassword,
      newPassword,
      confirmPassword,
    });
  }

  public updateUserInfo(userInfo: ProivderInfo | PatientInfo): Observable<void> {
    return this.apiService.put(this.baseUrl, this.endpoints.updateUserInfo, userInfo);
  }

  public updateMfa(enabled: boolean, method: string | null): Observable<UserResponse> {
    return this.apiService.put(this.baseUrl, this.endpoints.updateTwoFactor, {
      enabled,
      method,
    });
  }

  public createUser(userData: User): Observable<UserDataResponse> {
    return this.apiService.post<UserDataResponse>(
      this.baseUrl,
      this.endpoints.registerUser,
      userData,
    );
  }

  public updateUser(id: number, userData: User): Observable<UserDataResponse> {
    return this.apiService.put<UserDataResponse>(
      this.baseUrl,
      this.endpoints.handleUser(id),
      userData,
    );
  }

  public toggleStatus(id: number): Observable<UserDataResponse> {
    return this.apiService.put<UserDataResponse>(this.baseUrl, this.endpoints.handleStatus(id), {});
  }

  public getUsers(params?: FetchParams): Observable<UserDataResponse> {
    const queryParts: string[] = [];

    if (params?.sort?.length) {
      queryParts.push(...params.sort.map((param) => `sort=${param}`));
    }

    if (params?.department && params.department !== 'all') {
      queryParts.push(`department=${params.department}`);
    }

    if (params?.role && params.role !== 'all') {
      queryParts.push(`roles=${params.role}`);
    }

    if (typeof params?.active === 'boolean') {
      queryParts.push(`active=${params.active}`);
    }

    if (params?.search !== undefined) {
      queryParts.push(`searchTerm=${params.search}`);
    }

    if (params?.page !== undefined) {
      queryParts.push(`page=${params.page}`);
    }

    if (params?.size !== undefined) {
      queryParts.push(`size=${params.size}`);
    }

    const queryString = queryParts.length ? `?${queryParts.join('&')}` : '';
    return this.apiService.get<UserDataResponse>(
      this.baseUrl,
      this.endpoints.getUsers(queryString),
    );
  }

  public deleteUser(id: number): Observable<UserDataResponse> {
    return this.apiService.delete(this.baseUrl, this.endpoints.handleUser(id));
  }

  public getProvidersAndPatients(params?: FetchParams): Observable<PaginatedUserResponse> {
    const queryParts: string[] = [];

    if (params?.sort?.length) {
      queryParts.push(...params.sort.map((param) => `sort=${param}`));
    }

    if (params?.search !== undefined) {
      queryParts.push(`searchTerm=${params.search}`);
    }

    const queryString = queryParts.length ? `?${queryParts.join('&')}` : '';
    return this.apiService.get<PaginatedUserResponse>(
      this.baseUrl,
      this.endpoints.getPatientAndProviders(queryString),
    );
  }
}
