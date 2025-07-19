import { inject, Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ChatMessage } from '@shared/models/websocket';
import { ApiService } from '../api/api.service';
import { endpoints } from '@shared/constants/endpoints';
import { environment } from '@core/environments/environments';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private readonly apiService = inject(ApiService);
  private readonly endpoints = endpoints.messages;
  private readonly baseUrl = environment.notificationUrl;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  public getRoomMessages(roomId: string, page = 0, size = 50): Observable<ChatMessage[]> {
    return this.apiService
      .get<ChatMessage[]>(this.baseUrl, this.endpoints.getRoomMessages(roomId), {
        params: { page: page.toString(), size: size.toString() },
        headers: this.getHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error fetching messages:', error);
          return of([]);
        }),
      );
  }

  public markMessageAsRead(messageId: string): Observable<void> {
    return this.apiService
      .post<void>(
        this.baseUrl,
        this.endpoints.markMessageAsRead(messageId),
        {},
        { headers: this.getHeaders() },
      )
      .pipe(
        catchError((error) => {
          console.error('Error marking message as read:', error);
          return of();
        }),
      );
  }
}
