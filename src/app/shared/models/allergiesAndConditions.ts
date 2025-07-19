export type ModalAction = 'EDIT' | 'DELETE' | 'ADD';
export type ItemType = 'ALLERGY' | 'CONDITION';
export type AllergyOrCondition = Allergy | Condition;

export interface DisplayBadge {
  id: string;
  name: string;
  original: Allergy | Condition;
}

export interface AllergiesResponse {
  success: true;
  message: string;
  data: Allergy[];
  timestamp: Date;
}

export interface FormValues {
  conditionName?: string;
  description?: string;
  severity: string;
  treatmentPlan?: string;
  diagnosisDate?: string;
  notes?: string;
  substance?: string;
  reaction?: string;
}

export interface Allergy {
  id?: string;
  patientId?: string;
  substance: string;
  reaction?: string;
  severity?: string;
}

export interface ConditionsResponse {
  success: true;
  message: string;
  data: Condition[];
  timestamp: Date;
}

export interface Condition {
  id?: string;
  patientId?: string;
  conditionName: string;
  description?: string;
  severity?: string;
  treatmentPlan?: string;
  diagnosisDate?: string;
  notes?: string;
}
