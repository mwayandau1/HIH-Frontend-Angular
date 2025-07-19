import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { HttpOptions } from '@shared/models/api';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);

  public get<T>(baseUrl: string, endpoint: string, options?: object) {
    return this.http.get<T>(`${baseUrl}/${endpoint}`, options);
  }

  public post<TResponse, TBody = unknown>(
    baseUrl: string,
    endpoint: string,
    body?: TBody,
    options?: HttpOptions,
  ): Observable<TResponse> {
    return this.http.post<TResponse>(`${baseUrl}/${endpoint}`, body, options);
  }

  public put<TResponse, TBody = unknown>(
    baseUrl: string,
    endpoint: string,
    body: TBody,
    options?: HttpOptions,
  ): Observable<TResponse> {
    return this.http.put<TResponse>(`${baseUrl}/${endpoint}`, body, options);
  }

  public patch<TResponse, TBody = unknown>(
    baseUrl: string,
    endpoint: string,
    body: TBody,
    options?: HttpOptions,
  ): Observable<TResponse> {
    return this.http.patch<TResponse>(`${baseUrl}/${endpoint}`, body, options);
  }

  public delete<T>(baseUrl: string, endpoint: string, options?: object) {
    return this.http.delete<T>(`${baseUrl}/${endpoint}`, options);
  }
}
