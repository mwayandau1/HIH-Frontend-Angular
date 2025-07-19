import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { RoomService } from '@core/services/room/room.service';
import { ChatBoxComponent } from '@shared/components/chat-box/chat-box.component';
import { Room } from '@shared/models/websocket';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-active-inbox',
  standalone: true,
  imports: [ChatBoxComponent],
  templateUrl: './active-inbox.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveInboxComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly roomService = inject(RoomService);

  protected readonly selectedRoom = signal<Room | null>(null);
  protected readonly roomId = signal('');

  protected readonly recipientInfo = computed(() => {
    const room = this.selectedRoom();
    if (!room?.participants || room.participants.length < 2) {
      return null;
    }
    return {
      isConnected: room.participants[1].active,
      name: room.participants[1].userName,
    };
  });

  ngOnInit(): void {
    this.route.params
      .pipe(
        switchMap((params) => {
          const roomId = params['roomId'];
          this.roomId.set(roomId);
          return this.roomService.getRoomDetails(roomId);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (room) => this.selectedRoom.set(room),
        error: (error) => console.error('Error selecting room:', error),
      });
  }
}
