import { User } from '@shared/models';
import { sortUsersByCriteria, filterUsersBySearchTerm } from './user';
import { mockedUsers } from '@shared/constants/user';

describe('User Sorting and Filtering', () => {
  const mockUsers: User[] = mockedUsers;

  describe('sortUsersByCriteria', () => {
    it('should sort users by role when sortId is a role', () => {
      const sortedUsers = sortUsersByCriteria(mockUsers, 'Doctor');
      expect(sortedUsers[0].roles[0].name).toBe('Doctor');
      expect(sortedUsers[0].firstName).toBe('John');
    });

    it('should sort users by department when sortId is a department', () => {
      const sortedUsers = sortUsersByCriteria(mockUsers, 'Orthopedics');
      expect(sortedUsers[0].department).toBe('Orthopedics');
      expect(sortedUsers[0].firstName).toBe('Robert');
      expect(sortedUsers[1].department).toBe('Orthopedics');
      expect(sortedUsers[1].firstName).toBe('Emily');
    });

    it('should sort users by status when sortId is a status', () => {
      const sortedUsers = sortUsersByCriteria(mockUsers, 'Active');
      expect(sortedUsers[0].active).toBe(true);
      expect(sortedUsers[0].firstName).toBe('John');
      expect(sortedUsers[1].active).toBe(true);
      expect(sortedUsers[1].firstName).toBe('Jane');
    });

    it('should return unsorted array when sortId is not recognized', () => {
      const sortedUsers = sortUsersByCriteria(mockUsers, 'Unknown');
      expect(sortedUsers).toEqual(mockUsers);
    });

    it('should handle empty array', () => {
      const sortedUsers = sortUsersByCriteria([], 'Doctor');
      expect(sortedUsers).toEqual([]);
    });

    it('should maintain relative order of non-matching items', () => {
      const sortedUsers = sortUsersByCriteria(mockUsers, 'Doctor');
      const nonDoctorUsers = sortedUsers.filter((user) => user.roles[0].name !== 'Doctor');
      expect(nonDoctorUsers[0].firstName).toBe('Robert');
      expect(nonDoctorUsers[1].firstName).toBe('Emily');
      expect(nonDoctorUsers[2].firstName).toBe('Michael');
    });
  });

  describe('filterUsersBySearchTerm', () => {
    it('should filter users by name', () => {
      const filteredUsers = filterUsersBySearchTerm(mockUsers, 'John');
      expect(filteredUsers.length).toBe(2);
      expect(filteredUsers[0].firstName).toBe('John');
    });

    it('should filter users by email', () => {
      const filteredUsers = filterUsersBySearchTerm(mockUsers, 'sarah.miller@medconnect.com');
      expect(filteredUsers.length).toBe(1);
      expect(filteredUsers[0].firstName).toBe('Sarah');
    });

    it('should be case insensitive', () => {
      const filteredUsers = filterUsersBySearchTerm(mockUsers, 'JOHN');
      expect(filteredUsers.length).toBe(2);
      expect(filteredUsers[0].firstName).toBe('John');
    });

    it('should return all users when search term is empty', () => {
      const filteredUsers = filterUsersBySearchTerm(mockUsers, '');
      expect(filteredUsers).toEqual(mockUsers);
    });

    it('should return all users when search term is only whitespace', () => {
      const filteredUsers = filterUsersBySearchTerm(mockUsers, '   ');
      expect(filteredUsers).toEqual(mockUsers);
    });

    it('should handle empty array', () => {
      const filteredUsers = filterUsersBySearchTerm([], 'John');
      expect(filteredUsers).toEqual([]);
    });

    it('should match partial strings', () => {
      const filteredUsers = filterUsersBySearchTerm(mockUsers, 'doe');
      expect(filteredUsers.length).toBe(1);
      expect(filteredUsers[0].firstName).toBe('Jane');
    });
  });
});
