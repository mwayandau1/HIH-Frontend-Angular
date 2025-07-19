import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DocumentsService } from './documents.service';
import { ApiService } from '../api/api.service';
import { Document } from '@shared/models';
import { endpoints } from '@shared/constants/endpoints';

describe(' DocumentsService', () => {
  let service: DocumentsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DocumentsService, ApiService],
    });

    service = TestBed.inject(DocumentsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDocuments', () => {
    it('should fetch documents for a given patient ID', () => {
      const patientId = '123';
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
        {
          id: 'doc2',
          fileName: 'doc2.pdf',
          originalFileName: 'lab_results.pdf',
          fileType: 'application/pdf',
          fileSize: 2048,
          documentType: 'Lab Results',
          description: 'Lab results for patient',
          uploadedBy: 'Dr. Jones',
          uploadDate: new Date('2025-01-02'),
          downloadUrl: 'http://api.com/docs/doc2.pdf',
        },
      ];
      const endpoint = `https://api.degeneral.space/api/v1/patients/123/documents`;

      service.getDocuments(patientId).subscribe((documents) => {
        expect(documents).toEqual(mockDocuments);
        expect(documents.length).toBe(2);
        expect(documents[0].id).toBe('doc1');
        expect(documents[1].fileName).toBe('doc2.pdf');
      });

      const req = httpMock.expectOne(endpoint);
      expect(req.request.method).toBe('GET');
      req.flush(mockDocuments);
    });

    it('should handle errors when fetching documents', () => {
      const patientId = '123';
      const endpoint = endpoints.pastientDocuments.getPatientDocuments(patientId);
      const errorMessage = 'Failed to fetch documents';

      service.getDocuments(patientId).subscribe({
        error: (err) => {
          expect(err.status).toBe(500);
          expect(err.statusText).toBe(errorMessage);
        },
      });

      const req = httpMock.expectOne(`https://api.degeneral.space/api/v1/${endpoint}`);
      expect(req.request.method).toBe('GET');
      req.flush(errorMessage, { status: 500, statusText: errorMessage });
    });
  });

  describe('uploadDocument', () => {
    it('should upload a document for a given patient ID', () => {
      const patientId = '123';
      const mockDocument: Document = {
        id: 'doc3',
        fileName: 'doc3.pdf',
        originalFileName: 'new_record.pdf',
        fileType: 'application/pdf',
        fileSize: 3072,
        documentType: 'Prescription',
        description: 'New prescription',
        uploadedBy: 'Dr. Brown',
        uploadDate: new Date('2025-01-03'),
        downloadUrl: 'http://api.com/docs/doc3.pdf',
      };
      const formData = new FormData();
      formData.append('file', new Blob(['file content'], { type: 'application/pdf' }));
      const endpoint = endpoints.pastientDocuments.uploadPatientDocuments(patientId);

      service.uploadDocument(formData, patientId).subscribe((document) => {
        expect(document).toEqual(mockDocument);
        expect(document.id).toBe('doc3');
        expect(document.documentType).toBe('Prescription');
      });

      const req = httpMock.expectOne(`https://api.degeneral.space/api/v1/${endpoint}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(formData);
      req.flush(mockDocument);
    });

    it('should handle errors when uploading a document', () => {
      const patientId = '123';
      const formData = new FormData();
      formData.append('file', new Blob(['file content'], { type: 'application/pdf' }));
      const endpoint = endpoints.pastientDocuments.uploadPatientDocuments(patientId);
      const errorMessage = 'Failed to upload document';

      service.uploadDocument(formData, patientId).subscribe({
        error: (err) => {
          expect(err.status).toBe(500);
          expect(err.statusText).toBe(errorMessage);
        },
      });

      const req = httpMock.expectOne(`https://api.degeneral.space/api/v1/${endpoint}`);
      expect(req.request.method).toBe('POST');
      req.flush(errorMessage, { status: 500, statusText: errorMessage });
    });
  });
});
