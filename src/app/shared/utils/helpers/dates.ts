import { DatePipe } from '@angular/common';

export const formatDate = (input: string): string => {
  const datePipe = new DatePipe('en-US');
  const formatted = datePipe.transform(input, 'yyyy-MM-dd') ?? '';
  return formatted;
};

export function getAgeFromDOB(dob: string | Date): number {
  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

  if (!hasHadBirthdayThisYear) {
    age--;
  }

  return age;
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
