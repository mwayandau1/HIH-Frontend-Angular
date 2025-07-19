export interface VitalsResponse {
  success: true;
  message: string;
  data: Vital[];
  timestamp: Date;
}

export interface Vital {
  id: number;
  height: number;
  weight: number;
  age: number;
  bloodPressure: string;
  heartRate: string;
  temperature: number;
  recordedAt: string;
}
