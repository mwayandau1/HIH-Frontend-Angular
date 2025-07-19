import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { InputComponent } from '@shared/components/input/input.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { PatientNote } from '@shared/models/patient';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { ChevronDown, LucideAngularModule } from 'lucide-angular';
import { PatientService } from '@core/services/patient/patient.service';
import { finalize } from 'rxjs';
import { toastNotifications } from '@shared/constants/toast';
import { ToastService } from '@core/services/toast/toast.service';

@Component({
  selector: 'app-patient-notes',
  standalone: true,
  imports: [
    InputComponent,
    ButtonComponent,
    DatePipe,
    ReactiveFormsModule,
    LoaderComponent,
    LucideAngularModule,
  ],
  templateUrl: './patient-notes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientNotesComponent {
  private readonly patientService = inject(PatientService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  protected readonly icons = { ChevronDown };
  protected readonly isFetchingNotes = signal(false);
  protected readonly isPostingNotes = signal(false);
  protected readonly patientNotes = signal<PatientNote[]>([]);
  protected readonly noteForm = this.fb.group({
    title: this.fb.control('', [Validators.minLength(3)]),
    note: this.fb.control('', [Validators.minLength(10)]),
  });

  constructor() {
    this.isFetchingNotes.set(true);
    const { faildOperations, status } = toastNotifications;

    this.patientService
      .getPatientNotes()
      .pipe(finalize(() => this.isFetchingNotes.set(false)))
      .subscribe({
        next: (res) => this.patientNotes.set(res.data.content),
        error: () => this.toast.show(faildOperations.fetch, status.error),
      });
  }

  protected onSubmit(): void {
    const { title, note } = this.noteForm.value;

    if (!title || !note) return;

    this.isPostingNotes.set(true);
    const { operations, status, messages } = toastNotifications;

    this.patientService
      .postPatientNotes(title, note)
      .pipe(finalize(() => this.isPostingNotes.set(false)))
      .subscribe({
        next: () => {
          this.toast.show(operations.send, status.success, messages.noteSuccess);
          this.noteForm.reset();
        },
        error: () => this.toast.show(operations.actionFail, status.error),
      });
  }
}
