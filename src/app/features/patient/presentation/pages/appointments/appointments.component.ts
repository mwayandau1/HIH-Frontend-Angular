import { ChangeDetectionStrategy, Component, inject, signal, HostListener } from '@angular/core';
import { DropdownComponent } from '../../components/dropdown/dropdown.component';
import { dropdownOptions } from '@shared/constants/appointments';
import { formatDate } from '@shared/utils/helpers/dates';
import { Appointment, AppointmentStatus } from '@shared/models/appointments';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent, PaginationComponent } from '@shared/components';
import { ToastService } from '@core/services/toast/toast.service';
import { toastNotifications, ToastStatus } from '@shared/constants/toast';
import { CommonModule, DatePipe } from '@angular/common';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { finalize } from 'rxjs';
import { AppointmentService } from '@core/services/appointment/appointmemnt.service';
import { RoomService } from '@core/services/room/room.service';

@Component({
  selector: 'app-appointments-page',
  standalone: true,
  imports: [
    DropdownComponent,
    PaginationComponent,
    DatePipe,
    LoaderComponent,
    CommonModule,
    ButtonComponent,
  ],
  templateUrl: './appointments.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentsPageComponent {
  private readonly roomService = inject(RoomService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly toast = inject(ToastService);
  protected readonly formatDate = formatDate;
  protected readonly dropdownOptions = dropdownOptions;

  public readonly appointments = signal<Appointment[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly numOfPages = signal<number>(1);
  public readonly currentPage = signal(0);
  public readonly loading = signal<boolean>(false);
  public selectedState: AppointmentStatus | boolean = false;
  public openModalAppointmentId: string | null = null;
  public actionLoading: Record<string, boolean> = {};

  public itemsPerPage = 12;
  constructor() {
    if (window.matchMedia('(max-width: 767px)').matches) {
      this.itemsPerPage = 6;
    } else {
      this.itemsPerPage = 12;
    }
    this.route.queryParams.subscribe((params) => {
      const pageNumber = parseInt(params['page'] ?? '0', 10);
      const pageSize = parseInt(params['size'] ?? this.itemsPerPage.toString(), 10);

      this.currentPage.set(pageNumber > 0 ? pageNumber - 1 : 0);
      if (pageSize > 0) this.itemsPerPage = pageSize;
      this.getAppointments();
    });
  }

  public onFilterSelected(filterId: string | boolean): void {
    this.currentPage.set(0);
    this.selectedState = filterId as AppointmentStatus;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: 1 },
      queryParamsHandling: 'merge',
    });
    this.getAppointments();
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(): void {
    this.openModalAppointmentId = null;
  }

  public toggleAppointmentModal(appointmentId: string, event: Event): void {
    event.stopPropagation();
    this.openModalAppointmentId =
      this.openModalAppointmentId === appointmentId ? null : appointmentId;
  }

  public isLastOrSecondToLast(index: number): boolean {
    const displayedAppointments = this.appointments().length;
    return index >= displayedAppointments - 2;
  }

  public getAppointments(): void {
    this.loading.set(true);
    this.totalRecords.set(0);
    this.numOfPages.set(1);
    const queryParams: Record<string, string | number | boolean> = {
      pageNumber: this.currentPage(),
      pageSize: this.itemsPerPage,
    };
    if (this.selectedState) {
      queryParams['status'] = this.selectedState;
    }
    this.appointmentService.getAppointments(queryParams).subscribe({
      next: (response) => {
        this.appointments.set(response.data.content);
        this.totalRecords.set(response.data.totalElements);
        this.numOfPages.set(response.data.totalPages);
        this.loading.set(false);
      },
      error: (e) => {
        this.loading.set(false);
        if (e.status === 404) {
          this.toast.show(
            toastNotifications.faildOperations.fetch,
            toastNotifications.status.error as ToastStatus,
            toastNotifications.messages.use404,
          );
          return;
        }

        this.toast.show(
          toastNotifications.faildOperations.fetch,
          toastNotifications.status.error as ToastStatus,
          toastNotifications.messages.fetchFailed,
        );
      },
    });
  }

  public handleAppointmentAction(appointment: Appointment, action: { status: string }) {
    const key = `${appointment.id}:${action.status}`;
    this.actionLoading[key] = true;
    if (action.status === 'DELETE') {
      this.deleteAppointment(appointment.id, key);
    } else {
      this.updateAppointment(
        { id: appointment.id, status: action.status as AppointmentStatus },
        key,
      );
    }
  }

  public deleteAppointment(id: string, key: string): void {
    this.appointmentService
      .deleteAppointment(id)
      .pipe(
        finalize(() => {
          this.actionLoading[key] = false;
        }),
      )
      .subscribe({
        next: () => {
          this.openModalAppointmentId = null;
          // Remove the appointment locally
          this.appointments.update((list) => list.filter((a) => a.id !== id));
          const newTotal = this.totalRecords() - 1;
          this.totalRecords.set(newTotal);
          // Recalculate numOfPages
          const newNumOfPages = Math.max(1, Math.ceil(newTotal / this.itemsPerPage));
          this.numOfPages.set(newNumOfPages);
          // If the current page is now empty and not the first page, go back one page
          if (this.currentPage() > 0 && this.appointments().length === 0) {
            this.currentPage.set(this.currentPage() - 1);
            this.getAppointments();
          }
        },
        error: () => {
          this.toast.show(
            toastNotifications.faildOperations.delete,
            toastNotifications.status.error as ToastStatus,
            toastNotifications.messages.deleteFailed,
          );
        },
      });
  }

  public updateAppointment({ id, status }: Appointment, key: string): void {
    this.appointmentService
      .updateAppointment({ id, status })
      .pipe(
        finalize(() => {
          this.actionLoading[key] = false;
        }),
      )
      .subscribe({
        next: () => {
          this.openModalAppointmentId = null;
          // Update the appointment status locally
          this.appointments.update((list) => list.map((a) => (a.id === id ? { ...a, status } : a)));
        },
        error: () => {
          this.toast.show(
            toastNotifications.faildOperations.update,
            toastNotifications.status.error as ToastStatus,
            toastNotifications.messages.updateFailed,
          );
        },
      });
  }

  public messageDoctor(providerId: string): void {
    this.openModalAppointmentId = null;

    this.roomService.getOrCreateRoom(providerId).subscribe({
      next: (room) => {
        this.router.navigate(['patients/appointments/message', room.id]);
      },
    });
  }

  public isActionLoading(appointmentId: string, status: string): boolean {
    return !!this.actionLoading[`${appointmentId}:${status}`];
  }

  getAppointmentActions(status: AppointmentStatus) {
    switch (status) {
      case 'SCHEDULED':
        return [
          { label: 'Cancel Appointment', status: 'CANCELLED', color: 'text-red-600' },
          { label: 'In Progress', status: 'IN_PROGRESS', color: 'text-amber-600' },
          { label: 'Completed', status: 'COMPLETED', color: 'text-green-600' },
        ];
      case 'IN_PROGRESS':
        return [{ label: 'Completed', status: 'COMPLETED', color: 'text-green-600' }];
      case 'COMPLETED':
      case 'CANCELLED':
        return [{ label: 'Delete Appointment', status: 'DELETE', color: 'text-red-600' }];
      default:
        return [];
    }
  }
}
