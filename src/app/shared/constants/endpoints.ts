import { AppointmentStatus } from '@shared/models/appointments';

export const endpoints = {
  auth: {
    login: 'auth/login',
    initaitePasswordReset: (email: string) => `auth/password/reset/initiate?email=${email}`,
    verificationCodeResend: (email: string) => `auth/password/reset/resend?email=${email}`,
    verifyCode: (token: string) => `auth/password/reset/verify-token?token=${token}`,
    setPassword: 'auth/password/set', // NOSONAR
  },
  appointments: {
    getAppointments: (query: string) => `patients/visits/patient${query}`,
    deleteAppointment: (id: string) => `patients/visits/${id}`,
    updateAppointment: (id: string, status: AppointmentStatus) =>
      `patients/visits/${id}/status?status=${status}`,
  },

  user: {
    getInfo: 'auth/users/me/profile',
    updatePassword: 'auth/users/me/password', // NOSONAR
    updateUserInfo: 'auth/users/me',
    updateTwoFactor: 'auth/users/me/two-factor',
    registerUser: 'auth/users/register',
    handleUser: (id: number) => `auth/users/${id}`,
    handleStatus: (id: number) => `auth/users/${id}/set-status`,
    getUsers: (query: string) => `auth/users${query}`,
    getPatientAndProviders: (query: string) => `auth/users/patients-providers${query}`,
  },
  roles: {
    handleRoles: 'auth/admin/roles',
    getPermissions: 'auth/admin/permissions',
    handleRole: (id: number) => `auth/admin/roles/${id}`,
  },
  notification: {
    getUserPreferences: 'notifications/preferences/me',
    updateUserPreferences: 'notifications/preferences',
  },
  patients: {
    getAll: (
      query?: string,
      page?: number,
      size?: number,
      ageRange?: string,
      gender?: string,
      lastUpdatedAfter?: string,
    ): string => {
      const params = new URLSearchParams();

      if (query) params.append('query', query);
      if (page !== undefined) params.append('page', page.toString());
      if (size !== undefined) params.append('size', size.toString());
      if (ageRange) params.append('ageRange', ageRange);
      if (gender) params.append('gender', gender);
      if (lastUpdatedAfter) params.append('lastUpdatedAfter', lastUpdatedAfter);

      return `auth/patients?${params.toString()}`;
    },
    querySearch: (query: string) => `auth/patients/search?q=${query}`,
    getById: (id: string) => `patients/${id}/summary`,
    requestAccess: 'patients/consents',
    getConsent: (id: number) => `patients/consents/${id}`,
    handleNotes: 'patients/notes',
    postVisits: 'patients/visits',
    getVisits: 'patients/visits?size=20&sortDir=desc',
  },
  pages: {
    viewAllPatients: '/provider/patients',
    login: '/login',
  },
  pastientDocuments: {
    getPatientDocuments: (id: string) => `patients/${id}/documents`,
    uploadPatientDocuments: (id: string) => `patients/${id}/documents`,
  },
  labResults: {
    getLabResults: (id: string) => `patients/lab-results/patient/${id}`,
    addLabResults: 'patients/lab-results',
  },
  medications: {
    getMedications: (id: string) => `patients/medications/patient/${id}`,
    createMedication: 'patients/medications',
  },
  allergies: {
    getAllergies: (id: string) => `patients/allergies/patient/${id}`,
    addAllergy: 'patients/allergies',
    editAllergy: (id: string) => `patients/allergies/${id}`,
    deleteAllergy: (id: string) => `patients/allergies/${id}`,
  },
  conditions: {
    getConditions: (id: string) => `patients/conditions/patient/${id}`,
    addCondition: 'patients/conditions',
    editCondition: (id: string) => `patients/conditions/${id}`,
    deleteCondition: (id: string) => `patients/conditions/${id}`,
  },
  vitals: {
    getVitals: (id: string) => `patients/vitals/patient/${id}`,
    recordVitals: 'patients/vitals',
  },
  immunizations: {
    getImmunizations: (id: string) => `patients/immunizations/patient/${id}`,
    addImmunization: 'patients/immunizations',
  },
  chatRoom: {
    getOrCreateRoom: 'notifications/rooms/direct',
    getUserRooms: (query: string) => `notifications/rooms/my-rooms${query}`,
    getRoomDetails: (roomId: string) => `notifications/rooms/${roomId}`,
  },
  messages: {
    getRoomMessages: (roomId: string): string => `notifications/messages/room/${roomId}`,
    markMessageAsRead: (messageId: string): string => `notifications/messages/${messageId}/read`,
  },
};
