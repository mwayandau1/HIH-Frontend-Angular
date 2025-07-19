import { inject, Injectable } from '@angular/core';
import { Room } from '@shared/models/websocket';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { endpoints } from '@shared/constants/endpoints';
import { environment } from '@core/environments/environments';
import { FetchParams } from '@shared/models';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private readonly apiService = inject(ApiService);
  private readonly endpoints = endpoints.chatRoom;
  private readonly baseUrl = environment.notificationUrl;

  public getOrCreateRoom(targetUserId: string): Observable<Room> {
    return this.apiService.post<Room>(this.baseUrl, this.endpoints.getOrCreateRoom, {
      targetUserId,
    });
  }

  public getUserRooms(params?: FetchParams): Observable<Room[]> {
    const queryParts: string[] = [];

    if (params?.search !== undefined) {
      queryParts.push(`query=${params.search}`);
    }

    const queryString = queryParts.length ? `?${queryParts.join('&')}` : '';
    return this.apiService.get<Room[]>(this.baseUrl, this.endpoints.getUserRooms(queryString));
  }

  public getRoomDetails(roomId: string): Observable<Room> {
    return this.apiService.get<Room>(this.baseUrl, this.endpoints.getRoomDetails(roomId));
  }
}
