/* eslint-disable no-unused-vars */
import { User, Role } from '@shared/models';

export function filterUsersBySearchTerm(users: User[], searchTerm: string): User[] {
  if (!searchTerm.trim()) return users;
  const term = searchTerm.toLowerCase();
  return users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(term) || user.email?.toLowerCase().includes(term),
  );
}

export function filterRolesBySearchTerm(roles: Role[], searchTerm: string): Role[] {
  if (!searchTerm.trim()) return roles;
  const term = searchTerm.toLowerCase();
  return roles.filter((role) => role.name.toLowerCase().includes(term));
}

const ROLE_OPTIONS = ['Patient', 'Doctor', 'Nurse', 'Lab Practitioner'];
const DEPARTMENT_OPTIONS = ['Orthopedics', 'Pediatrics', 'Cardiology'];
const STATUS_OPTIONS = ['Active', 'Inactive'];

function createSortFunction(targetValue: string | boolean, getValue: (user: User) => string) {
  return (firstUser: User, secondUser: User) => {
    const firstUserMatches = getValue(firstUser) === targetValue;
    const secondUserMatches = getValue(secondUser) === targetValue;

    if (firstUserMatches && !secondUserMatches) return -1;
    if (!firstUserMatches && secondUserMatches) return 1;
    return 0;
  };
}

export function sortUsersByCriteria(users: User[], sortId: string | boolean): User[] {
  const sortedUsers = [...users];

  if (ROLE_OPTIONS.includes(sortId as string)) {
    const targetRole = sortId === 'Patient' ? 'Patient' : sortId;
    return sortedUsers.sort(
      createSortFunction(targetRole as string, (user: User) => {
        const role = user.roles[0];
        return typeof role === 'object' && role !== null && 'name' in role ? role.name : '';
      }),
    );
  }

  if (DEPARTMENT_OPTIONS.includes(sortId as string)) {
    return sortedUsers.sort(createSortFunction(sortId as string, (user: User) => user.department));
  }

  if (STATUS_OPTIONS.includes(sortId as string)) {
    return sortedUsers.sort(
      createSortFunction(sortId as string, (user: User) => String(user.active ?? false)),
    );
  }

  return sortedUsers;
}
