export const formatWord = (word: string) => {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

export function getInitials(firstName: string, lastName: string): string {
  if (!firstName?.trim() || !lastName?.trim()) {
    throw new Error('Both first and last name must be provided');
  }
  return firstName.trim()[0].toUpperCase() + lastName.trim()[0].toUpperCase();
}
