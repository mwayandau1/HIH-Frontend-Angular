import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { endpoints } from '@shared/constants/endpoints';
import { Appointment, AppointmentResponse, Pageable } from '@shared/models/appointments';
import { Observable } from 'rxjs';
import { environment } from '@core/environments/environments';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private readonly apiService = inject(ApiService);
  private readonly endpoint = endpoints.appointments;
  private readonly baseUrl = environment.gatewayUrl;

  public getAppointments(params: Pageable): Observable<AppointmentResponse> {
    const queryParts: string[] = [];

    if (params?.status && params.status !== 'ALL') {
      queryParts.push(`status=${params.status}`);
    }

    if (params?.pageNumber !== undefined) {
      queryParts.push(`page=${params.pageNumber}`);
    }

    if (params?.pageSize !== undefined) {
      queryParts.push(`size=${params.pageSize}`);
    }

    const queryString = queryParts.length ? `?${queryParts.join('&')}` : '';
    return this.apiService.get<AppointmentResponse>(
      this.baseUrl,
      this.endpoint.getAppointments(queryString),
    );
  }

  public deleteAppointment(id: string): Observable<void> {
    return this.apiService.delete<void>(this.baseUrl, this.endpoint.deleteAppointment(id));
  }

  public updateAppointment({ id, status }: Appointment): Observable<void> {
    return this.apiService.patch<void>(
      this.baseUrl,
      this.endpoint.updateAppointment(id, status),
      {},
    );
  }
}
