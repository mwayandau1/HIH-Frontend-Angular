import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Observable } from 'rxjs';
import { endpoints } from '@shared/constants/endpoints';
import { Vital, VitalsResponse } from '@shared/models/vitals';
import { environment } from '@core/environments/environments';
@Injectable({
  providedIn: 'root',
})
export class VitalsService {
  private readonly apiService = inject(ApiService);
  private readonly endpoints = endpoints.vitals;
  private readonly baseUrl = environment.gatewayUrl;

  getVitals(id: string): Observable<VitalsResponse> {
    return this.apiService.get(this.baseUrl, this.endpoints.getVitals(id));
  }

  addVital(data: Vital): Observable<Vital> {
    return this.apiService.post(this.baseUrl, this.endpoints.recordVitals, data);
  }
}
