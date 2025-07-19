export interface MedicationsResponse {
  success: boolean;
  message: string;
  data: MedicationsData[];
  timestamp: Date;
}

export interface MedicationsData {
  id?: number;
  patientId?: string;
  prescribedBy?: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
}
