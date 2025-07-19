import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Observable } from 'rxjs';
import {
  ConsentResponse,
  PaginatedPatientNoteResponse,
  PaginatedPatientResponse,
  PaginatedPatientVisitResponse,
  PatientDetails,
} from '@shared/models/patient';
import { endpoints } from '@shared/constants/endpoints';
import { environment } from '@core/environments/environments';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private readonly apiService = inject(ApiService);
  private readonly endpoints = endpoints.patients;
  private readonly baseUrl = environment.gatewayUrl;

  public getAllPatients(
    query?: string,
    page?: number,
    size?: number,
    ageRange?: string,
    gender?: string,
    lastUpdatedAfter?: string,
  ): Observable<PaginatedPatientResponse> {
    return this.apiService.get<PaginatedPatientResponse>(
      this.baseUrl,
      this.endpoints.getAll(query, page, size, ageRange, gender, lastUpdatedAfter),
    );
  }

  public getPatientById(id: string): Observable<PatientDetails> {
    return this.apiService.get<PatientDetails>(this.baseUrl, this.endpoints.getById(id));
  }

  public requestAccess(patientId: string): Observable<void> {
    return this.apiService.post(this.baseUrl, this.endpoints.requestAccess, { patientId });
  }

  public getPatientConsent(id: number): Observable<ConsentResponse> {
    return this.apiService.get<ConsentResponse>(this.baseUrl, this.endpoints.getConsent(id));
  }

  public getPatientNotes(): Observable<PaginatedPatientNoteResponse> {
    return this.apiService.get<PaginatedPatientNoteResponse>(
      this.baseUrl,
      this.endpoints.handleNotes,
    );
  }

  public postPatientNotes(title: string, content: string): Observable<void> {
    return this.apiService.post(this.baseUrl, this.endpoints.handleNotes, { title, content });
  }

  public getPatientVisits(): Observable<PaginatedPatientVisitResponse> {
    return this.apiService.get<PaginatedPatientVisitResponse>(
      this.baseUrl,
      this.endpoints.getVisits,
    );
  }

  public postPatientVisits(
    purpose: string,
    visitDate: string,
    notes: string,
    patientId: string,
  ): Observable<void> {
    return this.apiService.post(this.baseUrl, this.endpoints.postVisits, {
      purpose,
      visitDate,
      notes,
      patientId,
    });
  }
}
