/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { VideoCallModalComponent } from './video-call-modal.component';
import { WebSocketService } from '@core/services/websocket/websocket.service';
import { WebSocketMessage } from '@shared/models/websocket';
import { Subject } from 'rxjs';

describe('VideoCallModalComponent', () => {
  let component: VideoCallModalComponent;
  let fixture: ComponentFixture<VideoCallModalComponent>;
  let webSocketService: jest.Mocked<WebSocketService>;

  beforeEach(async () => {
    const webSocketServiceMock = {
      messages$: new Subject<WebSocketMessage>(),
      send: jest.fn(),
      connect: jest.fn(),
    } as unknown as jest.Mocked<WebSocketService>;

    Object.defineProperty(global.navigator, 'mediaDevices', {
      value: {
        getUserMedia: jest.fn(),
      },
      writable: true,
    });

    global.RTCPeerConnection = jest.fn().mockImplementation((config) => ({
      getConfiguration: jest.fn(() => config),
      addTrack: jest.fn(),
      createOffer: jest.fn(),
      createAnswer: jest.fn(),
      setLocalDescription: jest.fn(),
      setRemoteDescription: jest.fn(),
      addIceCandidate: jest.fn(),
      close: jest.fn(),
      onicecandidate: null,
      ontrack: null,
      onconnectionstatechange: null,
    })) as any;

    global.RTCSessionDescription = jest.fn();
    global.RTCIceCandidate = jest.fn();

    (global as any).MediaStream = class {
      constructor(tracks?: any[]) {
        this.tracks = tracks || [];
      }
      tracks: any[];
    };

    await TestBed.configureTestingModule({
      imports: [VideoCallModalComponent],
      providers: [{ provide: WebSocketService, useValue: webSocketServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(VideoCallModalComponent);
    component = fixture.componentInstance;
    webSocketService = TestBed.inject(WebSocketService) as jest.Mocked<WebSocketService>;

    fixture.componentRef.setInput('roomId', 'test-room');
    fixture.componentRef.setInput('recipientName', 'Test User');
    fixture.componentRef.setInput('isVideoCall', true);

    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize call and listen to WebSocket messages', () => {
      expect(webSocketService.messages$.subscribe).toBeTruthy();
      expect(webSocketService.send).toHaveBeenCalledWith({
        type: 'call-type',
        roomId: 'test-room',
        callType: 'video',
      });
    });
  });

  describe('ngOnDestroy', () => {
    it('should cleanup resources', () => {
      const cleanupSpy = jest.spyOn(component as any, 'cleanup');
      component.ngOnDestroy();
      expect(cleanupSpy).toHaveBeenCalled();
    });
  });

  describe('initializeMedia', () => {
    it('should initialize media with video constraints for video call', fakeAsync(() => {
      const mockStream = { getTracks: jest.fn(() => []) } as unknown as MediaStream;
      jest.spyOn(navigator.mediaDevices, 'getUserMedia').mockResolvedValue(mockStream);

      (component as any).initializeMedia().then(() => {
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
          audio: true,
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        });
      });

      tick();
    }));

    it('should initialize media without video for voice call', fakeAsync(() => {
      fixture.componentRef.setInput('isVideoCall', false);
      const mockStream = { getTracks: jest.fn(() => []) } as unknown as MediaStream;
      jest.spyOn(navigator.mediaDevices, 'getUserMedia').mockResolvedValue(mockStream);

      (component as any).initializeMedia().then(() => {
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
          audio: true,
          video: false,
        });
      });

      tick();
    }));
  });

  describe('initializePeerConnection', () => {
    it('should handle remote track event and update video element', () => {
      const mockStream = { getTracks: jest.fn(() => []) } as unknown as MediaStream;
      (component as any).localStream = mockStream;

      const mockRemoteVideo = {
        nativeElement: {
          srcObject: null,
        },
      };
      jest.spyOn(component as any, 'remoteVideoRef').mockReturnValue(mockRemoteVideo);

      (component as any).initializePeerConnection();

      expect(component['peerConnection']).toBeDefined();

      const mockEvent = {
        streams: [new MediaStream()],
      };
      if (component['peerConnection']?.ontrack) {
        component['peerConnection'].ontrack(mockEvent);
      }

      expect(mockRemoteVideo.nativeElement.srcObject).toBe(mockEvent.streams[0]);
      expect(component['callStatus']()).toBe('Connected');
    });

    it('should not set remote video if no video element', () => {
      const mockStream = { getTracks: jest.fn(() => []) } as unknown as MediaStream;
      (component as any).localStream = mockStream;

      jest.spyOn(component as any, 'remoteVideoRef').mockReturnValue(undefined);

      (component as any).initializePeerConnection();

      const mockEvent = {
        streams: [new MediaStream()],
      };
      if (component['peerConnection']?.ontrack) {
        component['peerConnection'].ontrack(mockEvent);
      }

      expect(component['callStatus']()).toBe('Connected');
    });

    it('should initialize peer connection with ICE servers', () => {
      const mockStream = { getTracks: jest.fn(() => []) } as unknown as MediaStream;
      (component as any).localStream = mockStream;

      (component as any).initializePeerConnection();

      expect(component['peerConnection']).toBeDefined();
      expect(RTCPeerConnection).toHaveBeenCalled();

      const config = (component['peerConnection'] as any).getConfiguration();
      expect(config.iceServers).toEqual([
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]);
    });
  });

  describe('handleWebSocketMessage', () => {
    it('should handle offer message', fakeAsync(async () => {
      const offerSpy = jest.spyOn(component as any, 'handleOffer');
      const mockOffer = { type: 'offer', offer: {} };

      (component as any).handleWebSocketMessage(mockOffer);
      tick();

      expect(offerSpy).toHaveBeenCalledWith(mockOffer);
    }));

    it('should handle answer message', fakeAsync(async () => {
      const answerSpy = jest.spyOn(component as any, 'handleAnswer');
      const mockAnswer = { type: 'answer', answer: {} };

      (component as any).handleWebSocketMessage(mockAnswer);
      tick();

      expect(answerSpy).toHaveBeenCalledWith(mockAnswer);
    }));

    it('should handle ice-candidate message', fakeAsync(async () => {
      const iceSpy = jest.spyOn(component as any, 'handleIceCandidate');
      const mockCandidate = { type: 'ice-candidate', candidate: {} };

      (component as any).handleWebSocketMessage(mockCandidate);
      tick();

      expect(iceSpy).toHaveBeenCalledWith(mockCandidate);
    }));

    it('should handle call-started message', () => {
      const mockMessage = { type: 'call-started', callId: '123' };
      (component as any).handleWebSocketMessage(mockMessage);
      expect(component['currentCallId']()).toBe('123');
    });

    it('should handle call-ended message', () => {
      const closeSpy = jest.spyOn(component, 'handleCloseModal');
      const mockMessage = { type: 'call-ended' };
      (component as any).handleWebSocketMessage(mockMessage);
      expect(closeSpy).toHaveBeenCalled();
    });
  });

  describe('UI interactions', () => {
    it('should toggle mute state', () => {
      const mockAudioTrack = {
        enabled: true,
        stop: jest.fn(),
        kind: 'audio',
      };

      const mockStream = {
        getAudioTracks: jest.fn(() => [mockAudioTrack]),
        getTracks: jest.fn(() => [mockAudioTrack]),
      } as unknown as MediaStream;

      component['localStream'] = mockStream;

      expect(component['isMuted']()).toBe(false);
      expect(mockAudioTrack.enabled).toBe(true);

      component['toggleMute']();
      expect(component['isMuted']()).toBe(true);
      expect(mockAudioTrack.enabled).toBe(false);

      component['toggleMute']();
      expect(component['isMuted']()).toBe(false);
      expect(mockAudioTrack.enabled).toBe(true);
    });

    it('should toggle video state', () => {
      const mockVideoTrack = {
        enabled: true,
        stop: jest.fn(),
        kind: 'video',
      };

      const mockStream = {
        getVideoTracks: jest.fn(() => [mockVideoTrack]),
        getTracks: jest.fn(() => [mockVideoTrack]),
      } as unknown as MediaStream;

      component['localStream'] = mockStream;
      fixture.componentRef.setInput('isVideoCall', true);

      expect(component['isVideoEnabled']()).toBe(true);
      expect(mockVideoTrack.enabled).toBe(true);

      component['toggleVideo']();
      expect(component['isVideoEnabled']()).toBe(false);
      expect(mockVideoTrack.enabled).toBe(false);

      component['toggleVideo']();
      expect(component['isVideoEnabled']()).toBe(true);
      expect(mockVideoTrack.enabled).toBe(true);
    });

    it('should end call and cleanup', () => {
      const cleanupSpy = jest.spyOn(component as any, 'cleanup');
      component['currentCallId'].set('123');

      component['endCall']();

      expect(webSocketService.send).toHaveBeenCalledWith({
        type: 'end-call',
        roomId: 'test-room',
        callId: '123',
      });
      expect(cleanupSpy).toHaveBeenCalled();
    });

    it('should close modal', () => {
      const emitSpy = jest.spyOn(component.closeModal, 'emit');
      component['handleCloseModal']();
      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe('getInitials', () => {
    it('should return initials from name', () => {
      expect(component['getInitials']('John Doe')).toBe('JD');
      expect(component['getInitials']('Alice')).toBe('A');
      expect(component['getInitials']('')).toBe('');
    });
  });
});
