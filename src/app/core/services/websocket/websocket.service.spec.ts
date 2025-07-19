/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { WebSocketService } from './websocket.service';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';

describe('WebSocketService', () => {
  let service: WebSocketService;
  let mockWebSocket: any;
  const mockToken = 'mock.token.123';
  const mockUserId = 'user123';
  const mockUserName = 'Test User';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WebSocketService],
    });

    service = TestBed.inject(WebSocketService);

    mockWebSocket = {
      readyState: 1,
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null,
      send: jest.fn(),
      close: jest.fn(),
    };

    Storage.prototype.getItem = jest.fn((key) => {
      if (key === 'accessToken') return mockToken;
      if (key === 'user_name') return mockUserName;
      return null;
    });

    global.atob = jest.fn(() => JSON.stringify({ userId: mockUserId, sub: mockUserId }));
    global.JSON.parse = jest.fn(JSON.parse);

    global.WebSocket = jest.fn(() => mockWebSocket) as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
    service.disconnect();
  });

  describe('connect', () => {
    let connectionSubject: Subject<void>;

    beforeEach(() => {
      mockWebSocket = {
        readyState: 0,
        onopen: jest.fn(),
        onmessage: jest.fn(),
        onerror: jest.fn(),
        onclose: jest.fn(),
        send: jest.fn(),
        close: jest.fn(),
      };

      global.WebSocket = jest.fn(() => mockWebSocket) as any;

      connectionSubject = new Subject<void>();
      (service as any).connectionSubject = connectionSubject;
    });

    it('should return observable immediately if already connected to same room', () => {
      service.connect('room1').subscribe();
      mockWebSocket.onopen();

      expect((service as any).connectionStatusSubject.value).toBe(true);
      expect((service as any).roomId()).toBe('room1');

      const result$ = service.connect('room1');

      let completed = false;
      result$.subscribe({
        complete: () => {
          completed = true;
        },
      });

      expect(completed).toBe(false);
      expect(WebSocket).toHaveBeenCalledTimes(2);
    });

    it('should create new connection if roomId is different', () => {
      service.connect('room1').subscribe();
      expect(WebSocket).toHaveBeenCalledTimes(1);

      service.connect('room2').subscribe();
      expect(WebSocket).toHaveBeenCalledTimes(2);
    });

    it('should setup socket handlers and send join message', async () => {
      const sendSpy = jest.spyOn(mockWebSocket, 'send');

      const connectPromise = service.connect('room1').pipe(take(1)).toPromise();

      expect(mockWebSocket.onopen).toBeDefined();
      expect(mockWebSocket.onmessage).toBeDefined();
      expect(mockWebSocket.onerror).toBeDefined();
      expect(mockWebSocket.onclose).toBeDefined();

      mockWebSocket.readyState = WebSocket.OPEN;
      mockWebSocket.onopen(new Event('open'));

      connectionSubject.next();

      await connectPromise;

      expect(sendSpy).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'join',
          roomId: 'room1',
          userId: mockUserId,
          userName: mockUserName,
          token: mockToken,
        }),
      );
    });

    it('should handle connection errors', (done) => {
      const error = new Error('Connection failed');

      const originalWebSocket = global.WebSocket;
      global.WebSocket = jest.fn(() => {
        throw error;
      }) as any;

      service.connect('room1').subscribe({
        next: () => done.fail('Should not emit next'),
        error: (err) => {
          expect(err).toEqual(error);
          global.WebSocket = originalWebSocket;
          done();
        },
        complete: () => done.fail('Should not complete'),
      });
    });
  });

  describe('socket handlers', () => {
    let error$: Subject<Error>;

    beforeEach(() => {
      error$ = new Subject<Error>();
      (service as any).errorSubject = error$;
      (service as any).errors$ = error$.asObservable();
      service.connect('room1').subscribe();
      mockWebSocket.onopen();
    });

    afterEach(() => {
      error$.complete();
    });

    it('should handle incoming messages', (done) => {
      const testMessage = { type: 'text-message', content: 'Hello' };

      service.messages$.pipe(take(1)).subscribe({
        next: (message) => {
          expect(message).toEqual(testMessage);
          done();
        },
        error: (err) => done(err),
      });

      mockWebSocket.onmessage({ data: JSON.stringify(testMessage) });
    });

    it('should handle invalid message data', fakeAsync(() => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const errorNextSpy = jest.spyOn((service as any).errorSubject, 'next');

      let errorReceived = false;
      error$.pipe(take(1)).subscribe({
        next: (error) => {
          expect(error.message).toBe('Failed to parse WebSocket message');
          expect(consoleErrorSpy).toHaveBeenCalledWith('Error parsing message:', expect.any(Error));
          errorReceived = true;
        },
      });

      mockWebSocket.onmessage({ data: 'invalid-json' });

      tick();

      expect(errorReceived).toBe(true);
      consoleErrorSpy.mockRestore();
    }));

    it('should handle socket errors', () => {
      const errorNextSpy = jest.spyOn((service as any).errorSubject, 'next');

      const errorEvent = new ErrorEvent('websocket error', {
        error: new Error('Network failure'),
      });
      mockWebSocket.onerror(errorEvent as any);

      expect(errorNextSpy).toHaveBeenCalledWith(new Error('WebSocket connection error'));
    });

    it('should handle socket close and attempt reconnect', () => {
      jest.useFakeTimers();
      const connectSpy = jest.spyOn(service, 'connect');

      mockWebSocket.onclose();

      jest.advanceTimersByTime(3000);
      expect(connectSpy).toHaveBeenCalledWith('room1', mockToken);
      jest.useRealTimers();
    });

    it('should stop reconnecting after max attempts', () => {
      jest.useFakeTimers();
      const connectSpy = jest.spyOn(service, 'connect');

      for (let i = 0; i < 6; i++) {
        mockWebSocket.onclose();
        jest.advanceTimersByTime(3000);
      }

      expect(connectSpy).toHaveBeenCalledTimes(5);
      jest.useRealTimers();
    });
  });

  describe('message sending', () => {
    let connect$: Subject<void>;

    beforeEach(() => {
      connect$ = new Subject<void>();
      (service as any).connectionSubject = connect$;
      service.connect('room1').subscribe();
      mockWebSocket.readyState = WebSocket.OPEN;
    });

    afterEach(() => {
      connect$.complete();
    });

    it('should send messages when connected', () => {
      const message = { type: 'test', content: 'test' };
      service.send(message);

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          ...message,
          token: mockToken,
        }),
      );
    });

    it('should not send messages when not connected', () => {
      mockWebSocket.readyState = 3;
      const message = { type: 'test', content: 'test' };
      service.send(message);

      expect(mockWebSocket.send).not.toHaveBeenCalled();
    });

    it('should send text messages', () => {
      service.sendTextMessage('room1', 'Hello');

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'text-message',
          roomId: 'room1',
          content: 'Hello',
          token: mockToken,
        }),
      );
    });

    it('should send typing indicators', () => {
      (mockWebSocket.send as jest.Mock).mockClear();
      connect$.next();
      connect$.complete();

      service.sendTypingIndicator('room1', true);

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'typing',
          roomId: 'room1',
          isTyping: true,
          token: mockToken,
        }),
      );
    });

    it('should send file messages', () => {
      const roomId = 'room1';
      const fileName = 'test.txt';
      const fileType = 'text/plain';
      const fileUrl = 'http://test.public.url';
      const fileSize = 7;
      const s3Key = 'test-key';
      const threadId = 'thread123';

      service.sendFileMessage(roomId, fileName, fileType, fileUrl, fileSize, s3Key, threadId);

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'file-message',
          roomId,
          fileName,
          fileType,
          fileUrl,
          fileSize,
          s3Key,
          threadId,
          token: mockToken,
        }),
      );
    });
  });

  describe('typing indicators', () => {
    it('should update typing users', () => {
      service.connect('room1').subscribe();
      mockWebSocket.onopen();

      const typingMessage = {
        type: 'typing-indicator',
        userId: 'otherUser',
        isTyping: true,
      };

      jest.useFakeTimers();
      mockWebSocket.onmessage({ data: JSON.stringify(typingMessage) });

      service.typingUsers$.pipe(take(1)).subscribe((users) => {
        expect(users.get('otherUser')).toBe(true);
      });

      jest.advanceTimersByTime(3000);
      service.typingUsers$.pipe(take(1)).subscribe((users) => {
        expect(users.get('otherUser')).toBe(false);
      });
      jest.useRealTimers();
    });

    it('should ignore own typing indicators', () => {
      service.connect('room1').subscribe();
      mockWebSocket.onopen();

      const typingMessage = {
        type: 'typing-indicator',
        userId: mockUserId,
        isTyping: true,
      };

      mockWebSocket.onmessage({ data: JSON.stringify(typingMessage) });

      service.typingUsers$.pipe(take(1)).subscribe((users) => {
        expect(users.has(mockUserId)).toBe(false);
      });
    });
  });

  describe('disconnect', () => {
    it('should close the socket connection', () => {
      service.connect('room1').subscribe();
      mockWebSocket.onopen();

      service.disconnect();

      expect(mockWebSocket.close).toHaveBeenCalled();
      service.connectionStatus$.pipe(take(1)).subscribe((status) => {
        expect(status).toBe(false);
      });
    });
  });

  describe('utility methods', () => {
    it('should get token from localStorage', () => {
      expect(service['getToken']()).toBe(mockToken);
    });

    it('should get user ID from token', () => {
      expect(service['getUserIdFromToken'](mockToken)).toBe(mockUserId);
    });

    it('should handle invalid token and return empty string', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      global.atob = jest.fn(() => {
        throw new Error('Invalid base64');
      });

      const result = service['getUserIdFromToken']('invalid.token');
      expect(result).toBe('');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error parsing token:', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });

    it('should handle falsy token and return empty string', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = service['getUserIdFromToken']('');
      expect(result).toBe('');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should get current user ID', () => {
      expect(service['getCurrentUserId']()).toBe(mockUserId);
    });

    it('should get current user ID with no token', () => {
      Storage.prototype.getItem = jest.fn((key) => null);
      expect(service['getCurrentUserId']()).toBe('');
    });

    it('should get user name from localStorage', () => {
      expect(service['getUserName']()).toBe(mockUserName);
    });

    it('should return Anonymous when user name is not in localStorage', () => {
      Storage.prototype.getItem = jest.fn((key) => {
        if (key === 'accessToken') return mockToken;
        return null;
      });
      expect(service['getUserName']()).toBe('Anonymous');
    });
  });

  describe('file handling', () => {
    beforeEach(() => {
      service.connect('room1').subscribe();
      mockWebSocket.onopen(new Event('open'));
    });

    describe('requestFileUpload', () => {
      it('should send file upload request and handle response', fakeAsync(() => {
        mockWebSocket.readyState = WebSocket.OPEN;

        const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
        const mockResponse = {
          uploadUrl: 'http://test.upload.url',
          publicUrl: 'http://test.public.url',
          s3Key: 'test-key',
          contentType: 'text/plain',
        };

        let responseReceived = false;
        service.requestFileUpload('room1', mockFile).subscribe({
          next: (response) => {
            expect(response).toEqual(mockResponse);
            responseReceived = true;
          },
          error: (err) => {
            throw err;
          },
        });

        expect(mockWebSocket.send).toHaveBeenCalledWith(
          JSON.stringify({
            type: 'file-upload-request',
            roomId: 'room1',
            fileName: 'test.txt',
            fileType: 'text/plain',
            fileSize: 7,
            token: mockToken,
          }),
        );

        mockWebSocket.onmessage({
          data: JSON.stringify({
            type: 'file-upload-url',
            ...mockResponse,
          }),
        });

        tick();

        expect(responseReceived).toBe(true);
      }));

      it('should timeout if no response received', (done) => {
        jest.useFakeTimers();
        const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });

        service.requestFileUpload('room1', mockFile).subscribe({
          next: () => done.fail('Should not succeed'),
          error: (err) => {
            expect(err.message).toBe('Upload request timeout');
            done();
          },
        });

        jest.advanceTimersByTime(10000);
        jest.useRealTimers();
      });
    });

    describe('message handlers', () => {
      it('should add and remove message handlers', (done) => {
        const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });

        service.requestFileUpload('room1', mockFile).subscribe({
          complete: () => {
            expect((service as any).messageHandlers.size).toBe(0);
            done();
          },
        });

        expect((service as any).messageHandlers.size).toBe(1);

        mockWebSocket.onmessage({ data: JSON.stringify({ type: 'file-upload-url' }) });
      });

      it('should handle errors in message handlers', fakeAsync(() => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

        // Register a handler that throws an error
        const faultyHandler = jest.fn().mockImplementation(() => {
          throw new Error('Handler error');
        });
        (service as any).addMessageHandler(faultyHandler);

        expect((service as any).messageHandlers.size).toBe(1);

        // Trigger a message to invoke the handler
        mockWebSocket.onmessage({
          data: JSON.stringify({ type: 'test-message' }),
        });

        tick();

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error in message handler:',
          expect.any(Error),
        );
        expect(faultyHandler).toHaveBeenCalledWith({ type: 'test-message' });
        consoleErrorSpy.mockRestore();
      }));
    });
  });
});
