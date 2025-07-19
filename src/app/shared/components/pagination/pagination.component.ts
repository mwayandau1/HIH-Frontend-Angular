import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './pagination.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  public readonly amountOnDisplay = input.required<number>();
  public readonly totalRecords = input.required<number>();
  protected readonly currentPage = signal(1);
  public readonly numOfPages = input.required<number>();
  protected readonly pages = computed(() =>
    Array.from({ length: this.numOfPages() }, (_, i) => i + 1),
  );

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const page = Number(params.get('page'));
      this.currentPage.set(!isNaN(page) && page >= 1 ? page : 1);
    });
  }

  protected onChangePage(direction?: 'next' | 'prev', page?: number): void {
    if (direction === 'next') this.currentPage.update((p) => p + 1);
    else if (direction === 'prev') this.currentPage.update((p) => p - 1);
    else this.currentPage.set(page ?? 1);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: this.currentPage() },
      queryParamsHandling: 'merge',
    });
  }
}
