/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { FileUploadService } from './file-upload.service';
import { WebSocketService } from '../websocket/websocket.service';

describe('FileUploadService', () => {
  let service: FileUploadService;
  let httpClientSpy: jest.Mocked<HttpClient>;
  let webSocketServiceSpy: jest.Mocked<WebSocketService>;

  const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
  const mockImageFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });
  const mockLargeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', {
    type: 'application/pdf',
  });
  const mockInvalidFile = new File(['content'], 'test.exe', { type: 'application/x-executable' });

  const mockUploadResponse = {
    uploadUrl: 'https://s3.amazonaws.com/bucket/key?signature=abc',
    contentType: 'application/pdf',
    s3Key: 'uploads/test-key',
  };

  beforeEach(() => {
    const httpSpy = {
      put: jest.fn(),
    };

    const wsSpy = {
      requestFileUpload: jest.fn(),
      sendFileMessage: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        FileUploadService,
        { provide: HttpClient, useValue: httpSpy },
        { provide: WebSocketService, useValue: wsSpy },
      ],
    });

    service = TestBed.inject(FileUploadService);
    httpClientSpy = TestBed.inject(HttpClient) as jest.Mocked<HttpClient>;
    webSocketServiceSpy = TestBed.inject(WebSocketService) as jest.Mocked<WebSocketService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile - Happy Path', () => {
    it('should successfully upload a valid PDF file', (done) => {
      const roomId = 'room123';
      const httpResponse = new HttpResponse({ status: 200, body: null });

      webSocketServiceSpy.requestFileUpload.mockReturnValue(of(mockUploadResponse));
      httpClientSpy.put.mockReturnValue(of(httpResponse));
      webSocketServiceSpy.sendFileMessage.mockReturnValue(undefined);

      service.uploadFile(roomId, mockFile).subscribe({
        next: () => {
          expect(webSocketServiceSpy.requestFileUpload).toHaveBeenCalledWith(roomId, mockFile);
          expect(httpClientSpy.put).toHaveBeenCalledWith(
            mockUploadResponse.uploadUrl,
            mockFile,
            expect.objectContaining({
              headers: expect.any(Object),
              observe: 'response',
            }),
          );
          expect(webSocketServiceSpy.sendFileMessage).toHaveBeenCalledWith(
            roomId,
            mockFile.name,
            mockFile.type,
            'https://s3.amazonaws.com/bucket/key',
            mockFile.size,
            mockUploadResponse.s3Key,
            undefined,
          );
          done();
        },
        error: done,
      });
    });

    it('should successfully upload an image file', (done) => {
      const roomId = 'room123';
      const httpResponse = new HttpResponse({ status: 200, body: null });

      webSocketServiceSpy.requestFileUpload.mockReturnValue(of(mockUploadResponse));
      httpClientSpy.put.mockReturnValue(of(httpResponse));
      webSocketServiceSpy.sendFileMessage.mockReturnValue(undefined);

      service.uploadFile(roomId, mockImageFile).subscribe({
        next: () => {
          expect(webSocketServiceSpy.requestFileUpload).toHaveBeenCalledWith(roomId, mockImageFile);
          done();
        },
        error: done,
      });
    });

    it('should successfully upload file with threadId', (done) => {
      const roomId = 'room123';
      const threadId = 'thread456';
      const httpResponse = new HttpResponse({ status: 200, body: null });

      webSocketServiceSpy.requestFileUpload.mockReturnValue(of(mockUploadResponse));
      httpClientSpy.put.mockReturnValue(of(httpResponse));
      webSocketServiceSpy.sendFileMessage.mockReturnValue(undefined);

      service.uploadFile(roomId, mockFile, threadId).subscribe({
        next: () => {
          expect(webSocketServiceSpy.sendFileMessage).toHaveBeenCalledWith(
            roomId,
            mockFile.name,
            mockFile.type,
            'https://s3.amazonaws.com/bucket/key',
            mockFile.size,
            mockUploadResponse.s3Key,
            threadId,
          );
          done();
        },
        error: done,
      });
    });

    it('should handle different allowed file types', (done) => {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
      ];

      let completedTests = 0;
      const totalTests = allowedTypes.length;

      allowedTypes.forEach((type) => {
        const testFile = new File(['content'], `test.${type.split('/')[1]}`, { type });
        const httpResponse = new HttpResponse({ status: 200, body: null });

        webSocketServiceSpy.requestFileUpload.mockReturnValue(of(mockUploadResponse));
        httpClientSpy.put.mockReturnValue(of(httpResponse));
        webSocketServiceSpy.sendFileMessage.mockReturnValue(undefined);

        service.uploadFile('room123', testFile).subscribe({
          next: () => {
            completedTests++;
            if (completedTests === totalTests) {
              done();
            }
          },
          error: done,
        });
      });
    });

    it('should handle file at maximum allowed size', (done) => {
      const maxSizeFile = new File(['x'.repeat(10 * 1024 * 1024)], 'max.pdf', {
        type: 'application/pdf',
      });
      const httpResponse = new HttpResponse({ status: 200, body: null });

      webSocketServiceSpy.requestFileUpload.mockReturnValue(of(mockUploadResponse));
      httpClientSpy.put.mockReturnValue(of(httpResponse));
      webSocketServiceSpy.sendFileMessage.mockReturnValue(undefined);

      service.uploadFile('room123', maxSizeFile).subscribe({
        next: () => {
          expect(webSocketServiceSpy.requestFileUpload).toHaveBeenCalled();
          done();
        },
        error: done,
      });
    });

    it('should handle empty room ID', (done) => {
      const httpResponse = new HttpResponse({ status: 200, body: null });

      webSocketServiceSpy.requestFileUpload.mockReturnValue(of(mockUploadResponse));
      httpClientSpy.put.mockReturnValue(of(httpResponse));
      webSocketServiceSpy.sendFileMessage.mockReturnValue(undefined);

      service.uploadFile('', mockFile).subscribe({
        next: () => {
          expect(webSocketServiceSpy.requestFileUpload).toHaveBeenCalledWith('', mockFile);
          done();
        },
        error: done,
      });
    });

    it('should handle file with special characters in name', (done) => {
      const specialFile = new File(['content'], 'test file (1) & more.pdf', {
        type: 'application/pdf',
      });
      const httpResponse = new HttpResponse({ status: 200, body: null });

      webSocketServiceSpy.requestFileUpload.mockReturnValue(of(mockUploadResponse));
      httpClientSpy.put.mockReturnValue(of(httpResponse));
      webSocketServiceSpy.sendFileMessage.mockReturnValue(undefined);

      service.uploadFile('room123', specialFile).subscribe({
        next: () => {
          expect(webSocketServiceSpy.sendFileMessage).toHaveBeenCalledWith(
            'room123',
            'test file (1) & more.pdf',
            specialFile.type,
            expect.any(String),
            specialFile.size,
            mockUploadResponse.s3Key,
            undefined,
          );
          done();
        },
        error: done,
      });
    });

    it('should handle zero-byte file', (done) => {
      const emptyFile = new File([''], 'empty.pdf', { type: 'application/pdf' });
      const httpResponse = new HttpResponse({ status: 200, body: null });

      webSocketServiceSpy.requestFileUpload.mockReturnValue(of(mockUploadResponse));
      httpClientSpy.put.mockReturnValue(of(httpResponse));
      webSocketServiceSpy.sendFileMessage.mockReturnValue(undefined);

      service.uploadFile('room123', emptyFile).subscribe({
        next: () => {
          expect(webSocketServiceSpy.requestFileUpload).toHaveBeenCalledWith('room123', emptyFile);
          done();
        },
        error: done,
      });
    });

    it('should extract correct file URL from presigned URL', (done) => {
      const complexUrl =
        'https://s3.amazonaws.com/bucket/folder/file.pdf?AWSAccessKeyId=123&Expires=456&Signature=789';
      const complexUploadResponse = { ...mockUploadResponse, uploadUrl: complexUrl };
      const httpResponse = new HttpResponse({ status: 200, body: null });

      webSocketServiceSpy.requestFileUpload.mockReturnValue(of(complexUploadResponse));
      httpClientSpy.put.mockReturnValue(of(httpResponse));
      webSocketServiceSpy.sendFileMessage.mockReturnValue(undefined);

      service.uploadFile('room123', mockFile).subscribe({
        next: () => {
          expect(webSocketServiceSpy.sendFileMessage).toHaveBeenCalledWith(
            'room123',
            mockFile.name,
            mockFile.type,
            'https://s3.amazonaws.com/bucket/folder/file.pdf',
            mockFile.size,
            mockUploadResponse.s3Key,
            undefined,
          );
          done();
        },
        error: done,
      });
    });

    it('should handle URL without query parameters', (done) => {
      const simpleUrl = 'https://s3.amazonaws.com/bucket/file.pdf';
      const simpleUploadResponse = { ...mockUploadResponse, uploadUrl: simpleUrl };
      const httpResponse = new HttpResponse({ status: 200, body: null });

      webSocketServiceSpy.requestFileUpload.mockReturnValue(of(simpleUploadResponse));
      httpClientSpy.put.mockReturnValue(of(httpResponse));
      webSocketServiceSpy.sendFileMessage.mockReturnValue(undefined);

      service.uploadFile('room123', mockFile).subscribe({
        next: () => {
          expect(webSocketServiceSpy.sendFileMessage).toHaveBeenCalledWith(
            'room123',
            mockFile.name,
            mockFile.type,
            simpleUrl,
            mockFile.size,
            mockUploadResponse.s3Key,
            undefined,
          );
          done();
        },
        error: done,
      });
    });

    it('should handle long room ID and thread ID', (done) => {
      const longRoomId = 'a'.repeat(1000);
      const longThreadId = 'b'.repeat(1000);
      const httpResponse = new HttpResponse({ status: 200, body: null });

      webSocketServiceSpy.requestFileUpload.mockReturnValue(of(mockUploadResponse));
      httpClientSpy.put.mockReturnValue(of(httpResponse));
      webSocketServiceSpy.sendFileMessage.mockReturnValue(undefined);

      service.uploadFile(longRoomId, mockFile, longThreadId).subscribe({
        next: () => {
          expect(webSocketServiceSpy.requestFileUpload).toHaveBeenCalledWith(longRoomId, mockFile);
          expect(webSocketServiceSpy.sendFileMessage).toHaveBeenCalledWith(
            longRoomId,
            mockFile.name,
            mockFile.type,
            expect.any(String),
            mockFile.size,
            mockUploadResponse.s3Key,
            longThreadId,
          );
          done();
        },
        error: done,
      });
    });

    it('should handle file with minimum size (1 byte)', (done) => {
      const minFile = new File(['a'], 'min.pdf', { type: 'application/pdf' });
      const httpResponse = new HttpResponse({ status: 200, body: null });

      webSocketServiceSpy.requestFileUpload.mockReturnValue(of(mockUploadResponse));
      httpClientSpy.put.mockReturnValue(of(httpResponse));
      webSocketServiceSpy.sendFileMessage.mockReturnValue(undefined);

      service.uploadFile('room123', minFile).subscribe({
        next: () => {
          expect(webSocketServiceSpy.requestFileUpload).toHaveBeenCalledWith('room123', minFile);
          done();
        },
        error: done,
      });
    });

    it('should handle all image types correctly', (done) => {
      const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      let completedTests = 0;

      imageTypes.forEach((type) => {
        const imageFile = new File(['image'], `test.${type.split('/')[1]}`, { type });
        const httpResponse = new HttpResponse({ status: 200, body: null });

        webSocketServiceSpy.requestFileUpload.mockReturnValue(of(mockUploadResponse));
        httpClientSpy.put.mockReturnValue(of(httpResponse));
        webSocketServiceSpy.sendFileMessage.mockReturnValue(undefined);

        service.uploadFile('room123', imageFile).subscribe({
          next: () => {
            completedTests++;
            if (completedTests === imageTypes.length) {
              done();
            }
          },
          error: done,
        });
      });
    });
  });

  describe('uploadFile - Negative Path', () => {
    it('should throw error for file size exceeding limit', () => {
      expect(() => {
        service.uploadFile('room123', mockLargeFile).subscribe();
      }).toThrow('File size exceeds 10MB limit');
    });

    it('should throw error for invalid file type', () => {
      expect(() => {
        service.uploadFile('room123', mockInvalidFile).subscribe();
      }).toThrow('File type not allowed');
    });

    it('should handle WebSocket request failure', (done) => {
      webSocketServiceSpy.requestFileUpload.mockReturnValue(
        throwError(() => new Error('WebSocket error')),
      );

      service.uploadFile('room123', mockFile).subscribe({
        next: () => done(new Error('Should not succeed')),
        error: (error) => {
          expect(error.message).toBe('WebSocket error');
          done();
        },
      });
    });

    it('should handle S3 upload failure with non-200 status', (done) => {
      const httpResponse = new HttpResponse({ status: 500, body: null });

      webSocketServiceSpy.requestFileUpload.mockReturnValue(of(mockUploadResponse));
      httpClientSpy.put.mockReturnValue(of(httpResponse));

      service.uploadFile('room123', mockFile).subscribe({
        next: () => done(new Error('Should not succeed')),
        error: (error) => {
          expect(error.message).toBe('Upload failed');
          done();
        },
      });
    });

    it('should handle HTTP client error during S3 upload', (done) => {
      webSocketServiceSpy.requestFileUpload.mockReturnValue(of(mockUploadResponse));
      httpClientSpy.put.mockReturnValue(throwError(() => new Error('Network error')));

      service.uploadFile('room123', mockFile).subscribe({
        next: () => done(new Error('Should not succeed')),
        error: (error) => {
          expect(error.message).toBe('Network error');
          done();
        },
      });
    });

    it('should handle null file input', () => {
      expect(() => {
        service.uploadFile('room123', null as any).subscribe();
      }).toThrow();
    });

    it('should handle undefined file input', () => {
      expect(() => {
        service.uploadFile('room123', undefined as any).subscribe();
      }).toThrow();
    });

    it('should handle null room ID', (done) => {
      webSocketServiceSpy.requestFileUpload.mockReturnValue(
        throwError(() => new Error('Invalid room ID')),
      );

      service.uploadFile(null as any, mockFile).subscribe({
        next: () => done(new Error('Should not succeed')),
        error: (error) => {
          expect(error.message).toBe('Invalid room ID');
          done();
        },
      });
    });

    it('should handle undefined room ID', (done) => {
      webSocketServiceSpy.requestFileUpload.mockReturnValue(
        throwError(() => new Error('Invalid room ID')),
      );

      service.uploadFile(undefined as any, mockFile).subscribe({
        next: () => done(new Error('Should not succeed')),
        error: (error) => {
          expect(error.message).toBe('Invalid room ID');
          done();
        },
      });
    });

    it('should handle malformed upload response', (done) => {
      const malformedResponse = { invalidProperty: 'test' };

      webSocketServiceSpy.requestFileUpload.mockReturnValue(of(malformedResponse));

      service.uploadFile('room123', mockFile).subscribe({
        next: () => done(new Error('Should not succeed')),
        error: (error) => {
          expect(error).toBeDefined();
          done();
        },
      });
    });

    it('should handle empty upload response', (done) => {
      webSocketServiceSpy.requestFileUpload.mockReturnValue(of({}));

      service.uploadFile('room123', mockFile).subscribe({
        next: () => done(new Error('Should not succeed')),
        error: (error) => {
          expect(error).toBeDefined();
          done();
        },
      });
    });

    it('should handle file with invalid MIME type but correct extension', () => {
      const invalidMimeFile = new File(['content'], 'test.pdf', { type: 'text/html' });

      expect(() => {
        service.uploadFile('room123', invalidMimeFile).subscribe();
      }).toThrow('File type not allowed');
    });

    it('should handle extremely large file size', () => {
      const hugeFile = new File(['x'.repeat(100 * 1024 * 1024)], 'huge.pdf', {
        type: 'application/pdf',
      });

      expect(() => {
        service.uploadFile('room123', hugeFile).subscribe();
      }).toThrow('File size exceeds 10MB limit');
    });

    it('should handle S3 upload with 404 status', (done) => {
      const httpResponse = new HttpResponse({ status: 404, body: null });

      webSocketServiceSpy.requestFileUpload.mockReturnValue(of(mockUploadResponse));
      httpClientSpy.put.mockReturnValue(of(httpResponse));

      service.uploadFile('room123', mockFile).subscribe({
        next: () => done(new Error('Should not succeed')),
        error: (error) => {
          expect(error.message).toBe('Upload failed');
          done();
        },
      });
    });

    it('should handle S3 upload with 403 status', (done) => {
      const httpResponse = new HttpResponse({ status: 403, body: null });

      webSocketServiceSpy.requestFileUpload.mockReturnValue(of(mockUploadResponse));
      httpClientSpy.put.mockReturnValue(of(httpResponse));

      service.uploadFile('room123', mockFile).subscribe({
        next: () => done(new Error('Should not succeed')),
        error: (error) => {
          expect(error.message).toBe('Upload failed');
          done();
        },
      });
    });

    it('should handle WebSocket sendFileMessage throwing error', (done) => {
      const httpResponse = new HttpResponse({ status: 200, body: null });

      webSocketServiceSpy.requestFileUpload.mockReturnValue(of(mockUploadResponse));
      httpClientSpy.put.mockReturnValue(of(httpResponse));
      webSocketServiceSpy.sendFileMessage.mockImplementation(() => {
        throw new Error('WebSocket send error');
      });

      service.uploadFile('room123', mockFile).subscribe({
        next: () => done(new Error('Should not succeed')),
        error: (error) => {
          expect(error.message).toBe('WebSocket send error');
          done();
        },
      });
    });

    it('should handle concurrent upload requests', (done) => {
      const httpResponse = new HttpResponse({ status: 200, body: null });

      webSocketServiceSpy.requestFileUpload.mockReturnValue(of(mockUploadResponse));
      httpClientSpy.put.mockReturnValue(of(httpResponse));
      webSocketServiceSpy.sendFileMessage.mockReturnValue(undefined);

      let completedUploads = 0;
      const totalUploads = 5;

      for (let i = 0; i < totalUploads; i++) {
        const testFile = new File([`content${i}`], `test${i}.pdf`, { type: 'application/pdf' });

        service.uploadFile(`room${i}`, testFile).subscribe({
          next: () => {
            completedUploads++;
            if (completedUploads === totalUploads) {
              expect(webSocketServiceSpy.requestFileUpload).toHaveBeenCalledTimes(totalUploads);
              done();
            }
          },
          error: done,
        });
      }
    });
  });

  describe('isImage', () => {
    it('should return true for JPEG files', () => {
      expect(service.isImage('image/jpeg')).toBe(true);
    });

    it('should return true for PNG files', () => {
      expect(service.isImage('image/png')).toBe(true);
    });

    it('should return true for GIF files', () => {
      expect(service.isImage('image/gif')).toBe(true);
    });

    it('should return true for WebP files', () => {
      expect(service.isImage('image/webp')).toBe(true);
    });

    it('should return false for PDF files', () => {
      expect(service.isImage('application/pdf')).toBe(false);
    });

    it('should return false for Word documents', () => {
      expect(service.isImage('application/msword')).toBe(false);
    });

    it('should return false for text files', () => {
      expect(service.isImage('text/plain')).toBe(false);
    });

    it('should return false for unknown image types', () => {
      expect(service.isImage('image/bmp')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(service.isImage('')).toBe(false);
    });

    it('should return false for null input', () => {
      expect(service.isImage(null as any)).toBe(false);
    });

    it('should return false for undefined input', () => {
      expect(service.isImage(undefined as any)).toBe(false);
    });

    it('should handle case sensitivity', () => {
      expect(service.isImage('IMAGE/JPEG')).toBe(false);
      expect(service.isImage('Image/Png')).toBe(false);
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(service.formatFileSize(0)).toBe('0 B');
      expect(service.formatFileSize(500)).toBe('500 B');
      expect(service.formatFileSize(1023)).toBe('1023 B');
    });

    it('should format kilobytes correctly', () => {
      expect(service.formatFileSize(1024)).toBe('1.0 KB');
      expect(service.formatFileSize(1536)).toBe('1.5 KB');
      expect(service.formatFileSize(2048)).toBe('2.0 KB');
      expect(service.formatFileSize(1048575)).toBe('1024.0 KB');
    });

    it('should format megabytes correctly', () => {
      expect(service.formatFileSize(1048576)).toBe('1.0 MB');
      expect(service.formatFileSize(1572864)).toBe('1.5 MB');
      expect(service.formatFileSize(2097152)).toBe('2.0 MB');
      expect(service.formatFileSize(10485760)).toBe('10.0 MB');
    });

    it('should handle decimal precision correctly', () => {
      expect(service.formatFileSize(1126)).toBe('1.1 KB');
      expect(service.formatFileSize(1126400)).toBe('1.1 MB');
    });

    it('should handle edge cases', () => {
      expect(service.formatFileSize(1)).toBe('1 B');
      expect(service.formatFileSize(1025)).toBe('1.0 KB');
      expect(service.formatFileSize(1048577)).toBe('1.0 MB');
    });

    it('should handle zero', () => {
      expect(service.formatFileSize(0)).toBe('0 B');
    });

    it('should handle very large numbers', () => {
      expect(service.formatFileSize(1073741824)).toBe('1024.0 MB');
      expect(service.formatFileSize(Number.MAX_SAFE_INTEGER)).toContain('MB');
    });

    it('should handle floating point inputs', () => {
      expect(service.formatFileSize(1024.5)).toBe('1.0 KB');
      expect(service.formatFileSize(1048576.7)).toBe('1.0 MB');
    });
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have correct constants defined', () => {
      expect((service as any).MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
      expect((service as any).ALLOWED_IMAGE_TYPES).toEqual([
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
      ]);
      expect((service as any).ALLOWED_FILE_TYPES).toContain('application/pdf');
      expect((service as any).ALLOWED_FILE_TYPES).toContain('application/msword');
      expect((service as any).ALLOWED_FILE_TYPES).toContain('text/plain');
    });

    it('should inject dependencies correctly', () => {
      expect((service as any).http).toBeDefined();
      expect((service as any).wsService).toBeDefined();
    });
  });
});
