import { Component, ChangeDetectionStrategy, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Check,
  CheckCheck,
  Download,
  FileText,
  Image,
  File,
} from 'lucide-angular';
import { ChatMessage } from '@shared/models/websocket';
import { getInitials } from '@shared/utils/helpers/formatting';
import { formatTime } from '@shared/utils/helpers/dates';
import { ImagePreviewModalComponent } from '../image-preview-modal/image-preview-modal.component';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-chat-bubble',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ImagePreviewModalComponent, ButtonComponent],
  templateUrl: './chat-bubble.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatBubbleComponent {
  public readonly message = input.required<ChatMessage>();
  public readonly isOwn = input.required<boolean>();

  public readonly name = input.required<string>();

  protected showImagePreview = signal(false);
  protected readonly getProviderInitials = getInitials;
  protected readonly formatTime = formatTime;
  protected isImageLoaded = signal(false);
  protected imageLoadError = signal(false);
  protected readonly icons = { Check, CheckCheck, Download, FileText, Image, File };

  protected getFileIcon(fileType: string) {
    if (fileType.startsWith('image/')) return this.icons.Image;
    return this.icons.FileText;
  }

  protected formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  protected openImage(): void {
    this.showImagePreview.set(true);
  }

  protected closeImagePreview(): void {
    this.showImagePreview.set(false);
  }

  protected downloadFile(): void {
    const link = document.createElement('a');
    link.href = this.message().fileUrl ?? '';
    link.download = this.message().fileName ?? '';
    link.click();
  }

  onImageLoad(): void {
    this.isImageLoaded.set(true);
    this.imageLoadError.set(false);
  }

  onImageError(): void {
    this.imageLoadError.set(true);
    this.isImageLoaded.set(false);
  }

  protected getFileUrl(): string {
    const url = this.message().fileUrl ?? '';
    return url.includes('?') ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`;
  }
}
