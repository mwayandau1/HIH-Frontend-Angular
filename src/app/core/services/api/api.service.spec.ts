/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { HttpOptions } from '@shared/models/api';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  const baseUrl = 'https://api.degeneral.space/api/v1';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService],
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get', () => {
    it('should make a GET request to the correct endpoint', () => {
      const testEndpoint = 'test';
      const mockResponse = { data: 'test data' };

      service.get(baseUrl, testEndpoint).subscribe((response: any) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/${testEndpoint}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should include options in GET request', () => {
      const testEndpoint = 'test';
      const options = { params: { key: 'value' } };

      service.get(baseUrl, testEndpoint, options).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/${testEndpoint}?key=value`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });

  describe('post', () => {
    it('should make a POST request to the correct endpoint with body', () => {
      const testEndpoint = 'test';
      const testBody = { name: 'test' };
      const mockResponse = { id: 1, name: 'test' };

      service.post(baseUrl, testEndpoint, testBody).subscribe((response: any) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/${testEndpoint}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(testBody);
      req.flush(mockResponse);
    });

    it('should include options in POST request', () => {
      const testEndpoint = 'test';
      const testBody = { name: 'test' };
      const options: HttpOptions = { headers: { 'Custom-Header': 'value' } };

      service.post(baseUrl, testEndpoint, testBody, options).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/${testEndpoint}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Custom-Header')).toBe('value');
      req.flush({});
    });
  });

  describe('put', () => {
    it('should make a PUT request to the correct endpoint with body', () => {
      const testEndpoint = 'test/1';
      const testBody = { name: 'updated' };
      const mockResponse = { id: 1, name: 'updated' };

      service.put(baseUrl, testEndpoint, testBody).subscribe((response: any) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/${testEndpoint}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(testBody);
      req.flush(mockResponse);
    });

    it('should include options in PUT request', () => {
      const testEndpoint = 'test/1';
      const testBody = { name: 'updated' };
      const options: HttpOptions = { headers: { 'Custom-Header': 'value' } };

      service.put(baseUrl, testEndpoint, testBody, options).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/${testEndpoint}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.headers.get('Custom-Header')).toBe('value');
      req.flush({});
    });
  });

  describe('patch', () => {
    it('should make a PATCH request to the correct endpoint with body', () => {
      const testEndpoint = 'test/1';
      const testBody = { name: 'partially-updated' };
      const mockResponse = { id: 1, name: 'partially-updated' };

      service.patch(baseUrl, testEndpoint, testBody).subscribe((response: any) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/${testEndpoint}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(testBody);
      req.flush(mockResponse);
    });

    it('should include options in PATCH request', () => {
      const testEndpoint = 'test/1';
      const testBody = { name: 'partially-updated' };
      const options: HttpOptions = { headers: { 'Custom-Header': 'value' } };

      service.patch(baseUrl, testEndpoint, testBody, options).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/${testEndpoint}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.headers.get('Custom-Header')).toBe('value');
      req.flush({});
    });
  });

  describe('delete', () => {
    it('should make a DELETE request to the correct endpoint', () => {
      const testEndpoint = 'test/1';
      const mockResponse = {};

      service.delete(baseUrl, testEndpoint).subscribe((response: any) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/${testEndpoint}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });

    it('should include options in DELETE request', () => {
      const testEndpoint = 'test/1';
      const options = { params: { softDelete: 'true' } };

      service.delete(baseUrl, testEndpoint, options).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/${testEndpoint}?softDelete=true`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });
});
