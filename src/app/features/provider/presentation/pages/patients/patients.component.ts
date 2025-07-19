import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { ArrowRight, LucideAngularModule, Search } from 'lucide-angular';

import { SettingsHeadingComponent } from '@shared/components/settings-heading/settings-heading.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { TableComponent } from '@shared/components/table/table.component';
import { FilterInputComponent } from '@shared/components/filter/filter.component';

import { patientTableHeadColumns } from '@shared/constants/table';
import { patientFilterOptions } from '@shared/constants/filters';
import { toastNotifications } from '@shared/constants/toast';

import { PatientService } from '@core/services/patient/patient.service';
import { ToastService } from '@core/services/toast/toast.service';

import { PatientResponse } from '@shared/models/patient';
import { ThemedLoaderComponent } from '@shared/components/themed-loader/themed-loader.component';
import { endpoints } from '@shared/constants/endpoints';
import { FilterField } from '@shared/models/filters';

@Component({
  selector: 'app-patients-page',
  standalone: true,
  imports: [
    SettingsHeadingComponent,
    ButtonComponent,
    LucideAngularModule,
    InputComponent,
    TableComponent,
    FilterInputComponent,
    ThemedLoaderComponent,
  ],
  templateUrl: './patients.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientsPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly patientService = inject(PatientService);
  private readonly toast = inject(ToastService);
  private readonly endpoints = endpoints.pages;
  protected readonly patients = signal<PatientResponse[]>([]);
  protected readonly isFetchingPatients = signal(false);
  protected readonly icons = { ArrowRight, Search };
  protected readonly headColumns = patientTableHeadColumns;
  protected readonly searchKeyword = signal(new FormControl(''));
  protected readonly filters = signal(patientFilterOptions.slice());
  protected readonly isActionPending = signal(false);

  ngOnInit(): void {
    this.fetchPatients();
  }

  private fetchPatients(
    query?: string,
    ageRange?: string,
    gender?: string,
    lastUpdatedAfter?: string,
  ): void {
    const { status, messages, operations } = toastNotifications;
    this.isFetchingPatients.set(true);

    this.patientService
      .getAllPatients(query, undefined, undefined, ageRange, gender, lastUpdatedAfter)
      .pipe(finalize(() => this.isFetchingPatients.set(false)))
      .subscribe({
        next: (response) => this.patients.set(response.content),
        error: () => {
          this.toast.show(operations.fail, status.error, messages.loadFailure);
          this.patients.set([]);
        },
      });
  }

  protected handlePatientSearch(): void {
    const { value } = this.searchKeyword();

    const keyword = !value || value === '' ? undefined : value;

    this.fetchPatients(keyword);
  }

  protected handleViewRecords(id: string): void {
    const patient = this.patients().find((p) => p.id === id);

    if (patient?.hasConsent) this.router.navigate([this.endpoints.viewAllPatients, id]);
    else {
      this.isActionPending.set(true);
      const { status, operations } = toastNotifications;
      this.patientService
        .requestAccess(id)
        .pipe(finalize(() => this.isActionPending.set(false)))
        .subscribe({
          next: () => this.toast.show(operations.request, status.success),
          error: () => this.toast.show(operations.actionFail, status.error),
        });
    }
  }

  protected onFilterChange(filterBy: FilterField): void {
    const { label, value } = filterBy;
    const searchTerm =
      !this.searchKeyword().value || this.searchKeyword().value === ''
        ? undefined
        : (this.searchKeyword().value ?? undefined);

    if (!value) {
      this.fetchPatients(searchTerm);
      return;
    }

    const ageRange = label === 'Age Range' ? value : undefined;
    const gender = label === 'Gender' ? value : undefined;
    const lastUpdatedAfter = label === 'Last Visit' ? value : undefined;

    this.fetchPatients(searchTerm, ageRange, gender, lastUpdatedAfter);
  }

  protected handleNavigateToChatRoom(): void {
    this.router.navigate(['provider/patients/messages']);
  }
}
