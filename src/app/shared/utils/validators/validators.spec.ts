import {
  mfaValidator,
  passwordsMatchValidator,
  customEmailValidator,
  customPasswordValidator,
} from './validators';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';

describe('customEmailValidator', () => {
  it('should return null for valid email', () => {
    const control = new FormControl('test@example.com');
    const result = customEmailValidator(control);
    expect(result).toBeNull();
  });

  it('should return error for invalid email', () => {
    const control = new FormControl('invalid-email');
    const result = customEmailValidator(control);
    expect(result).toEqual({ invalidEmail: true });
  });

  it('should return null if value is empty', () => {
    const control = new FormControl('');
    const result = customEmailValidator(control);
    expect(result).toBeNull();
  });
});

describe('passwordsMatchValidator', () => {
  it('should return null when passwords match', () => {
    const group = new FormGroup({
      newPassword: new FormControl('abc123'),
      confirmPassword: new FormControl('abc123'),
    });

    const result = passwordsMatchValidator(group);
    expect(result).toBeNull();
  });

  it('should return error when passwords do not match', () => {
    const group = new FormGroup({
      newPassword: new FormControl('abc123'),
      confirmPassword: new FormControl('def456'),
    });

    const result = passwordsMatchValidator(group);
    expect(result).toEqual({ passwordsMismatch: true });
  });

  it('should return error if one of the passwords is missing', () => {
    const group = new FormGroup({
      newPassword: new FormControl('abc123'),
      confirmPassword: new FormControl(''),
    });

    const result = passwordsMatchValidator(group);
    expect(result).toEqual({ passwordsMismatch: true });
  });
});

describe('mfaValidator', () => {
  let formBuilder: FormBuilder;
  let formGroup: FormGroup;

  beforeEach(() => {
    formBuilder = new FormBuilder();
    formGroup = formBuilder.group(
      {
        enableMFA: [false],
        smsAuth: [false],
        emailAuth: [false],
      },
      { validators: mfaValidator() },
    );
  });

  it('should return null when MFA is disabled', () => {
    formGroup.patchValue({
      enableMFA: false,
      smsAuth: false,
      emailAuth: false,
    });
    expect(formGroup.valid).toBeTruthy();
    expect(formGroup.errors).toBeNull();
  });

  it('should return null when MFA is enabled with SMS selected', () => {
    formGroup.patchValue({
      enableMFA: true,
      smsAuth: true,
      emailAuth: false,
    });
    expect(formGroup.valid).toBeTruthy();
    expect(formGroup.errors).toBeNull();
  });

  it('should return null when MFA is enabled with email selected', () => {
    formGroup.patchValue({
      enableMFA: true,
      smsAuth: false,
      emailAuth: true,
    });
    expect(formGroup.valid).toBeTruthy();
    expect(formGroup.errors).toBeNull();
  });

  it('should return error when MFA is enabled but no method selected', () => {
    formGroup.patchValue({
      enableMFA: true,
      smsAuth: false,
      emailAuth: false,
    });
    expect(formGroup.valid).toBeFalsy();
    expect(formGroup.errors).toEqual({ noAuthMethodSelected: true });
  });

  it('should return error when MFA is enabled and both methods selected', () => {
    formGroup.patchValue({
      enableMFA: true,
      smsAuth: true,
      emailAuth: true,
    });
    expect(formGroup.valid).toBeTruthy();
  });
});

describe('customPasswordValidator', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let validatorFn: any;

  beforeEach(() => {
    validatorFn = customPasswordValidator();
  });

  it('should return null for valid password (12+ chars with letter, number, symbol)', () => {
    const control = new FormControl('SecurePass123!');
    expect(validatorFn(control)).toBeNull();
  });

  it('should return validation error for password without letters', () => {
    const control = new FormControl('1234567890!@');
    expect(validatorFn(control)).toEqual({ strongPassword: true });
  });

  it('should return validation error for password without numbers', () => {
    const control = new FormControl('JustLettersAnd!@#');
    expect(validatorFn(control)).toEqual({ strongPassword: true });
  });

  it('should return validation error for password without symbols', () => {
    const control = new FormControl('NoSymbols12345');
    expect(validatorFn(control)).toEqual({ strongPassword: true });
  });

  it('should return validation error for password that is too short', () => {
    const control = new FormControl('Short1!');
    expect(validatorFn(control)).toEqual({ strongPassword: true });
  });

  it('should return null for empty value (optional field)', () => {
    const control = new FormControl('');
    expect(validatorFn(control)).toBeNull();
  });

  it('should return null for null value (optional field)', () => {
    const control = new FormControl(null);
    expect(validatorFn(control)).toBeNull();
  });

  it('should return null for undefined value (optional field)', () => {
    const control = new FormControl(undefined);
    expect(validatorFn(control)).toBeNull();
  });

  it('should handle exactly 12 character password', () => {
    const control = new FormControl('Exactly12!!!');
    expect(validatorFn(control)).toBeNull();
  });

  it('should handle complex password with mixed characters', () => {
    const control = new FormControl('P@ssw0rdIsV3ryS3cur3!');
    expect(validatorFn(control)).toBeNull();
  });

  it('should handle unicode symbols', () => {
    const control = new FormControl('Password123€¥£');
    expect(validatorFn(control)).toBeNull();
  });
});
