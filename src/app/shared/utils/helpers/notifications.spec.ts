import {
  getNotificationLabel,
  mapNotificationTypeToFormControl,
  mapFormControlToNotificationType,
} from './notifications';

describe('Notification Utilities', () => {
  describe('getNotificationLabel', () => {
    it('should return correct label for known notification types', () => {
      expect(getNotificationLabel('APPOINTMENT_REMINDER')).toBe('Appointment Reminders');
      expect(getNotificationLabel('PATIENT_MESSAGE')).toBe('Patient Messages');
      expect(getNotificationLabel('NEW_LAB_RESULT')).toBe('New Lab Results');
    });

    it('should handle case insensitivity', () => {
      expect(getNotificationLabel('appointment_reminder')).toBe('Appointment Reminders');
      expect(getNotificationLabel('Patient_Message')).toBe('Patient Messages');
    });

    it('should return the input type when no mapping exists', () => {
      expect(getNotificationLabel('UNKNOWN_TYPE')).toBe('UNKNOWN_TYPE');
      expect(getNotificationLabel('')).toBe('');
    });
  });

  describe('mapNotificationTypeToFormControl', () => {
    it('should return correct email control names', () => {
      expect(mapNotificationTypeToFormControl('APPOINTMENT_REMINDER', true)).toBe(
        'notifyByEmailAppointments',
      );
      expect(mapNotificationTypeToFormControl('PRESCRIPTION_REFILL', true)).toBe(
        'notifyByEmailRefills',
      );
    });

    it('should return correct SMS control names', () => {
      expect(mapNotificationTypeToFormControl('APPOINTMENT_REMINDER', false)).toBe(
        'notifyBySMSAppointments',
      );
      expect(mapNotificationTypeToFormControl('PRESCRIPTION_READY', false)).toBe(
        'notifyBySMSPrescriptionReady',
      );
    });

    it('should return null for SMS when no mapping exists', () => {
      expect(mapNotificationTypeToFormControl('PATIENT_MESSAGE', false)).toBeFalsy();
    });

    it('should handle case insensitivity', () => {
      expect(mapNotificationTypeToFormControl('appointment_reminder', true)).toBe(
        'notifyByEmailAppointments',
      );
    });

    it('should return null for unknown types', () => {
      expect(mapNotificationTypeToFormControl('UNKNOWN_TYPE', true)).toBeNull();
    });
  });

  describe('mapFormControlToNotificationType', () => {
    it('should return correct type for email controls', () => {
      expect(mapFormControlToNotificationType('notifyByEmailAppointments')).toBe(
        'APPOINTMENT_REMINDER',
      );
      expect(mapFormControlToNotificationType('notifyByEmailRefills')).toBe('PRESCRIPTION_REFILL');
    });

    it('should return correct type for SMS controls', () => {
      expect(mapFormControlToNotificationType('notifyBySMSAppointments')).toBe(
        'APPOINTMENT_REMINDER',
      );
      expect(mapFormControlToNotificationType('notifyBySMSPrescriptionReady')).toBe(
        'PRESCRIPTION_READY',
      );
    });

    it('should return null for unknown control names', () => {
      expect(mapFormControlToNotificationType('unknownControl')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(mapFormControlToNotificationType('')).toBeNull();
    });
  });
});
