import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { endpoints } from '@shared/constants/endpoints';
import { AllergiesResponse, Allergy } from '@shared/models';
import { Observable } from 'rxjs';
import { environment } from '@core/environments/environments';

@Injectable({
  providedIn: 'root',
})
export class AllergiesService {
  private readonly apiService = inject(ApiService);
  private readonly endpoints = endpoints.allergies;
  private readonly baseUrl = environment.gatewayUrl;

  getAllergies(id: string): Observable<AllergiesResponse> {
    return this.apiService.get(this.baseUrl, this.endpoints.getAllergies(id));
  }

  addAllergy(data: Allergy): Observable<Allergy> {
    return this.apiService.post(this.baseUrl, this.endpoints.addAllergy, data);
  }

  editAllergy(id: string, data: Allergy): Observable<Allergy> {
    return this.apiService.patch(this.baseUrl, this.endpoints.editAllergy(id), data);
  }

  deleteAllergy(id: string): Observable<void> {
    return this.apiService.delete(this.baseUrl, this.endpoints.deleteAllergy(id));
  }
}
