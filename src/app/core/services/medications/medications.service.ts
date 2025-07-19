import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { endpoints } from '@shared/constants/endpoints';
import { MedicationsData, MedicationsResponse } from '@shared/models/medications';
import { Observable } from 'rxjs';
import { environment } from '@core/environments/environments';

@Injectable({
  providedIn: 'root',
})
export class MedicationsService {
  private readonly apiService = inject(ApiService);
  private readonly endpoints = endpoints.medications;
  private readonly baseUrl = environment.gatewayUrl;

  getMedications(id: string): Observable<MedicationsResponse> {
    return this.apiService.get(this.baseUrl, this.endpoints.getMedications(id));
  }

  addMedications(data: MedicationsData): Observable<MedicationsData> {
    return this.apiService.post(this.baseUrl, this.endpoints.createMedication, data);
  }
}
