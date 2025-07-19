import { NotificationMappings } from '@shared/models/notifications';

export function getNotificationLabel(type: string): string {
  const typeToLabelMap: Record<string, string> = {
    APPOINTMENT_REMINDER: 'Appointment Reminders',
    PATIENT_MESSAGE: 'Patient Messages',
    PRESCRIPTION_REFILL: 'Prescription Refill Reminders',
    PRESCRIPTION_READY: 'Prescription Ready',
    ACCOUNT_ACTIVITY: 'Account Activity',
    SYSTEM_UPDATES: 'System Updates',
    NEW_LAB_RESULT: 'New Lab Results',
  };

  const normalizedType = type.toUpperCase();
  return typeToLabelMap[normalizedType] || type;
}

const notificationMappings: NotificationMappings[] = [
  {
    type: 'APPOINTMENT_REMINDER',
    email: 'notifyByEmailAppointments',
    sms: 'notifyBySMSAppointments',
  },
  {
    type: 'PRESCRIPTION_REFILL',
    email: 'notifyByEmailRefills',
    sms: 'notifyBySMSRefills',
  },
  {
    type: 'PRESCRIPTION_READY',
    email: 'notifyByEmailPrescriptionReady',
    sms: 'notifyBySMSPrescriptionReady',
  },
  {
    type: 'ACCOUNT_ACTIVITY',
    email: 'notifyByEmailAccountActivities',
    sms: 'notifyBySMSAccountActivities',
  },
  {
    type: 'SYSTEM_UPDATES',
    email: 'notifyByEmailSystemUpdate',
    sms: 'notifyBySMSSystemUpdate',
  },
  {
    type: 'PATIENT_MESSAGE',
    email: 'notifyByEmailPatientMessages',
    sms: '',
  },
  {
    type: 'NEW_LAB_RESULT',
    email: 'notifyByEmailLabResults',
    sms: 'notifyBySMSLabResults',
  },
];

export function mapNotificationTypeToFormControl(type: string, isEmail: boolean): string | null {
  const normalizedType = type.toUpperCase();
  const mapping = notificationMappings.find((m) => m.type === normalizedType);

  if (!mapping) return null;
  return isEmail ? mapping.email : mapping.sms;
}

export function mapFormControlToNotificationType(controlName: string): string | null {
  if (controlName === '') return null;

  const mapping = notificationMappings.find(
    (m) => m.email === controlName || m.sms === controlName,
  );

  if (!mapping) return null;

  return mapping.type;
}
