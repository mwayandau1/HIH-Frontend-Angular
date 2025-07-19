import { FormGroup, FormControl, Validators } from '@angular/forms';
import {
  customEmailValidator,
  customPasswordValidator,
  passwordsMatchValidator,
} from '../validators/validators';
import { checkFieldErrors } from './errorHandlers';
import { errorMessages } from '@shared/constants/errors';

describe('checkFieldErrors', () => {
  let form: FormGroup;

  beforeEach(() => {
    form = new FormGroup(
      {
        username: new FormControl('', Validators.required),
        email: new FormControl('', [Validators.required, customEmailValidator]),
        password: new FormControl('', [Validators.required, customPasswordValidator()]),
        newPassword: new FormControl('', [Validators.required, customPasswordValidator()]),
        confirmPassword: new FormControl('', [Validators.required]),
        phoneNumber: new FormControl('', [Validators.pattern(/^\+?\d+$/)]),
        age: new FormControl('', [Validators.minLength(3)]),
      },
      { validators: passwordsMatchValidator },
    );
  });

  it('should return undefined for untouched fields', () => {
    expect(checkFieldErrors(form, 'username')).toBeUndefined();
  });

  it('should return required error for touched empty required field', () => {
    form.get('username')?.markAsTouched();
    expect(checkFieldErrors(form, 'username')).toBe(errorMessages.required);
  });

  it('should return password error for invalid password', () => {
    form.get('password')?.setValue('weak');
    form.get('password')?.markAsTouched();
    expect(checkFieldErrors(form, 'password')).toBe(errorMessages.password);
  });

  it('should return email error for invalid email', () => {
    form.get('email')?.setValue('invalid');
    form.get('email')?.markAsTouched();
    expect(checkFieldErrors(form, 'email')).toBe(errorMessages.email);
  });

  it('should return undefined for valid touched field', () => {
    form.get('username')?.setValue('valid');
    form.get('username')?.markAsTouched();
    expect(checkFieldErrors(form, 'username')).toBeUndefined();
  });

  it('should return undefined for non-existent field', () => {
    expect(checkFieldErrors(form, 'nonexistent')).toBeUndefined();
  });

  it('should return password mismatch error for confirmPassword', () => {
    form.get('newPassword')?.setValue('ValidPass123!');
    form.get('confirmPassword')?.setValue('DifferentPass123!');
    form.get('confirmPassword')?.markAsTouched();
    form.updateValueAndValidity();
    expect(checkFieldErrors(form, 'confirmPassword')).toBe(errorMessages.passwordMismatch);
  });

  it('should return phone pattern error for invalid phone', () => {
    form.get('phoneNumber')?.setValue('invalid-phone');
    form.get('phoneNumber')?.markAsTouched();
    expect(checkFieldErrors(form, 'phoneNumber')).toBe(errorMessages.patternPhone);
  });

  it('should return minLength error for short input', () => {
    form.get('age')?.setValue('1');
    form.get('age')?.markAsTouched();
    expect(checkFieldErrors(form, 'age')).toBe(errorMessages.minLength(3));
  });

  it('should handle multiple password fields', () => {
    ['password', 'newPassword', 'confirmPassword'].forEach((field) => {
      form.get(field)?.setValue('weak');
      form.get(field)?.markAsTouched();
      if (field !== 'confirmPassword') {
        expect(checkFieldErrors(form, field)).toBe(errorMessages.password);
      }
    });
  });
});
