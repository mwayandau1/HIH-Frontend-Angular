import { Injectable, inject } from '@angular/core';
import { ApiService } from '../api/api.service';
import { endpoints } from '@shared/constants/endpoints';
import { LabResultsData, LabResultsResponse } from '@shared/models/labResults';
import { Observable } from 'rxjs';
import { environment } from '@core/environments/environments';

@Injectable({
  providedIn: 'root',
})
export class LabResultsService {
  private readonly apiService = inject(ApiService);
  private readonly endpoints = endpoints.labResults;
  private readonly baseUrl = environment.gatewayUrl;

  getLabResults(id: string): Observable<LabResultsResponse> {
    return this.apiService.get<LabResultsResponse>(this.baseUrl, this.endpoints.getLabResults(id));
  }
  addLabResults(data: LabResultsData): Observable<LabResultsData> {
    return this.apiService.post(this.baseUrl, this.endpoints.addLabResults, data);
  }
}
