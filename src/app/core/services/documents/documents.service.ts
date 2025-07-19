import { Injectable, inject } from '@angular/core';
import { endpoints } from '@shared/constants/endpoints';
import { ApiService } from '../api/api.service';
import { Document } from '@shared/models';
import { Observable } from 'rxjs';
import { environment } from '@core/environments/environments';

@Injectable({
  providedIn: 'root',
})
export class DocumentsService {
  private readonly apiService = inject(ApiService);
  private readonly endpoints = endpoints.pastientDocuments;
  private readonly baseUrl = environment.gatewayUrl;

  public getDocuments(id: string): Observable<Document[]> {
    return this.apiService.get<Document[]>(this.baseUrl, this.endpoints.getPatientDocuments(id));
  }

  public uploadDocument(data: FormData, id: string): Observable<Document> {
    return this.apiService.post<Document>(
      this.baseUrl,
      this.endpoints.uploadPatientDocuments(id),
      data,
    );
  }
}
