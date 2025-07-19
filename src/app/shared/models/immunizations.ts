export interface ImmunizationResponse {
  success: true;
  message: string;
  data: Immunization[];
  timestamp: Date;
}

export interface Immunization {
  id?: number;
  vaccineName: string;
  dateAdministered?: string;
  doseNumber?: string;
  patientId?: string;
}
