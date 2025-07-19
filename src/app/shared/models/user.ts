import { Sort } from './patient';

/* eslint-disable no-unused-vars */
export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  roles: Role[];
  email?: string;
  department: string;
  contact?: string;
  active?: boolean;
}

export interface UserState {
  data: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export interface UserDataResponse {
  message: string;
  content: User[];
  pageable: Pageable;
  totalElements: number;
  totalPages: number;
  numberOfElements: number;
  last: boolean;
  first: boolean;
}

interface Pageable {
  pageNumber: number;
  pageSize: number;
}

export interface RolesResponse {
  message: string;
  data: Role[];
}

export interface Role {
  id?: number;
  name: string;
  createdAt?: string;
  permissions?: number[];
  active?: boolean;
  description?: string;
}

export interface UserRecord {
  id: number;
  title: string;
  date: string;
  state: string;
  desc: string;
}

export interface UserMedicationRecord {
  id: number;
  title: string;
  dose: string;
  routine: string;
  startDate: string;
}

export interface AllegiesAndConditions {
  id: number;
  name: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: UserProfile;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  phoneNumber: string;
  profilePictureUrl: string;
  title: string;
  department: string;
  licenseNumber: string;
  bio: string;
  residentialAddress: string;
  twoFactorEnabled: boolean;
  twoFactorMethod: string;
  roles: UserRole[];
}

export interface UserRole {
  id: number;
  name: string;
  Description: string;
}

export enum Gender {
  Male = 'MALE',
  Female = 'Female',
  Null = '',
}

export interface ProivderInfo {
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phoneNumber: string;
  profilePictureUrl: string;
  title: string;
  department: string;
  licenseNumber: string;
  bio: string;
}

export interface UserState {
  data: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export interface PatientProvider {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  gender: 'MALE' | 'FEMALE';
  phoneNumber: string;
  department: string;
  address: string;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
  dateOfBirth: string;
  passwordSet: boolean;
  active: boolean;
  accountLocked: boolean;
}

export interface UserPageable {
  offset: number;
  sort: Sort;
  pageNumber: number;
  pageSize: number;
  unpaged: boolean;
  paged: boolean;
}

export interface PaginatedUserResponse {
  totalElements: number;
  totalPages: number;
  size: number;
  content: PatientProvider[];
  number: number;
  sort: Sort;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  pageable: UserPageable;
  empty: boolean;
}
