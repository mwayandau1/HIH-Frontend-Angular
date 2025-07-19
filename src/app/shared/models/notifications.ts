/* eslint-disable no-unused-vars */
export type NotificationType =
  | 'APPOINTMENT_REMINDER'
  | 'PRESCRIPTION_READY'
  | 'PRESCRIPTION_REFILL'
  | 'ACCOUNT_ACTIVITY'
  | 'NEW_LAB_RESULT'
  | 'PATIENT_MESSAGE'
  | 'SYSTEM_UPDATES';

export interface NotificationSetting {
  id: number;
  type: NotificationType;
  enabled: boolean;
  description: string;
}

export interface NotificationSettingsData {
  EMAIL?: NotificationSetting[];
  SMS?: NotificationSetting[];
}

export interface NotificationSettingsResponse {
  success: boolean;
  message: string;
  data: NotificationSettingsData;
  timestamp: string;
}

export interface NotificationSettingsRequest {
  channel: NotificationChannel;
  type: NotificationSetting['type'];
  enabled: boolean;
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export interface NotificationFormConfig {
  notifyByEmailAppointments: boolean;
  notifyByEmailRefills: boolean;
  notifyByEmailPrescriptionReady: boolean;
  notifyByEmailAccountActivities: boolean;
  notifyByEmailSystemUpdate: boolean;
  notifyBySMSAppointments: boolean;
  notifyBySMSRefills: boolean;
  notifyBySMSPrescriptionReady: boolean;
  notifyBySMSSystemUpdate: boolean;
  notifyBySMSAccountActivities: boolean;
  notifyPatientMessages?: boolean;
  notifyEmailLabResults?: boolean;
  notifySMSLabResults?: boolean;
}

export interface NotificationMappings {
  type: string;
  email: string;
  sms: string;
}
