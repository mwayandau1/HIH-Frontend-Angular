import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { Calendar, FileText, User, LucideAngularModule } from 'lucide-angular';
import { PatientService } from '@core/services/patient/patient.service';
import { ToastService } from '@core/services/toast/toast.service';
import { toastNotifications } from '@shared/constants/toast';
import { checkFieldErrors } from '@shared/utils/helpers/errorHandlers';
import { PaginatedData, PatientVisit } from '@shared/models/patient';
import {
  ButtonComponent,
  PaginationComponent,
  LoaderComponent,
  ModalComponent,
  InputComponent,
  DatePickerComponent,
} from '@shared/components';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-patient-visits',
  standalone: true,
  imports: [
    ButtonComponent,
    DatePipe,
    LucideAngularModule,
    PaginationComponent,
    LoaderComponent,
    ModalComponent,
    InputComponent,
    DatePickerComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './patient-visits.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientVisitsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly patientService = inject(PatientService);
  protected readonly icons = { Calendar, User, FileText };
  protected readonly currentPage = signal(1);
  protected readonly isFetchingVisits = signal(false);
  protected readonly isPostingVisits = signal(false);
  protected readonly isModalOpen = signal(false);
  protected readonly visits = signal<PaginatedData<PatientVisit> | null>(null);
  protected readonly patientId = signal('');
  protected readonly checkFieldErrors = checkFieldErrors;
  protected readonly pageCount = signal(0);

  protected readonly pageItems = computed(() => {
    const page = this.currentPage();
    const start = (page - 1) * 4;
    const end = page * 4;
    return this.visits()?.content.slice(start, end);
  });

  protected readonly visitForm = this.fb.group({
    date: ['', [Validators.required]],
    visitPurpose: ['', [Validators.required, Validators.minLength(3)]],
    visitNote: [''],
  });

  ngOnInit(): void {
    this.initializeQueryParams();
    this.initializeRouteParams();
    this.fetchVisits();
  }

  private initializeQueryParams(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const page = parseInt(params['page'] ?? '1', 10);
      this.currentPage.set(isNaN(page) || page < 1 ? 1 : page);
    });
  }

  private initializeRouteParams(): void {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((param) => {
      this.patientId.set(param?.['id'] ?? '');
    });
  }

  private fetchVisits(): void {
    const { faildOperations, status } = toastNotifications;

    this.isFetchingVisits.set(true);

    this.patientService
      .getPatientVisits()
      .pipe(finalize(() => this.isFetchingVisits.set(false)))
      .subscribe({
        next: (res) => {
          this.visits.set(res.data);
          this.pageCount.set(Math.ceil(res.data.numberOfElements / 4));
        },
        error: () => this.toast.show(faildOperations.fetch, status.error),
      });
  }

  protected onSubmit(): void {
    const { visitNote, visitPurpose, date } = this.visitForm.value;

    if (!visitPurpose || !date) return;

    const { operations, status, messages } = toastNotifications;
    const visitDate = new Date(date).toISOString();

    this.isPostingVisits.set(true);

    this.patientService
      .postPatientVisits(visitPurpose, visitDate, visitNote ?? '', this.patientId())
      .pipe(finalize(() => this.isPostingVisits.set(false)))
      .subscribe({
        next: () => {
          this.toast.show(operations.send, status.success, messages.visitSuccess);
          this.visitForm.reset();
          this.isModalOpen.set(false);
        },
        error: () => this.toast.show(operations.actionFail, status.error),
      });
  }
}
