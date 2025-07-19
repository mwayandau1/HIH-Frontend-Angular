/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap, map, tap } from 'rxjs';
import { WebSocketService } from '../websocket/websocket.service';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  private readonly http = inject(HttpClient);
  private readonly wsService = inject(WebSocketService);

  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024;
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private readonly ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    ...this.ALLOWED_IMAGE_TYPES,
  ];

  public uploadFile(
    roomId: string,
    file: File,
    threadId?: string,
  ): Observable<{ fileUrl: string; s3Key: string }> {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error('File size exceeds 10MB limit');
    }

    if (!this.ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error('File type not allowed');
    }

    return this.wsService.requestFileUpload(roomId, file).pipe(
      switchMap((uploadResponse: any) => {
        return this.uploadToS3(uploadResponse.uploadUrl, file, uploadResponse.contentType).pipe(
          map(() => ({
            fileUrl: uploadResponse.publicUrl ?? uploadResponse.uploadUrl.split('?')[0],
            s3Key: uploadResponse.s3Key,
          })),
        );
      }),
      tap(({ fileUrl, s3Key }) => {
        this.wsService.sendFileMessage(
          roomId,
          file.name,
          file.type,
          fileUrl,
          file.size,
          s3Key,
          threadId,
        );
      }),
    );
  }

  private uploadToS3(presignedUrl: string, file: File, contentType?: string): Observable<string> {
    const headers = new HttpHeaders({
      'Content-Type': contentType ?? file.type,
    });

    return this.http.put(presignedUrl, file, { headers, observe: 'response' }).pipe(
      map((response) => {
        if (response.status === 200) {
          return presignedUrl.split('?')[0];
        }
        throw new Error('Upload failed');
      }),
    );
  }

  public isImage(fileType: string): boolean {
    return this.ALLOWED_IMAGE_TYPES.includes(fileType);
  }

  public formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
