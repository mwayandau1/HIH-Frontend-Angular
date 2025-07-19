import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('newPassword')?.value ?? group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;

  return password === confirm ? null : { passwordsMismatch: true };
}

export function customEmailValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const emailRegex = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/;
  const isValid = emailRegex.test(value);

  return isValid ? null : { invalidEmail: true };
}

export function mfaValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const enableMFA = group.get('enableMFA')?.value;
    const smsAuth = group.get('smsAuth')?.value;
    const emailAuth = group.get('emailAuth')?.value;

    if (enableMFA && !smsAuth && !emailAuth) {
      return { noAuthMethodSelected: true };
    }

    return null;
  };
}

export function customPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) return null;

    const hasMinLength = value.length >= 12;
    const hasLetter = /[a-zA-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSymbol = /[^a-zA-Z0-9]/.test(value);

    const valid = hasMinLength && hasLetter && hasNumber && hasSymbol;

    return valid ? null : { strongPassword: true };
  };
}
