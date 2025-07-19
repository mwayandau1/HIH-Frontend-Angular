import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterOutlet, NavigationEnd } from '@angular/router';
import { FormControl } from '@angular/forms';
import { filter, finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  ButtonComponent,
  InputComponent,
  ModalComponent,
  LoaderComponent,
} from '@shared/components';
import { LucideAngularModule, Search, UserPlus } from 'lucide-angular';

import { RoomService } from '@core/services/room/room.service';
import { UserService } from '@core/services/user/user.service';
import { ToastService } from '@core/services/toast/toast.service';

import { Room } from '@shared/models/websocket';
import { PatientProvider } from '@shared/models';
import { toastNotifications } from '@shared/constants/toast';
import { getInitials } from '@shared/utils/helpers/formatting';

@Component({
  selector: 'app-patient-message-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    InputComponent,
    ButtonComponent,
    ModalComponent,
    LoaderComponent,
    LucideAngularModule,
  ],
  templateUrl: './message.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagePageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly roomService = inject(RoomService);
  private readonly userService = inject(UserService);

  protected readonly icons = { Search, UserPlus };
  protected readonly searchKeyword = new FormControl('');
  protected readonly getInitials = getInitials;

  protected readonly userRooms = signal<Room[]>([]);
  protected readonly selectedRoomId = signal<string | null>(null);
  protected readonly isModalOpen = signal(false);
  protected readonly allUsers = signal<PatientProvider[]>([]);
  protected readonly isFetchingUsers = signal(false);
  protected readonly isFetchingRooms = signal(false);

  protected readonly selectedRoom = computed(() => {
    const id = this.selectedRoomId();
    return id ? (this.userRooms().find((room) => room.id === id) ?? null) : null;
  });

  ngOnInit(): void {
    this.listenToRouteChanges();
    this.fetchRooms();
  }

  private listenToRouteChanges(): void {
    this.route.firstChild?.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const roomId = params.get('roomId');
        if (roomId) this.selectedRoomId.set(roomId);
      });

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        const roomId = this.route.firstChild?.snapshot.paramMap.get('roomId');
        this.selectedRoomId.set(roomId ?? null);
      });
  }

  protected selectRoom(roomId: string): void {
    this.selectedRoomId.set(roomId);
    this.router.navigate(['provider/patients/messages', roomId]);
  }

  protected handleSearch(category: 'rooms' | 'users'): void {
    const keyword = this.searchKeyword.value?.trim() ?? undefined;
    this.selectedRoomId.set(null);
    this.router.navigate(['provider/patients/messages']);

    if (category === 'rooms') this.fetchRooms(keyword);
    else this.fetchUsers(keyword);
  }

  protected fetchRooms(search?: string): void {
    this.isFetchingRooms.set(true);

    this.roomService
      .getUserRooms({ search })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isFetchingRooms.set(false)),
      )
      .subscribe({
        next: (rooms) => {
          this.userRooms.set(rooms);

          const currentRoomId = this.selectedRoomId();
          if (currentRoomId && !rooms.find((r) => r.id === currentRoomId)) {
            this.fetchRoomDetails(currentRoomId);
          }
        },
        error: (err) => console.error('Error fetching rooms:', err),
      });
  }

  private fetchRoomDetails(roomId: string): void {
    this.roomService
      .getRoomDetails(roomId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (room) => this.userRooms.update((rooms) => [...rooms, room]),
        error: (err) => console.error('Error fetching room details:', err),
      });
  }

  protected handleOpenModal(): void {
    this.isModalOpen.set(true);
    this.fetchUsers();
  }

  protected handleCloseModal(): void {
    this.isModalOpen.set(false);
    this.searchKeyword.reset();
  }

  private fetchUsers(search?: string): void {
    const { status, messages, operations } = toastNotifications;

    this.isFetchingUsers.set(true);
    this.userService
      .getProvidersAndPatients({ search })
      .pipe(finalize(() => this.isFetchingUsers.set(false)))
      .subscribe({
        next: (res) => this.allUsers.set(res.content),
        error: () => {
          this.toast.show(operations.fail, status.error, messages.loadFailure);
          this.allUsers.set([]);
        },
      });
  }

  protected handleStartConvo(userId: string): void {
    this.roomService.getOrCreateRoom(userId).subscribe({
      next: (room) => {
        this.userRooms.update((rooms) => [...rooms, room]);
        this.router.navigate(['provider/patients/messages', room.id]);
        this.isModalOpen.set(false);
      },
      error: (err) => console.error('Error starting conversation:', err),
    });
  }
}
