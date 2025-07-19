export const errorMessages = {
  required: 'This is a required field',
  email: 'Invalid email format',
  password: 'Passwords must be at least 12 characters with letters, numbers, and symbols',
  passwordMismatch: 'Passwords do not match. Please make sure both fields are the same.',
  minLength: (min: number) => `Minimum length is ${min} characters.`,
  patternPhone: 'Please enter a valid phone number (e.g. +233123456789).',
  dateOfBirth: 'Please select your date of birth.',
  gender: 'Please select a gender.',
};
