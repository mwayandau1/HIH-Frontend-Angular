import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { endpoints } from '@shared/constants/endpoints';
import { Immunization, ImmunizationResponse } from '@shared/models/immunizations';
import { Observable } from 'rxjs';
import { environment } from '@core/environments/environments';

@Injectable({
  providedIn: 'root',
})
export class ImmunizationsService {
  private readonly apiService = inject(ApiService);
  private readonly endpoints = endpoints.immunizations;
  private readonly baseUrl = environment.gatewayUrl;

  getImmunizations(id: string): Observable<ImmunizationResponse> {
    return this.apiService.get(this.baseUrl, this.endpoints.getImmunizations(id));
  }

  addImmunization(data: Immunization): Observable<Immunization> {
    return this.apiService.post(this.baseUrl, this.endpoints.addImmunization, data);
  }
}
