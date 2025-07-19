export interface LabResultsResponse {
  success: boolean;
  message: string;
  data: LabResultsData[];
  timestamp: Date;
}

export interface LabResultsData {
  id?: number;
  labTest: string;
  value: string;
  unit?: string;
  resultDate: string;
  referenceRange?: string;
  status?: string;
  notes?: string;
}
