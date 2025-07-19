export type AppointmentStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ALL';

export interface Appointment {
  id: string;
  providerName?: string;
  providerId?: string;
  department?: string;
  visitDate?: string;
  time?: string;
  status: AppointmentStatus;
}

export interface Pageable {
  pageNumber?: number;
  pageSize?: number;
  status?: AppointmentStatus;
}

export interface ResponseData {
  content: Appointment[];
  pageable: Pageable;
  totalElements: number;
  totalPages: number;
}

export interface AppointmentResponse {
  data: ResponseData;
  message: string;
}
