/* eslint-disable no-unused-vars */
import { Injectable, OnDestroy, signal } from '@angular/core';
import { environment } from '@core/environments/environments';
import { WebSocketMessage } from '@shared/models/websocket';
import { BehaviorSubject, Observable, of, Subject, take, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService implements OnDestroy {
  private readonly wsUrl = environment.notificationUrl;
  private socket: WebSocket | null = null;
  private readonly messagesSubject = new Subject<WebSocketMessage>();
  private readonly connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private readonly typingUsersSubject = new BehaviorSubject<Map<string, boolean>>(new Map());
  private readonly connectionSubject = new Subject<void>();
  private readonly errorSubject = new Subject<Error>();
  private readonly messageHandlers = new Set<(message: WebSocketMessage) => void>();

  private readonly reconnectAttempts = signal(0);
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 3000;
  private readonly roomId = signal<string>('');

  public messages$ = this.messagesSubject.asObservable();
  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  public typingUsers$ = this.typingUsersSubject.asObservable();
  public errors$ = this.errorSubject.asObservable();

  ngOnDestroy(): void {
    this.messageHandlers.clear();
    this.disconnect();
  }

  public connect(roomId: string, token?: string): Observable<void> {
    if (this.socket?.readyState === WebSocket.OPEN && this.roomId() === roomId) return of(void 0);

    this.disconnect();

    this.roomId.set(roomId);
    const authToken = token ?? localStorage.getItem('accessToken') ?? '';
    const wsUrl = `${this.wsUrl}/notifications/signaling-native?token=${authToken}`;

    try {
      this.socket = new WebSocket(wsUrl);
      this.setupSocketHandlers(authToken);

      return this.connectionSubject.pipe(
        take(1),
        tap(() => {
          const userId = this.getUserIdFromToken(authToken);
          const joinMessage = {
            type: 'join',
            roomId: roomId,
            userId: userId,
            userName: this.getUserName(),
            token: authToken,
          };
          this.send(joinMessage);
        }),
      );
    } catch (err) {
      return throwError(() => err ?? new Error('Failed to connect to WebSocket'));
    }
  }

  private setupSocketHandlers(authToken: string): void {
    if (!this.socket) return;

    this.socket.onopen = () => {
      this.connectionStatusSubject.next(true);
      this.reconnectAttempts.set(0);
      this.connectionSubject.next();
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.messagesSubject.next(message);

        this.messageHandlers.forEach((handler) => {
          try {
            handler(message);
          } catch (error) {
            console.error('Error in message handler:', error);
          }
        });

        if (message.type === 'typing-indicator') this.updateTypingUsers(message);
      } catch (error) {
        console.error('Error parsing message:', error);
        this.errorSubject.next(new Error('Failed to parse WebSocket message'));
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      console.error('WebSocket readyState:', this.socket?.readyState);
      this.connectionStatusSubject.next(false);
      this.errorSubject.next(new Error('WebSocket connection error'));
    };

    this.socket.onclose = () => {
      this.connectionStatusSubject.next(false);
      this.handleReconnect(authToken);
    };
  }

  public send(message: WebSocketMessage): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      const messageToSend = { ...message };
      messageToSend['token'] ??= this.getToken();

      this.socket.send(JSON.stringify(messageToSend));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  public sendTextMessage(roomId: string, content: string, threadId?: string): void {
    this.send({
      type: 'text-message',
      roomId,
      content,
      threadId,
    });
  }

  public sendTypingIndicator(roomId: string, isTyping: boolean): void {
    this.send({
      type: 'typing',
      roomId,
      isTyping,
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.connectionStatusSubject.next(false);
    }
  }

  private updateTypingUsers(message: WebSocketMessage): void {
    const currentTyping = this.typingUsersSubject.value;
    const newTyping = new Map(currentTyping);

    if (message['userId'] !== this.getCurrentUserId()) {
      newTyping.set(message['userId'], message['isTyping']);

      if (message['isTyping']) {
        setTimeout(() => {
          const typing = this.typingUsersSubject.value;
          const updated = new Map(typing);
          updated.set(message['userId'], false);
          this.typingUsersSubject.next(updated);
        }, 3000);
      }

      this.typingUsersSubject.next(newTyping);
    }
  }

  private handleReconnect(token: string): void {
    if (this.reconnectAttempts() < this.maxReconnectAttempts && this.roomId()) {
      this.reconnectAttempts.update((attempts) => attempts + 1);
      setTimeout(() => {
        this.connect(this.roomId(), token);
      }, this.reconnectDelay);
    }
  }

  private getToken(): string {
    return localStorage.getItem('accessToken') ?? '';
  }

  private getUserIdFromToken(token: string): string {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId ?? payload.sub ?? '';
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
    return '';
  }

  private getCurrentUserId(): string {
    return this.getUserIdFromToken(this.getToken());
  }

  private getUserName(): string {
    return localStorage.getItem('user_name') ?? 'Anonymous';
  }

  private addMessageHandler(handler: (message: WebSocketMessage) => void): void {
    this.messageHandlers.add(handler);
  }

  private removeMessageHandler(handler: (message: WebSocketMessage) => void): void {
    this.messageHandlers.delete(handler);
  }

  public requestFileUpload(
    roomId: string,
    file: File,
  ): Observable<{
    uploadUrl: string;
    publicUrl: string;
    s3Key: string;
    contentType: string;
  }> {
    return new Observable((observer) => {
      this.send({
        type: 'file-upload-request',
        roomId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      const handler = (message: WebSocketMessage) => {
        if (message.type === 'file-upload-url') {
          this.removeMessageHandler(handler);
          clearTimeout(timeoutId);
          observer.next({
            uploadUrl: message['uploadUrl'],
            publicUrl: message['publicUrl'],
            s3Key: message['s3Key'],
            contentType: message['contentType'],
          });
          observer.complete();
        }
      };

      this.addMessageHandler(handler);

      const timeoutId = setTimeout(() => {
        this.removeMessageHandler(handler);
        observer.error(new Error('Upload request timeout'));
      }, 10000);
    });
  }

  public sendFileMessage(
    roomId: string,
    fileName: string,
    fileType: string,
    fileUrl: string,
    fileSize: number,
    s3Key: string,
    threadId?: string,
  ): void {
    this.send({
      type: 'file-message',
      roomId,
      fileName,
      fileType,
      fileUrl,
      fileSize,
      s3Key,
      threadId,
    });
  }
}
