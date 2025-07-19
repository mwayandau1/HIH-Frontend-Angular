import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatBubbleComponent } from './chat-bubble.component';
import { ButtonComponent } from '../button/button.component';
import { ImagePreviewModalComponent } from '../image-preview-modal/image-preview-modal.component';
import { ChatMessage } from '@shared/models/websocket';

describe('ChatBubbleComponent', () => {
  let component: ChatBubbleComponent;
  let fixture: ComponentFixture<ChatBubbleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatBubbleComponent, ButtonComponent, ImagePreviewModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatBubbleComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('message', {
      fileUrl: 'http://example.com/image.png',
      fileName: 'image.png',
    } as ChatMessage);
    fixture.componentRef.setInput('isOwn', false);
    fixture.componentRef.setInput('message', {} as ChatMessage);
    fixture.componentRef.setInput('name', 'Dr. Sarah Johnson');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Helper methods', () => {
    it('should return correct file icon', () => {
      expect(component['getFileIcon']('image/png')).toBe(component['icons'].Image);
      expect(component['getFileIcon']('application/pdf')).toBe(component['icons'].FileText);
    });

    it('should format file sizes correctly', () => {
      expect(component['formatFileSize'](500)).toBe('500 Bytes');
      expect(component['formatFileSize'](1024)).toBe('1 KB');
      expect(component['formatFileSize'](1500)).toBe('1.46 KB');
      expect(component['formatFileSize'](1048576)).toBe('1 MB');
    });
  });

  describe('Image Preview', () => {
    it('should open image preview', () => {
      component['openImage']();
      expect(component['showImagePreview']()).toBe(true);
    });

    it('should close image preview', () => {
      component['showImagePreview'].set(true);
      component['closeImagePreview']();
      expect(component['showImagePreview']()).toBe(false);
    });
  });

  describe('File Download', () => {
    let mockAnchor: {
      href: string;
      download: string;
      click: jest.Mock;
    };

    beforeEach(() => {
      mockAnchor = {
        href: '',
        download: '',
        click: jest.fn(),
      };

      jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        return tagName === 'a'
          ? (mockAnchor as unknown as HTMLElement)
          : document.createElement(tagName);
      });

      fixture.componentRef.setInput('message', {
        fileUrl: 'http://test.com/file.pdf',
        fileName: 'document.pdf',
      } as ChatMessage);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should create anchor element with correct properties and trigger click', () => {
      component['downloadFile']();

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockAnchor.href).toBe('http://test.com/file.pdf');
      expect(mockAnchor.download).toBe('document.pdf');
      expect(mockAnchor.click).toHaveBeenCalled();
    });

    it('should handle empty fileUrl and fileName', () => {
      fixture.componentRef.setInput('message', {
        fileUrl: undefined,
        fileName: undefined,
      } as ChatMessage);

      component['downloadFile']();

      expect(mockAnchor.href).toBe('');
      expect(mockAnchor.download).toBe('');
      expect(mockAnchor.click).toHaveBeenCalled();
    });

    it('should handle null fileUrl and fileName', () => {
      fixture.componentRef.setInput('message', {
        fileUrl: null,
        fileName: null,
      } as ChatMessage);

      component['downloadFile']();

      expect(mockAnchor.href).toBe('');
      expect(mockAnchor.download).toBe('');
      expect(mockAnchor.click).toHaveBeenCalled();
    });

    it('should trigger file download', () => {
      const mockClick = jest.fn();
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn().mockImplementation((tagName) => {
        if (tagName === 'a') {
          return {
            href: '',
            download: '',
            click: mockClick,
          };
        }
        return originalCreateElement(tagName);
      });

      component['downloadFile']();

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockClick).toHaveBeenCalled();

      document.createElement = originalCreateElement;
    });

    it('should trigger file download with correct URL and filename', () => {
      const mockClick = jest.fn();
      const originalCreateElement = document.createElement;

      let linkHref = '';
      let linkDownload = '';

      document.createElement = jest.fn().mockImplementation((tagName) => {
        if (tagName === 'a') {
          return {
            set href(value: string) {
              linkHref = value;
            },
            get href() {
              return linkHref;
            },
            set download(value: string) {
              linkDownload = value;
            },
            get download() {
              return linkDownload;
            },
            click: mockClick,
          };
        }
        return originalCreateElement(tagName);
      });

      fixture.componentRef.setInput('message', {
        fileUrl: 'http://test.com/file.pdf',
        fileName: 'document.pdf',
      } as ChatMessage);

      component['downloadFile']();

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(linkHref).toBe('http://test.com/file.pdf');
      expect(linkDownload).toBe('document.pdf');
      expect(mockClick).toHaveBeenCalled();

      document.createElement = originalCreateElement;
    });

    it('should handle empty fileUrl and fileName', () => {
      const mockClick = jest.fn();
      const originalCreateElement = document.createElement;

      let linkHref = '';
      let linkDownload = '';

      document.createElement = jest.fn().mockImplementation((tagName) => {
        if (tagName === 'a') {
          return {
            set href(value: string) {
              linkHref = value;
            },
            set download(value: string) {
              linkDownload = value;
            },
            click: mockClick,
          };
        }
        return originalCreateElement(tagName);
      });

      fixture.componentRef.setInput('message', {
        fileUrl: '',
        fileName: '',
      } as ChatMessage);

      component['downloadFile']();

      expect(linkHref).toBe('');
      expect(linkDownload).toBe('');
      expect(mockClick).toHaveBeenCalled();

      document.createElement = originalCreateElement;
    });
  });

  describe('formatFileSize', () => {
    it('should handle 0 bytes', () => {
      expect(component['formatFileSize'](0)).toBe('0 Bytes');
    });

    it('should format bytes correctly', () => {
      expect(component['formatFileSize'](1)).toBe('1 Bytes');
      expect(component['formatFileSize'](500)).toBe('500 Bytes');
      expect(component['formatFileSize'](1023)).toBe('1023 Bytes');
    });

    it('should format kilobytes correctly', () => {
      expect(component['formatFileSize'](1024)).toBe('1 KB');
      expect(component['formatFileSize'](1500)).toBe('1.46 KB');
      expect(component['formatFileSize'](1024 * 1023)).toBe('1023 KB');
    });

    it('should format megabytes correctly', () => {
      expect(component['formatFileSize'](1024 * 1024)).toBe('1 MB');
      expect(component['formatFileSize'](2.5 * 1024 * 1024)).toBe('2.5 MB');
      expect(component['formatFileSize'](1024 * 1024 * 1023)).toBe('1023 MB');
    });

    it('should format gigabytes correctly', () => {
      expect(component['formatFileSize'](1024 * 1024 * 1024)).toBe('1 GB');
      expect(component['formatFileSize'](1.5 * 1024 * 1024 * 1024)).toBe('1.5 GB');
      expect(component['formatFileSize'](1024 * 1024 * 1024 * 1023)).toBe('1023 GB');
    });

    it('should handle very large numbers', () => {
      expect(component['formatFileSize'](1024 * 1024 * 1024 * 1024)).toBe('1 TB');
      expect(component['formatFileSize'](1.5 * 1024 * 1024 * 1024 * 1024)).toBe('1.5 TB');
      expect(component['formatFileSize'](1024 * 1024 * 1024 * 1024 * 1024)).toBe('1024 TB');
    });
  });

  describe('Image Loading', () => {
    it('should handle successful image load', () => {
      expect(component['isImageLoaded']()).toBe(false);
      expect(component['imageLoadError']()).toBe(false);

      component.onImageLoad();

      expect(component['isImageLoaded']()).toBe(true);
      expect(component['imageLoadError']()).toBe(false);
    });

    it('should handle image load error', () => {
      expect(component['isImageLoaded']()).toBe(false);
      expect(component['imageLoadError']()).toBe(false);

      component.onImageError();

      expect(component['isImageLoaded']()).toBe(false);
      expect(component['imageLoadError']()).toBe(true);
    });
  });

  describe('getFileUrl', () => {
    it('should add timestamp parameter to URL without existing query params', () => {
      fixture.componentRef.setInput('message', {
        fileUrl: 'http://example.com/image.png',
      } as ChatMessage);
      fixture.detectChanges();

      const result = component['getFileUrl']();
      expect(result).toMatch(/^http:\/\/example\.com\/image\.png\?t=\d+$/);
    });

    it('should append timestamp parameter to URL with existing query params', () => {
      fixture.componentRef.setInput('message', {
        fileUrl: 'http://example.com/image.png?width=200',
      } as ChatMessage);
      fixture.detectChanges();

      const result = component['getFileUrl']();
      expect(result).toMatch(/^http:\/\/example\.com\/image\.png\?width=200&t=\d+$/);
    });

    it('should handle empty fileUrl', () => {
      fixture.componentRef.setInput('message', {
        fileUrl: '',
      } as ChatMessage);
      fixture.detectChanges();

      const result = component['getFileUrl']();
      expect(result).toMatch(/^\?t=\d+$/);
    });

    it('should handle undefined fileUrl', () => {
      fixture.componentRef.setInput('message', {
        fileUrl: undefined,
      } as ChatMessage);
      fixture.detectChanges();

      const result = component['getFileUrl']();
      expect(result).toMatch(/^\?t=\d+$/);
    });
  });
});
