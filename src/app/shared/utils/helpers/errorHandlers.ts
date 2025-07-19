import { FormGroup } from '@angular/forms';
import { errorMessages } from '@shared/constants/errors';

export function checkFieldErrors(form: FormGroup, field: string): string | undefined {
  const element = form.get(field);

  if (!element?.touched) return;

  const passwordFields = ['password', 'newPassword', 'confirmPassword', 'currentPassword'];

  if (
    passwordFields.includes(field) &&
    field === 'confirmPassword' &&
    form.errors?.['passwordsMismatch']
  ) {
    return errorMessages.passwordMismatch;
  }

  const errors = element.errors;
  if (!errors) return;

  if (errors['required']) return errorMessages.required;
  if (field === 'professionalBio' && errors['minlength']) return errorMessages.minLength(10);
  if (errors['minlength']) return errorMessages.minLength(3);
  if (passwordFields.includes(field) && errors['strongPassword']) return errorMessages.password;
  if (field === 'email' && errors['invalidEmail']) return errorMessages.email;
  if (field === 'phoneNumber' && errors['pattern']) return errorMessages.patternPhone;
  else return;
}
