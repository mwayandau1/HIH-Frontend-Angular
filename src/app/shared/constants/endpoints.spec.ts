import { endpoints } from './endpoints';

describe('endpoints', () => {
  describe('auth endpoints', () => {
    it('should return correct login endpoint', () => {
      expect(endpoints.auth.login).toBe('auth/login');
    });

    it('should generate password reset initiation endpoint with email', () => {
      const email = 'test@example.com';
      expect(endpoints.auth.initaitePasswordReset(email)).toBe(
        `auth/password/reset/initiate?email=${email}`,
      );
    });

    it('should generate verification code resend endpoint with email', () => {
      const email = 'user@test.com';
      expect(endpoints.auth.verificationCodeResend(email)).toBe(
        `auth/password/reset/resend?email=${email}`,
      );
    });

    it('should generate verify code endpoint with token', () => {
      const token = 'abc123';
      expect(endpoints.auth.verifyCode(token)).toBe(
        `auth/password/reset/verify-token?token=${token}`,
      );
    });

    it('should return correct set password endpoint', () => {
      expect(endpoints.auth.setPassword).toBe('auth/password/set');
    });
  });

  describe('user endpoints', () => {
    it('should return correct user info endpoint', () => {
      expect(endpoints.user.getInfo).toBe('auth/users/me/profile');
    });

    it('should return correct password update endpoint', () => {
      expect(endpoints.user.updatePassword).toBe('auth/users/me/password');
    });

    it('should return correct user info update endpoint', () => {
      expect(endpoints.user.updateUserInfo).toBe('auth/users/me');
    });

    it('should return correct two-factor update endpoint', () => {
      expect(endpoints.user.updateTwoFactor).toBe('auth/users/me/two-factor');
    });

    it('should return correct user registration endpoint', () => {
      expect(endpoints.user.registerUser).toBe('auth/users/register');
    });

    it('should generate user handle endpoint with id', () => {
      const id = 123;
      expect(endpoints.user.handleUser(id)).toBe(`auth/users/${id}`);
    });

    it('should return correct users list endpoint', () => {
      const query = 'keyword';
      expect(endpoints.user.getUsers(query)).toBe('auth/users' + query);
    });
  });

  describe('roles endpoints', () => {
    it('should return correct roles handle endpoint', () => {
      expect(endpoints.roles.handleRoles).toBe('auth/admin/roles');
    });

    it('should return correct permissions endpoint', () => {
      expect(endpoints.roles.getPermissions).toBe('auth/admin/permissions');
    });

    it('should generate role handle endpoint with id', () => {
      const id = 456;
      expect(endpoints.roles.handleRole(id)).toBe(`auth/admin/roles/${id}`);
    });
  });

  describe('notification endpoints', () => {
    it('should return correct user preferences endpoint', () => {
      expect(endpoints.notification.getUserPreferences).toBe('notifications/preferences/me');
    });

    it('should return correct preferences update endpoint', () => {
      expect(endpoints.notification.updateUserPreferences).toBe('notifications/preferences');
    });
  });

  describe('patients endpoints', () => {
    it('should generate base patients endpoint with no params', () => {
      expect(endpoints.patients.getAll()).toBe('auth/patients?');
    });

    it('should generate patients endpoint with query param', () => {
      const query = 'John';
      expect(endpoints.patients.getAll(query)).toBe('auth/patients?query=John');
    });

    it('should generate patients endpoint with pagination params', () => {
      expect(endpoints.patients.getAll(undefined, 2, 20)).toBe('auth/patients?page=2&size=20');
    });

    it('should generate patients endpoint with age range filter', () => {
      expect(endpoints.patients.getAll(undefined, undefined, undefined, '18-30')).toBe(
        'auth/patients?ageRange=18-30',
      );
    });

    it('should generate patients endpoint with gender filter', () => {
      expect(endpoints.patients.getAll(undefined, undefined, undefined, undefined, 'Male')).toBe(
        'auth/patients?gender=Male',
      );
    });

    it('should generate patients endpoint with last updated filter', () => {
      const date = '2023-01-01';
      expect(
        endpoints.patients.getAll(undefined, undefined, undefined, undefined, undefined, date),
      ).toBe('auth/patients?lastUpdatedAfter=2023-01-01');
    });

    it('should generate patients endpoint with multiple params', () => {
      expect(endpoints.patients.getAll('Doe', 1, 10, '30-45', 'Female', '2023-06-01')).toBe(
        'auth/patients?query=Doe&page=1&size=10&ageRange=30-45&gender=Female&lastUpdatedAfter=2023-06-01',
      );
    });

    it('should generate search endpoint with query', () => {
      const query = 'search term';
      expect(endpoints.patients.querySearch(query)).toBe('auth/patients/search?q=search term');
    });

    it('should generate patient by id endpoint', () => {
      const id = 'patient123';
      expect(endpoints.patients.getById(id)).toBe(`patients/${id}/summary`);
    });

    it('should return correct request access endpoint', () => {
      expect(endpoints.patients.requestAccess).toBe('patients/consents');
    });

    it('should generate consent endpoint with id', () => {
      const id = 789;
      expect(endpoints.patients.getConsent(id)).toBe(`patients/consents/${id}`);
    });
  });
});
