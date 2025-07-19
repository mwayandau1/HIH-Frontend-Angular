/* eslint-disable no-unused-vars */
import { Gender } from './user';
import { Allergy, Condition } from './allergiesAndConditions';

export interface PaginatedPatientNoteResponse {
  success: boolean;
  message: string;
  data: PaginatedData<PatientNote>;
  timestamp: string;
}

export interface PaginatedPatientVisitResponse {
  success: boolean;
  message: string;
  data: PaginatedData<PatientVisit>;
  timestamp: string;
}

export interface PaginatedData<T> {
  totalElements: number;
  totalPages: number;
  pageable: Pageable;
  first: boolean;
  last: boolean;
  size: number;
  content: T[];
  number: number;
  sort: Sort;
  numberOfElements: number;
  empty: boolean;
}

export interface Pageable {
  paged: boolean;
  pageNumber: number;
  pageSize: number;
  offset: number;
  sort: Sort;
  unpaged: boolean;
}

export interface Sort {
  sorted: boolean;
  empty: boolean;
  unsorted: boolean;
}

export interface PatientNote {
  id: string;
  title: string;
  content: string;
  visitId: string;
  providerId: string;
  createdAt: string;
  updatedAt: string;
  visitTitle: string;
  visitDate: string;
  patientId: PatientDetails;
  private: boolean;
}

export interface MedicalInfo {
  physician: string;
  bloodType: string;
  height: number;
  weight: number;
}

export interface PatientResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  hasConsent: boolean;
  status: string | null;
}

export interface PaginatedPatientResponse {
  content: PatientResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ConsentResponse {
  success: boolean;
  message: string;
  data: ConsentData;
  timestamp: string;
}

export interface ConsentData {
  id: number;
  patientId: string;
  providerId: string;
  consentGiven: boolean;
  consentedOn: string;
  status: ConsentStatus;
  updatedBy: string;
}

export enum ConsentStatus {
  GRANTED = 'GRANTED',
  REVOKED = 'REVOKED',
  PENDING = 'PENDING',
}

export interface PatientDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  gender: Gender;
  phoneNumber: string;
  dateOfBirth: string;
  emergencyContact: string;
  allergies: Allergy[];
  medications: Medication[];
  immunizations: Immunization[];
  consents: Consent[];
  labResults: LabResult[];
  medInformations: MedicalInformation;
  vitals: Vital[];
  conditions: Condition[];
  visits: PatientVisit[];
  insurance: Insurance;
}

export interface Medication {
  id: number;
  prescribedBy: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
}

export interface PatientVisit {
  id: string;
  providerId: string;
  providerName: string;
  visitDate: string;
  purpose: string;
  notes: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PatientInfo {
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  phoneNumber: string;
  profilePictureUrl: string;
  residentialAddress: string;
}

interface Dosage {
  amount: string;
  unit: string;
}

export interface PatientVitals {
  id: number;
  title: string;
  dosage: Dosage;
  state: 'Normal' | 'Elevated';
}

export interface PatientImmunization {
  id: number;
  title: string;
  date: string;
  desc: string;
}

export interface Immunization {
  id: number;
  vaccineName: string;
  dateAdministered: string;
  doseNumber: string;
}

export interface Consent {
  id: number;
  providerId: string;
  consentGiven: boolean;
  consentedOn: string;
}

export interface LabResult {
  id: number;
  labTest: string;
  value: string;
  unit: string;
  resultDate: string;
  referenceRange: string;
  status: string;
  notes: string;
}

export interface MedicalInformation {
  id: number;
  primaryPhysician: string;
  bloodType: string;
  rhFactor: string;
  medicalHistory: string;
  familyMedicalHistory: string;
  geneticDisorders: string;
  sexAtBirth: Gender;
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

export interface Insurance {
  id: number;
  provider: string;
  insuranceId: string;
  patientId: string;
}
