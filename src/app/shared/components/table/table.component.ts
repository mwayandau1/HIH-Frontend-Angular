import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { PatientResponse } from '@shared/models/patient';
import { PaginationComponent } from '../pagination/pagination.component';
import { ActivatedRoute } from '@angular/router';
import { LoaderComponent } from '../loader/loader.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getInitials } from '@shared/utils/helpers/formatting';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [ButtonComponent, PaginationComponent, LoaderComponent, DatePipe],
  templateUrl: './table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  public readonly headCols = input.required<string[]>();
  public readonly data = input.required<PatientResponse[]>();
  public readonly isRequestingAction = input(false);
  protected readonly currentPage = signal(1);
  protected readonly getPatientInitials = getInitials;
  protected readonly processingState = signal<string>('');
  public readonly action = output<string>();
  protected readonly pageItems = computed(() => {
    const start = (this.currentPage() - 1) * 12;
    const end = this.currentPage() * 12;
    return this.data().slice(start, end);
  });

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const page = parseInt(params['page'] ?? '1', 10);
      this.currentPage.set(isNaN(page) || page < 1 ? 1 : page);
    });
  }

  handleButtonAction(id: string) {
    this.processingState.set(id);
    this.action.emit(id);
  }
}
