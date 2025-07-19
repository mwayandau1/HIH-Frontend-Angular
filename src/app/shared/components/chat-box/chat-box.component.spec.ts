/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ChatBoxComponent } from './chat-box.component';
import { WebSocketService } from '@core/services/websocket/websocket.service';
import { MessageService } from '@core/services/message/message.service';
import { FileUploadService } from '@core/services/file-upload/file-upload.service';
import { ChatMessage, WebSocketMessage } from '@shared/models/websocket';

describe('ChatBoxComponent', () => {
  let component: ChatBoxComponent;
  let fixture: ComponentFixture<ChatBoxComponent>;
  let webSocketService: jest.Mocked<WebSocketService>;
  let messageService: jest.Mocked<MessageService>;
  let fileUploadService: jest.Mocked<FileUploadService>;

  const mockMessages: ChatMessage[] = [
    {
      id: '1',
      content: 'Hello',
      senderId: 'user1',
      roomId: 'room1',
      createdAt: new Date().toISOString(),
      readBy: [],
      type: 'TEXT',
    },
  ];

  const connectionStatus$ = new BehaviorSubject<boolean>(false);
  const typingUsers$ = new BehaviorSubject<Map<string, boolean>>(new Map());
  const messages$ = new BehaviorSubject<WebSocketMessage>({
    type: 'new-text-message',
    message: mockMessages[0],
  });

  beforeEach(async () => {
    webSocketService = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      sendTextMessage: jest.fn(),
      sendTypingIndicator: jest.fn(),
      connectionStatus$: connectionStatus$.asObservable(),
      typingUsers$: typingUsers$.asObservable(),
      messages$: messages$.asObservable(),
    } as unknown as jest.Mocked<WebSocketService>;

    messageService = {
      getRoomMessages: jest.fn(),
      markMessageAsRead: jest.fn(),
    } as unknown as jest.Mocked<MessageService>;

    fileUploadService = {
      uploadFile: jest.fn(),
    } as unknown as jest.Mocked<FileUploadService>;

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });

    webSocketService.connect.mockReturnValue(of(undefined));
    messageService.getRoomMessages.mockReturnValue(of(mockMessages));
    messageService.markMessageAsRead.mockReturnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [ChatBoxComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { params: of({ roomId: 'room1' }) },
        },
        { provide: WebSocketService, useValue: webSocketService },
        { provide: MessageService, useValue: messageService },
        { provide: FileUploadService, useValue: fileUploadService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatBoxComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isConnected', true);
    fixture.componentRef.setInput('recipientName', 'Dr.Sarah Johnson');
    fixture.componentRef.setInput('roomId', 'room1');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize chat on room ID change', () => {
    expect(webSocketService.connect).toHaveBeenCalledWith('room1');
    expect(messageService.getRoomMessages).toHaveBeenCalledWith('room1');
  });

  it('should update connection status', () => {
    connectionStatus$.next(true);
    expect(component['isConnected']()).toBeTruthy();
  });

  it('should handle new messages', () => {
    const newMessage: ChatMessage = {
      id: '2',
      content: 'New message',
      senderId: 'user2',
      roomId: 'room1',
      createdAt: new Date().toISOString(),
      readBy: [],
      type: 'TEXT',
    };

    messages$.next({
      type: 'new-text-message',
      message: newMessage,
    });

    jest.advanceTimersByTime(100);
    fixture.detectChanges();

    expect(component['messages']()).toContainEqual(newMessage);
  });

  it('should send message when form is valid', () => {
    const content = 'Test message';
    component['messageContent']().setValue(content);

    component['sendMessage']();

    expect(webSocketService.sendTextMessage).toHaveBeenCalledWith('room1', content);
    expect(component['messageContent']().value).toBe('');
  });

  it('should not send empty messages', () => {
    component['messageContent']().setValue('');
    component['sendMessage']();
    expect(webSocketService.sendTextMessage).not.toHaveBeenCalled();
  });

  it('should handle typing indicators', () => {
    jest.useFakeTimers();

    component['onMessageInput']();
    jest.advanceTimersByTime(300);

    expect(webSocketService.sendTypingIndicator).toHaveBeenCalledWith('room1', true);

    jest.advanceTimersByTime(2000);
    expect(webSocketService.sendTypingIndicator).toHaveBeenCalledWith('room1', false);

    jest.useRealTimers();
  });

  it('should handle file upload', () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const event = { target: { files: [file] } } as unknown as Event;

    fileUploadService.uploadFile.mockReturnValue(of(undefined));

    component['onFileSelected'](event);

    expect(fileUploadService.uploadFile).toHaveBeenCalledWith('room1', file);
    expect(component['isUploadingFile']()).toBeFalsy();
  });

  it('should handle file upload error', () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const event = { target: { files: [file] } } as unknown as Event;
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    fileUploadService.uploadFile.mockReturnValue(throwError(() => new Error('Upload failed')));

    component['onFileSelected'](event);

    expect(consoleSpy).toHaveBeenCalledWith('Upload failed:', expect.any(Error));
    expect(component['isUploadingFile']()).toBeFalsy();
  });

  it('should clean up on destroy', () => {
    component.ngOnDestroy();
    expect(webSocketService.disconnect).toHaveBeenCalled();
  });

  it('should identify own messages correctly', () => {
    const mockToken =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJ1c2VyMSJ9.fake-signature';

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key) => {
          if (key === 'accessToken') {
            return mockToken;
          }
          return null;
        }),
      },
      writable: true,
    });

    fixture = TestBed.createComponent(ChatBoxComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isConnected', true);
    fixture.componentRef.setInput('recipientName', 'Dr.Sarah Johnson');
    fixture.componentRef.setInput('roomId', 'room1');

    fixture.detectChanges();

    const ownMessage: ChatMessage = {
      id: '1',
      senderId: 'user1',
      content: 'test',
      roomId: 'room1',
      createdAt: new Date().toISOString(),
      readBy: [],
      type: 'TEXT' as const,
    };

    const otherMessage: ChatMessage = {
      ...ownMessage,
      senderId: 'user2',
    };

    expect(component['isOwnMessage'](ownMessage)).toBeTruthy();
    expect(component['isOwnMessage'](otherMessage)).toBeFalsy();
  });

  it('should add message and mark as read if not own message', () => {
    const newMessage: ChatMessage = {
      id: '2',
      content: 'New message',
      senderId: 'other-user',
      roomId: 'room1',
      createdAt: new Date().toISOString(),
      readBy: [],
      type: 'TEXT',
    };

    jest.useFakeTimers();
    messageService.markMessageAsRead.mockReturnValue(of(undefined));

    component['addMessage'](newMessage);

    expect(component['messages']()).toContainEqual(newMessage);

    jest.advanceTimersByTime(1000);
    expect(messageService.markMessageAsRead).toHaveBeenCalledWith('2');

    jest.useRealTimers();
  });

  it('should update message read status', () => {
    const initialMessage: ChatMessage = {
      id: '1',
      content: 'Hello',
      senderId: 'user1',
      roomId: 'room1',
      createdAt: new Date().toISOString(),
      readBy: ['user1'],
      type: 'TEXT',
    };

    component['messages'].set([initialMessage]);

    component['updateMessageReadStatus']('1', 'user2');

    const updatedMessages = component['messages']();
    expect(updatedMessages[0].readBy).toContain('user2');
  });

  it('should handle voice call controls', () => {
    component['startVoiceCall']();

    expect(component['isVideoCallMode']()).toBeFalsy();
    expect(component['showCallModal']()).toBeTruthy();
  });

  it('should close call modal', () => {
    component['showCallModal'].set(true);

    component['closeCallModal']();

    expect(component['showCallModal']()).toBeFalsy();
  });

  it('should handle file selection', () => {
    const mockClick = jest.fn();
    component['fileInput'] = jest.fn(() => ({
      nativeElement: {
        click: mockClick,
      },
    })) as any;

    component['selectFile']();

    expect(mockClick).toHaveBeenCalled();
  });

  it('should handle empty file selection', () => {
    const event = { target: { files: [] } } as unknown as Event;
    const uploadFileSpy = jest.spyOn(component as any, 'uploadFile');

    component['onFileSelected'](event);

    expect(uploadFileSpy).not.toHaveBeenCalled();
  });

  it('should handle invalid token in getCurrentUserId', () => {
    const mockStorage = window.localStorage;
    mockStorage.getItem.mockReturnValue('invalid-token');

    const userId = component['getCurrentUserId']();

    expect(userId).toBe('');
    expect(mockStorage.getItem).toHaveBeenCalledWith('accessToken');
  });

  it('should handle missing token in getCurrentUserId', () => {
    const mockStorage = window.localStorage;
    mockStorage.getItem.mockReturnValue(null);

    const userId = component['getCurrentUserId']();

    expect(userId).toBe('');
    expect(mockStorage.getItem).toHaveBeenCalledWith('accessToken');
  });

  it('should handle message-read event', () => {
    const initialMessage: ChatMessage = {
      id: '1',
      content: 'Hello',
      senderId: 'user1',
      roomId: 'room1',
      createdAt: new Date().toISOString(),
      readBy: ['user1'],
      type: 'TEXT',
    };

    component['messages'].set([initialMessage]);

    const messageReadEvent: WebSocketMessage = {
      type: 'message-read',
      messageId: '1',
      userId: 'user2',
    };

    messages$.next(messageReadEvent);

    const updatedMessages = component['messages']();
    expect(updatedMessages[0].readBy).toContain('user2');
  });

  it('should handle user-joined event', () => {
    const userJoinedEvent: WebSocketMessage = {
      type: 'user-joined',
    };

    expect(() => {
      messages$.next(userJoinedEvent);
    }).not.toThrow();
  });

  it('should handle connection error in initializeChat', () => {
    webSocketService.connect.mockReturnValue(throwError(() => new Error('Connection failed')));

    component['initializeChat']('room1');

    expect(component['connectionState']()).toBe('disconnected');
  });

  it('should handle error when loading messages', () => {
    messageService.getRoomMessages.mockReturnValue(
      throwError(() => new Error('Failed to load messages')),
    );

    component['loadMessages']('room1');

    expect(component['connectionState']()).toBe('disconnected');
  });

  it('should handle file message', () => {
    const fileMessage: WebSocketMessage = {
      type: 'new-file-message',
      message: {
        id: 'file1',
        content: 'file.txt',
        senderId: 'user1',
        roomId: 'room1',
        createdAt: new Date().toISOString(),
        readBy: [],
        type: 'FILE',
      },
    };

    component['handleFileMessage'](fileMessage);

    expect(component['messages']()).toContainEqual(fileMessage['message']);
  });

  describe('Video Call Controls', () => {
    it('should set video call mode and show modal when starting video call', () => {
      expect(component['isVideoCallMode']()).toBe(true);
      expect(component['showCallModal']()).toBe(false);

      component['startVideoCall']();

      expect(component['isVideoCallMode']()).toBe(true);
      expect(component['showCallModal']()).toBe(true);
    });

    it('should set voice call mode and show modal when starting voice call', () => {
      expect(component['isVideoCallMode']()).toBe(true);
      expect(component['showCallModal']()).toBe(false);

      component['startVoiceCall']();

      expect(component['isVideoCallMode']()).toBe(false);
      expect(component['showCallModal']()).toBe(true);
    });

    it('should close call modal', () => {
      component['showCallModal'].set(true);

      component['closeCallModal']();

      expect(component['showCallModal']()).toBe(false);
    });
  });

  describe('Typing Indicators', () => {
    it('should update stopped typing users', () => {
      const initialUsers = new Map<string, boolean>([
        ['user1', true],
        ['user2', true],
      ]);
      component['typingUsers'].set(initialUsers);

      const newUsers = new Map<string, boolean>([['user2', true]]);

      component['updateStoppedTypingUsers'](newUsers);

      const updatedUsers = component['typingUsers']();
      expect(updatedUsers.get('user1')).toBe(false);
      expect(updatedUsers.get('user2')).toBe(true);
    });

    it('should update active typing users', () => {
      const initialUsers = new Map<string, boolean>([['user1', false]]);
      component['typingUsers'].set(initialUsers);

      const newUsers = new Map<string, boolean>([
        ['user1', true],
        ['user2', true],
      ]);

      component['updateActiveTypingUsers'](newUsers);

      const updatedUsers = component['typingUsers']();
      expect(updatedUsers.get('user1')).toBe(true);
      expect(updatedUsers.get('user2')).toBe(true);
    });
  });
});
