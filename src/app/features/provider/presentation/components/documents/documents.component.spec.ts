import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DocumentsComponent } from './documents.component';
import { DocumentsService } from '@core/services/documents/documents.service';
import { ToastService } from '@core/services/toast/toast.service';
import { Document } from '@shared/models';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { toastNotifications } from '@shared/constants/toast';
import { DocumentsCardComponent } from './documents-card/documents-card.component';
import { CardSkelectonComponent } from './card-skelecton/card-skelecton.component';

describe('DocumentsComponent', () => {
  let component: DocumentsComponent;
  let fixture: ComponentFixture<DocumentsComponent>;
  let documentsService: jest.Mocked<DocumentsService>;
  let toastService: jest.Mocked<ToastService>;
  let httpMock: HttpTestingController;

  const mockDocuments: Document[] = [
    {
      id: 'doc1',
      fileName: 'doc1.pdf',
      originalFileName: 'patient_record.pdf',
      fileType: 'application/pdf',
      fileSize: 1024,
      documentType: 'Medical Record',
      description: 'Patient medical record',
      uploadedBy: 'Dr. Smith',
      uploadDate: new Date('2025-01-01'),
      downloadUrl: 'http://api.com/docs/doc1.pdf',
    },
  ];

  const mockDocument: Document = {
    id: 'doc2',
    fileName: 'doc2.pdf',
    originalFileName: 'new_record.pdf',
    fileType: 'application/pdf',
    fileSize: 2048,
    documentType: 'Prescription',
    description: 'New prescription',
    uploadedBy: 'Dr. Brown',
    uploadDate: new Date('2025-01-03'),
    downloadUrl: 'http://api.com/docs/doc2.pdf',
  };

  beforeEach(async () => {
    const documentsServiceMock = {
      getDocuments: jest.fn().mockReturnValue(of(mockDocuments)),
      uploadDocument: jest.fn().mockReturnValue(of(mockDocument)),
    } as unknown as jest.Mocked<DocumentsService>;
    const toastServiceMock = {
      show: jest.fn(),
    } as unknown as jest.Mocked<ToastService>;

    await TestBed.configureTestingModule({
      imports: [
        DocumentsComponent,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
        CommonModule,
        ReactiveFormsModule,
        DocumentsCardComponent,
        CardSkelectonComponent,
      ],
      providers: [
        { provide: DocumentsService, useValue: documentsServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' }), // Default mock route params
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentsComponent);
    component = fixture.componentInstance;
    documentsService = TestBed.inject(DocumentsService) as jest.Mocked<DocumentsService>;
    toastService = TestBed.inject(ToastService) as jest.Mocked<ToastService>;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should set patientId and fetch documents when id is present in route params', fakeAsync(() => {
      documentsService.getDocuments.mockReturnValue(of(mockDocuments));
      fixture.detectChanges();
      tick();

      expect(component.patientId()).toBe('123');
      expect(documentsService.getDocuments).toHaveBeenCalledWith('123');
      expect(component.documents()).toEqual(mockDocuments);
      expect(component.loading()).toBe(false);
    }));

    it('should show error toast and not fetch documents when id is missing', async () => {
      const documentsServiceMock = {
        getDocuments: jest.fn(),
        uploadDocument: jest.fn(),
      } as unknown as jest.Mocked<DocumentsService>;
      const toastServiceMock = {
        show: jest.fn(),
      } as unknown as jest.Mocked<ToastService>;

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [
          DocumentsComponent,
          HttpClientTestingModule,
          RouterTestingModule,
          CommonModule,
          ReactiveFormsModule,
          DocumentsCardComponent,
          CardSkelectonComponent,
        ],
        providers: [
          { provide: DocumentsService, useValue: documentsServiceMock },
          { provide: ToastService, useValue: toastServiceMock },
          {
            provide: ActivatedRoute,
            useValue: { params: of({}) },
          },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(DocumentsComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.patientId()).toBeNull();
      expect(documentsServiceMock.getDocuments).not.toHaveBeenCalled();
      expect(toastServiceMock.show).toHaveBeenCalledWith(
        toastNotifications.operations.fail,
        toastNotifications.status.error,
        toastNotifications.messages.invalidPateint,
      );
    });
  });

  describe('getDocuments', () => {
    it('should fetch documents and update signals on success', fakeAsync(() => {
      documentsService.getDocuments.mockReturnValue(of(mockDocuments));
      component.getDocuments('123');

      const loadingSpy = jest.spyOn(component.loading, 'set');

      component.getDocuments('123');
      expect(loadingSpy).toHaveBeenCalledWith(true);
      tick();
      expect(loadingSpy).toHaveBeenCalledWith(false);

      expect(documentsService.getDocuments).toHaveBeenCalledWith('123');
      expect(component.documents()).toEqual(mockDocuments);
    }));

    it('should handle error and show toast on failure', fakeAsync(() => {
      documentsService.getDocuments.mockReturnValue(throwError(() => new Error('Fetch failed')));

      component.getDocuments('123');
      const loadingSpy = jest.spyOn(component.loading, 'set');

      component.getDocuments('123');
      expect(loadingSpy).toHaveBeenCalledWith(true);
      tick();
      expect(loadingSpy).toHaveBeenCalledWith(false);

      fixture.detectChanges();

      expect(component.documents()).toBeNull();
      expect(toastService.show).toHaveBeenCalledWith(
        toastNotifications.operations.fail,
        toastNotifications.status.error,
        toastNotifications.messages.docFailLoad,
      );
    }));
  });

  describe('onFileChange', () => {
    it('should handle valid file with allowed extension', () => {
      documentsService.uploadDocument.mockReturnValue(of(mockDocument)); // Ensure uploadDocument returns Observable
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const event = { target: { files: [file] } } as unknown as Event;
      const handleFileSpy = jest.spyOn(component, 'handleFile');

      component.onFileChange(event);

      expect(handleFileSpy).toHaveBeenCalledWith(file, 'pdf');
      expect(component.fileControl.value).toBeNull();
    });

    it('should show error toast for file with no extension', () => {
      const file = new File(['content'], 'test', { type: 'application/octet-stream' });
      const event = { target: { files: [file] } } as unknown as Event;

      component.onFileChange(event);

      expect(toastService.show).toHaveBeenCalledWith(
        toastNotifications.operations.fail,
        toastNotifications.status.error,
        'Unsupported file type: .test. Allowed types: pdf, jpg, jpeg, png, doc, docx',
      );
      expect(component.fileControl.value).toBeNull();
    });

    it('should not process when no files are selected', () => {
      const event = { target: { files: [] } } as unknown as Event;
      const handleFileSpy = jest.spyOn(component, 'handleFile');

      component.onFileChange(event);

      expect(handleFileSpy).not.toHaveBeenCalled();
      expect(toastService.show).not.toHaveBeenCalled();
    });
  });

  describe('handleFile', () => {
    it('should upload document for allowed file extension', fakeAsync(() => {
      documentsService.uploadDocument.mockReturnValue(of(mockDocument));
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const uploadDocumentSpy = jest.spyOn(component, 'uploadDocument');
      component.patientId.set('123');

      component.handleFile(file, 'pdf');
      tick();

      expect(uploadDocumentSpy).toHaveBeenCalledWith(expect.any(FormData), '123');
      const formData: FormData = (uploadDocumentSpy as jest.SpyInstance).mock.calls[0][0];
      expect(formData.get('file')).toEqual(file);
      expect(formData.get('documentType')).toEqual('pdf');
      expect(formData.get('patientId')).toEqual('123');
    }));

    it('should show error toast for unsupported file extension', () => {
      const file = new File(['content'], 'test.exe', { type: 'application/octet-stream' });
      component.patientId.set('123');

      component.handleFile(file, 'exe');

      expect(toastService.show).toHaveBeenCalledWith(
        toastNotifications.operations.fail,
        toastNotifications.status.error,
        'Unsupported file type: .exe. Allowed types: pdf, jpg, jpeg, png, doc, docx',
      );
    });

    it('should show error toast when patientId is null', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      component.patientId.set(null);

      component.handleFile(file, 'pdf');

      expect(toastService.show).toHaveBeenCalledWith(
        toastNotifications.operations.fail,
        toastNotifications.status.error,
        toastNotifications.messages.invalidPateint,
      );
    });
  });

  describe('uploadDocument', () => {
    it('should upload document and refresh documents on success', fakeAsync(() => {
      const formData = new FormData();
      documentsService.uploadDocument.mockReturnValue(of(mockDocument));
      const getDocumentsSpy = jest.spyOn(component, 'getDocuments');

      component.uploadDocument(formData, '123');
      const loadingSpy = jest.spyOn(component.loading, 'set');

      component.getDocuments('123');
      expect(loadingSpy).toHaveBeenCalledWith(true);
      tick();
      expect(loadingSpy).toHaveBeenCalledWith(false);

      fixture.detectChanges();

      expect(documentsService.uploadDocument).toHaveBeenCalledWith(formData, '123');
      expect(toastService.show).toHaveBeenCalledWith(
        toastNotifications.operations.success,
        toastNotifications.status.success,
        toastNotifications.messages.docLoad,
      );
      expect(getDocumentsSpy).toHaveBeenCalledWith('123');
    }));

    it('should handle error and show toast on upload failure', fakeAsync(() => {
      const formData = new FormData();
      documentsService.uploadDocument.mockReturnValue(throwError(() => new Error('Upload failed')));

      component.uploadDocument(formData, '123');
      tick(10);
      const loadingSpy = jest.spyOn(component.loading, 'set');

      component.getDocuments('123');
      expect(loadingSpy).toHaveBeenCalledWith(true);
      tick();
      expect(loadingSpy).toHaveBeenCalledWith(false);

      fixture.detectChanges();

      expect(documentsService.uploadDocument).toHaveBeenCalledWith(formData, '123');
      expect(toastService.show).toHaveBeenCalledWith(
        toastNotifications.operations.fail,
        toastNotifications.status.error,
        toastNotifications.messages.docFailLoad,
      );
    }));
  });
});
