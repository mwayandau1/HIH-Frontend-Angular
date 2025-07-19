import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  signal,
  inject,
  DestroyRef,
  viewChild,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  X,
} from 'lucide-angular';
import { ButtonComponent } from '@shared/components';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WebSocketService } from '@core/services/websocket/websocket.service';
import { WebSocketMessage } from '@shared/models/websocket';

@Component({
  selector: 'app-video-call-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ButtonComponent],
  templateUrl: './video-call-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoCallModalComponent implements OnInit, OnDestroy {
  private readonly localVideoRef = viewChild<ElementRef<HTMLVideoElement>>('localVideo');
  private readonly remoteVideoRef = viewChild<ElementRef<HTMLVideoElement>>('remoteVideo');

  public readonly roomId = input.required<string>();
  public readonly recipientName = input.required<string>();
  public readonly isVideoCall = input.required<boolean>();

  public readonly closeModal = output<void>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly webSocketService = inject(WebSocketService);

  private peerConnection?: RTCPeerConnection;
  private localStream?: MediaStream;
  private readonly currentCallId = signal('');

  protected readonly isMuted = signal(false);
  protected readonly isVideoEnabled = signal(true);
  protected readonly callStatus = signal<'Connecting...' | 'Connected' | 'Failed'>('Connecting...');

  protected readonly icons = {
    Video,
    VideoOff,
    Mic,
    MicOff,
    Phone,
    PhoneOff,
    X,
  };

  ngOnInit(): void {
    this.initializeCall();

    this.webSocketService.messages$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((message) => this.handleWebSocketMessage(message));
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private async initializeCall(): Promise<void> {
    try {
      await this.initializeMedia();

      this.webSocketService.send({
        type: 'call-type',
        roomId: this.roomId(),
        callType: this.isVideoCall() ? 'video' : 'voice',
      });

      this.initializePeerConnection();

      await this.createOffer();
    } catch (error) {
      console.error('Failed to initialize call:', error);
      this.callStatus.set('Failed');
    }
  }

  private async initializeMedia(): Promise<void> {
    try {
      const constraints = {
        audio: true,
        video: this.isVideoCall()
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
            }
          : false,
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);

      if (this.isVideoCall() && this.localVideoRef()) {
        const localVideoElement = this.localVideoRef()?.nativeElement;
        if (localVideoElement) {
          localVideoElement.srcObject = this.localStream;
        }
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  private initializePeerConnection(): void {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    this.peerConnection = new RTCPeerConnection(configuration);

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });
    }

    this.peerConnection.ontrack = (event) => {
      if (this.remoteVideoRef() && event.streams[0]) {
        const remoteVideoElement = this.remoteVideoRef()?.nativeElement;
        if (remoteVideoElement) {
          remoteVideoElement.srcObject = event.streams[0];
        }
      }
      this.callStatus.set('Connected');
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.webSocketService.send({
          type: 'ice-candidate',
          roomId: this.roomId(),
          candidate: event.candidate,
          targetUserId: this.getTargetUserId(),
        });
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection?.connectionState === 'connected') {
        this.callStatus.set('Connected');
      }
    };
  }

  private async createOffer(): Promise<void> {
    if (!this.peerConnection) return;

    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: this.isVideoCall(),
      });

      await this.peerConnection.setLocalDescription(offer);

      this.webSocketService.send({
        type: 'offer',
        roomId: this.roomId(),
        offer: offer,
        targetUserId: this.getTargetUserId(),
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }

  private handleWebSocketMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'offer':
        this.handleOffer(message);
        break;
      case 'answer':
        this.handleAnswer(message);
        break;
      case 'ice-candidate':
        this.handleIceCandidate(message);
        break;
      case 'call-started':
        this.currentCallId.set(message['callId']);
        break;
      case 'call-ended':
        this.handleCloseModal();
        break;
    }
  }

  private async handleOffer(message: WebSocketMessage): Promise<void> {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(message['offer'] as RTCSessionDescriptionInit),
      );

      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      this.webSocketService.send({
        type: 'answer',
        roomId: this.roomId(),
        answer: answer,
        targetUserId: message['fromUserId'] as string,
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  private async handleAnswer(message: WebSocketMessage): Promise<void> {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(message['answer'] as RTCSessionDescriptionInit),
      );
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  private async handleIceCandidate(message: WebSocketMessage): Promise<void> {
    if (!this.peerConnection || !message['candidate']) return;

    try {
      await this.peerConnection.addIceCandidate(
        new RTCIceCandidate(message['candidate'] as RTCIceCandidateInit),
      );
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  protected toggleMute(): void {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      this.isMuted.set(!audioTracks[0]?.enabled);
    }
  }

  protected toggleVideo(): void {
    if (this.localStream && this.isVideoCall()) {
      const videoTracks = this.localStream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      this.isVideoEnabled.set(videoTracks[0]?.enabled ?? false);
    }
  }

  protected endCall(): void {
    this.cleanup();

    if (this.currentCallId) {
      this.webSocketService.send({
        type: 'end-call',
        roomId: this.roomId(),
        callId: this.currentCallId(),
      });
    }

    this.handleCloseModal();
  }

  protected handleCloseModal(): void {
    this.cleanup();
    this.closeModal.emit();
  }

  private cleanup(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
    }

    if (this.peerConnection) {
      this.peerConnection.close();
    }

    if (this.localVideoRef()) {
      const localVideoElement = this.localVideoRef()?.nativeElement;
      if (localVideoElement) {
        localVideoElement.srcObject = null;
      }
    }
    if (this.remoteVideoRef()) {
      const remoteVideoElement = this.remoteVideoRef()?.nativeElement;
      if (remoteVideoElement) {
        remoteVideoElement.srcObject = null;
      }
    }
  }

  private getTargetUserId(): string {
    return 'recipient-user-id';
  }

  protected getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
