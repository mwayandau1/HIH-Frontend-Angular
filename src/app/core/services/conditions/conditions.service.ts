import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { endpoints } from '@shared/constants/endpoints';
import { Condition, ConditionsResponse } from '@shared/models';
import { Observable } from 'rxjs';
import { environment } from '@core/environments/environments';

@Injectable({
  providedIn: 'root',
})
export class ConditionsService {
  private readonly apiService = inject(ApiService);
  private readonly endpoints = endpoints.conditions;
  private readonly baseUrl = environment.gatewayUrl;

  getConditions(id: string): Observable<ConditionsResponse> {
    return this.apiService.get(this.baseUrl, this.endpoints.getConditions(id));
  }

  addCondition(data: Condition): Observable<Condition> {
    return this.apiService.post(this.baseUrl, this.endpoints.addCondition, data);
  }

  editCondition(data: Condition, id: string): Observable<Condition> {
    return this.apiService.patch(this.baseUrl, this.endpoints.editCondition(id), data);
  }

  deleteCondition(id: string): Observable<void> {
    return this.apiService.delete(this.baseUrl, this.endpoints.deleteCondition(id));
  }
}
