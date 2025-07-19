import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Observable } from 'rxjs';
import {
  NotificationSettingsRequest,
  NotificationSettingsResponse,
} from '@shared/models/notifications';
import { endpoints } from '@shared/constants/endpoints';
import { environment } from '@core/environments/environments';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly apiService = inject(ApiService);
  private readonly baseUrl = environment.notificationUrl;
  private readonly endpoints = endpoints.notification;

  public getUserNotifications(): Observable<NotificationSettingsResponse> {
    return this.apiService.get<NotificationSettingsResponse>(
      this.baseUrl,
      this.endpoints.getUserPreferences,
    );
  }

  public updateUserPreference(body: NotificationSettingsRequest[]): Observable<void> {
    return this.apiService.put(this.baseUrl, this.endpoints.updateUserPreferences, body);
  }
}
