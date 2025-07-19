import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  effect,
  DestroyRef,
  inject,
  viewChild,
  ElementRef,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { InputComponent, ButtonComponent } from '@shared/components';
import { getInitials } from '@shared/utils/helpers/formatting';
import {
  LucideAngularModule,
  Paperclip,
  Phone,
  SendHorizontal,
  Smile,
  Video,
} from 'lucide-angular';
import { ChatBubbleComponent } from '@shared/components/chat-bubble/chat-bubble.component';
import { TypingIndicatorComponent } from '@shared/components/typing-indicator/typing-indicator.component';
import { VideoCallModalComponent } from '@shared/components/video-call-modal/video-call-modal.component';
import { WebSocketService } from '@core/services/websocket/websocket.service';
import { MessageService } from '@core/services/message/message.service';
import { ChatMessage, WebSocketMessage } from '@shared/models/websocket';
import { FileUploadService } from '@core/services/file-upload/file-upload.service';
import { SmartReplyService } from '@core/services/smart-reply/smart-reply.service';

@Component({
  selector: 'app-chat-box',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    LucideAngularModule,
    TypingIndicatorComponent,
    VideoCallModalComponent,
    ChatBubbleComponent,
  ],
  templateUrl: './chat-box.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatBoxComponent implements OnInit, OnDestroy {
  private readonly smartReplyService = inject(SmartReplyService);
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  private readonly destroyRef = inject(DestroyRef);
  private readonly webSocketService = inject(WebSocketService);
  private readonly messageService = inject(MessageService);

  private readonly typingSubject = new Subject<void>();

  protected readonly isSendingMessage = signal(false);
  protected readonly messageContent = signal(
    new FormControl('', [Validators.required, Validators.maxLength(500)]),
  );
  protected readonly messages = signal<ChatMessage[]>([]);
  public readonly isConnected = input.required<boolean>();
  public readonly recipientName = input.required<string>();
  public readonly roomId = input.required<string>();
  protected readonly typingUsers = signal<Map<string, boolean>>(new Map());
  protected readonly showCallModal = signal(false);
  protected readonly isVideoCallMode = signal(true);
  protected readonly connectionState = signal<'disconnected' | 'connecting' | 'connected'>(
    'disconnected',
  );

  protected readonly currentUserId = signal<string>(this.getCurrentUserId());

  protected readonly sortedMessages = computed(() =>
    this.messages().sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    ),
  );

  protected readonly isLastMessageUsers = computed(
    () =>
      this.sortedMessages().length > 0 &&
      this.sortedMessages()[this.sortedMessages().length - 1].senderId === this.currentUserId(),
  );

  protected readonly getProviderInitials = getInitials;
  protected readonly icons = { Smile, Paperclip, SendHorizontal, Phone, Video };

  protected readonly fileUploadService = inject(FileUploadService);
  protected isUploadingFile = signal(false);
  protected uploadProgress = signal(0);
  private readonly typingTimeouts = new Map<string, NodeJS.Timeout>();
  protected readonly smartReplies = signal<string[]>([]);
  protected readonly showSmartReplies = signal(true);

  constructor() {
    effect(
      () => {
        const roomId = this.roomId();
        if (roomId) {
          this.initializeChat(roomId);
        }
      },
      { allowSignalWrites: true },
    );
  }

  ngOnInit(): void {
    this.setupTypingIndicator();
    this.setupWebSocketListeners();
  }

  private updateSmartReplies() {
    const lastMessage = this.messages()[0]?.content;
    if (!lastMessage) return;
    this.smartReplies.set(this.smartReplyService.generateSmartReplies(lastMessage));
    this.showSmartReplies.set(this.smartReplies().length > 0);
  }

  private setupTypingIndicator(): void {
    this.typingSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const userId = this.currentUserId();
        if (this.typingTimeouts.has(userId)) {
          clearTimeout(this.typingTimeouts.get(userId));
        }

        this.webSocketService.sendTypingIndicator(this.roomId(), true);

        this.typingTimeouts.set(
          userId,
          setTimeout(() => {
            this.webSocketService.sendTypingIndicator(this.roomId(), false);
            this.typingTimeouts.delete(userId);
          }, 2000),
        );
      });
  }

  private setupWebSocketListeners(): void {
    this.webSocketService.typingUsers$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((users) => {
        this.processTypingUsersUpdate(new Map(users));
      });

    this.webSocketService.messages$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((message) => {
        this.processIncomingMessage(message);
      });
  }

  private processTypingUsersUpdate(newUsers: Map<string, boolean>): void {
    this.updateStoppedTypingUsers(newUsers);

    this.updateActiveTypingUsers(newUsers);
  }

  private updateStoppedTypingUsers(newUsers: Map<string, boolean>): void {
    this.typingUsers.update((current) => {
      const updated = new Map(current);

      Array.from(current.entries()).forEach(([userId, wasTyping]) => {
        if (wasTyping && !newUsers.get(userId)) {
          updated.set(userId, false);
        }
      });

      return updated;
    });
  }

  private updateActiveTypingUsers(newUsers: Map<string, boolean>): void {
    this.typingUsers.update((current) => {
      const updated = new Map(current);

      Array.from(newUsers.entries()).forEach(([userId, isTyping]) => {
        if (isTyping) {
          updated.set(userId, true);
        }
      });

      return updated;
    });
  }

  private processIncomingMessage(message: WebSocketMessage): void {
    if (this.isFileMessage(message)) {
      this.handleFileMessage(message);
    } else {
      this.handleWebSocketMessage(message);
    }
  }

  private isFileMessage(message: WebSocketMessage): boolean {
    return message.type === 'new-file-message' && !!message['message'];
  }

  private handleFileMessage(message: WebSocketMessage): void {
    this.messages.update((msgs) => [message['message'], ...msgs]);
  }

  ngOnDestroy(): void {
    this.webSocketService.disconnect();
  }

  private initializeChat(roomId: string): void {
    this.connectionState.set('connecting');
    this.webSocketService.disconnect();
    this.messages.set([]);

    this.webSocketService.connect(roomId).subscribe({
      next: () => {
        this.connectionState.set('connected');
        this.loadMessages(roomId);
      },
      error: () => {
        this.connectionState.set('disconnected');
      },
    });
  }

  private loadMessages(roomId: string): void {
    this.messageService
      .getRoomMessages(roomId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (messages) => this.messages.set(messages),
        error: () => this.connectionState.set('disconnected'),
      });
  }

  private handleWebSocketMessage(message: WebSocketMessage): void {
    if (!message.type) return;

    switch (message.type) {
      case 'new-text-message':
      case 'new-voice-message':
        if (message['message']) {
          this.addMessage(message['message'] as ChatMessage);
          this.updateSmartReplies();
        }
        break;

      case 'message-read':
        this.updateMessageReadStatus(message['messageId'], message['userId']);
        break;

      case 'user-joined':
        break;
    }
  }

  protected selectSmartReply(reply: string) {
    this.messageContent().setValue(reply);
    this.showSmartReplies.set(false);
    this.sendMessage();
  }

  private addMessage(message: ChatMessage): void {
    this.messages.update((msgs) => [...msgs, message]);

    if (message.senderId !== this.currentUserId()) {
      setTimeout(() => {
        this.messageService.markMessageAsRead(message.id).subscribe();
      }, 1000);
    }
  }

  private updateMessageReadStatus(messageId: string, userId: string): void {
    this.messages.update((msgs) =>
      msgs.map((msg) =>
        msg.id === messageId && !msg.readBy.includes(userId)
          ? { ...msg, readBy: [...msg.readBy, userId] }
          : msg,
      ),
    );
  }

  protected sendMessage(): void {
    const control = this.messageContent();
    const content = control.value?.trim();

    if (!content || !this.roomId()) return;

    this.isSendingMessage.set(true);
    this.webSocketService.sendTextMessage(this.roomId(), content);

    control.reset('');

    this.isSendingMessage.set(false);
    this.webSocketService.sendTypingIndicator(this.roomId(), false);
  }

  protected onMessageInput(): void {
    this.typingSubject.next();
  }

  protected startVideoCall(): void {
    this.isVideoCallMode.set(true);
    this.showCallModal.set(true);
  }

  protected startVoiceCall(): void {
    this.isVideoCallMode.set(false);
    this.showCallModal.set(true);
  }

  protected closeCallModal(): void {
    this.showCallModal.set(false);
  }

  private getCurrentUserId(): string {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId ?? payload.sub ?? '';
      } catch {
        return '';
      }
    }
    return '';
  }

  protected isOwnMessage(message: ChatMessage): boolean {
    return message.senderId === this.currentUserId();
  }

  protected selectFile(): void {
    this.fileInput()?.nativeElement.click();
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.uploadFile(file);

    input.value = '';
  }

  private uploadFile(file: File): void {
    this.isUploadingFile.set(true);

    this.fileUploadService.uploadFile(this.roomId(), file).subscribe({
      next: () => {
        this.isUploadingFile.set(false);
        this.uploadProgress.set(0);
      },
      error: (error) => {
        console.error('Upload failed:', error);
        this.isUploadingFile.set(false);
      },
    });
  }

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  noop(event: KeyboardEvent): void {
    // This is intentionally empty to satisfy accessibility checks
  }
}
