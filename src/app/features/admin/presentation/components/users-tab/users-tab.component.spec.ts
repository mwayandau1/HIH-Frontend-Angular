import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UsersTabComponent } from './users-tab.component';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { User } from '@shared/models/user';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UserService } from '@core/services/user/user.service';
import { RoleService } from '@core/services/roles/roles.service';
import { ToastService } from '@core/services/toast/toast.service';
import { toastNotifications } from '@shared/constants/toast';

describe('UsersTabComponent', () => {
  let component: UsersTabComponent;
  let fixture: ComponentFixture<UsersTabComponent>;
  let navigateMock: jest.Mock;
  let userServiceMock: Partial<UserService>;
  let roleServiceMock: Partial<RoleService>;
  let toastServiceMock: Partial<ToastService>;

  const mockUsers: User[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      roles: [{ id: 1, name: 'Admin' }],
      department: 'NA',
      contact: '123456',
      active: true,
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      roles: [{ id: 2, name: 'User' }],
      department: 'HR',
      contact: '654321',
      active: false,
    },
  ];

  const minimalUser: User = {
    id: 1,
    firstName: '',
    lastName: '',
    email: '',
    roles: [],
    department: '',
    active: false,
  };

  beforeEach(async () => {
    navigateMock = jest.fn();
    userServiceMock = {
      getUsers: jest.fn().mockReturnValue(
        of({
          content: mockUsers,
          totalPages: 1,
          totalItems: 2,
          message: 'Fetched successfully',
        }),
      ),
      updateUser: jest.fn().mockReturnValue(of({ message: 'User updated' })),
      createUser: jest.fn().mockReturnValue(of({ Accept: true, message: 'User created' })),
      deleteUser: jest.fn().mockReturnValue(of({ message: 'User deleted' })),
      toggleStatus: jest.fn().mockReturnValue(of({ message: 'Status toggled' })),
    };

    roleServiceMock = {
      getRoles: jest.fn().mockReturnValue(
        of({
          data: [
            { id: 1, name: 'Admin' },
            { id: 2, name: 'User' },
          ],
        }),
      ),
    };

    toastServiceMock = {
      show: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, UsersTabComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of({
              get: (key: string) => (key === 'page' ? '2' : null),
            }),
            queryParams: of({
              page: '0',
              size: '12',
            }),
          },
        },
        {
          provide: Router,
          useValue: { navigate: navigateMock },
        },
        { provide: UserService, useValue: userServiceMock },
        { provide: RoleService, useValue: roleServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    if (fixture) {
      fixture.destroy();
    }
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.allUsers()).toEqual(mockUsers);
    expect(component.searchTerm.value).toBe('');
    expect(component.currentSort).toBe(true);
    expect(component.openModalUserId).toBeNull();
    expect(component.selectedUser).toBeNull();
    expect(component.actionsModalOpen).toBe(false);
    expect(component.loading()).toBe(false);
    expect(component.userForm).toBeDefined();
  });

  it('should load users and roles on init', () => {
    component.ngOnInit();
    expect(userServiceMock.getUsers).toHaveBeenCalled();
    expect(roleServiceMock.getRoles).toHaveBeenCalled();
    expect(component.allUsers().length).toBe(2);
    expect(component.allRoles().length).toBe(2);
  });

  it('should handle error when fetching users', () => {
    jest
      .spyOn(userServiceMock, 'getUsers')
      .mockReturnValue(throwError(() => new Error('Fetch failed')));
    component.getUsers();
    expect(component.loading()).toBe(false);
  });

  it('should handle error when fetching roles', () => {
    jest
      .spyOn(roleServiceMock, 'getRoles')
      .mockReturnValue(throwError(() => new Error('Fetch roles failed')));
    component.fetchRoles();
    expect(toastServiceMock.show).not.toHaveBeenCalled(); // fetchRoles swallows error
  });

  it('should render table with users', () => {
    const tableRows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(tableRows.length).toBe(2);
    expect(tableRows[0].nativeElement.textContent).toContain('John Doe');
    expect(tableRows[1].nativeElement.textContent).toContain('Jane Smith');
  });

  it('should render empty table when no users', () => {
    jest.spyOn(userServiceMock, 'getUsers').mockReturnValue(
      of({
        content: [],
        message: 'No users',
        pageable: { pageSize: 0, pageNumber: 10 },
        totalElements: 0,
        totalPages: 0,
        numberOfElements: 0,
        last: true,
        first: true,
      }),
    );
    component.ngOnInit();
    fixture.detectChanges();
    const tableRows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(tableRows.length).toBe(1);
  });

  it('should toggle user modal', () => {
    const userId = 1;
    const event = { stopPropagation: jest.fn() } as unknown as Event;
    component.toggleUserModal(userId, event);
    expect(component.openModalUserId).toBe(userId);
    expect(event.stopPropagation).toHaveBeenCalled();
    component.toggleUserModal(userId, event);
    expect(component.openModalUserId).toBeNull();
  });

  it('should handle search term changes', () => {
    component.currentPage.set(2);
    component.searchTerm.setValue('test');
    expect(component.searchTerm.value).toBe('test');
    expect(component.currentPage()).toBe(0);
  });

  it('should reset form controls', () => {
    component.initializeForm();
    component.firstName.setValue('Test');
    component.lastName.setValue('User');
    component.email.setValue('test@example.com');
    component.role.setValue(1);
    component.department.setValue('IT');
    component.resetFormControls();
    expect(component.firstName.value).toBeNull();
    expect(component.lastName.value).toBeNull();
    expect(component.email.value).toBeNull();
    expect(component.role.value).toBeNull();
    expect(component.department.value).toBeNull();
    expect(component.roleControl.value).toBeNull();
  });

  it('should select user', () => {
    const user = mockUsers[0];
    component.selectUser(user);
    expect(component.selectedUser).toBe(user);
  });

  it('should toggle actions modal', () => {
    component.actionsToggle();
    expect(component.actionsModalOpen).toBe(true);
    component.actionsToggle();
    expect(component.actionsModalOpen).toBe(false);
  });

  it('should open edit modal with user data', () => {
    const user = mockUsers[0];
    const event = { stopPropagation: jest.fn() } as unknown as Event;
    component.editUser(user, event);
    expect(component.userPendingAction).toBe(user);
    expect(component.showEditModal).toBe(true);
    expect(component.firstName.value).toBe(user.firstName);
    expect(component.lastName.value).toBe(user.lastName);
    expect(component.email.value).toBe(user.email);
    expect(component.role.value).toBe(user.roles[0].id);
    expect(component.department.value).toBe(user.department);
    expect(component.roleControl.value).toBe(user.roles[0].id);
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should open toggle status confirmation modal', () => {
    const user = mockUsers[0];
    const event = { stopPropagation: jest.fn() } as unknown as Event;
    component.toggleUserAction(user, event, 'toggle-status');
    expect(component.userPendingAction).toBe(user);
    expect(component.confirmationAction).toBe('toggle-status');
    expect(component.showConfirmationModal).toBe(true);
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should open delete confirmation modal', () => {
    const user = mockUsers[0];
    const event = { stopPropagation: jest.fn() } as unknown as Event;
    component.toggleUserAction(user, event, 'delete');
    expect(component.userPendingAction).toBe(user);
    expect(component.confirmationAction).toBe('delete');
    expect(component.showConfirmationModal).toBe(true);
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should create new user', () => {
    component.initializeForm();
    component.showAddUserModal = true;
    component.firstName.setValue('New');
    component.lastName.setValue('User');
    component.email.setValue('new@example.com');
    component.role.setValue(2);
    component.roleControl.setValue(2);
    component.department.setValue('HR');
    component.handleUserSave();
    expect(userServiceMock.createUser).toHaveBeenCalledWith({
      firstName: 'New',
      lastName: 'User',
      email: 'new@example.com',
      roles: [2],
      department: 'HR',
    });
    expect(toastServiceMock.show).toHaveBeenCalledWith(
      toastNotifications.operations.create,
      toastNotifications.status.success,
      'User created',
    );
    expect(component.creating()).toBe(false);
  });

  it('should handle invalid form on user save', () => {
    component.initializeForm();
    component.showAddUserModal = true;
    component.email.setValue('invalid');
    component.handleUserSave();
    expect(userServiceMock.createUser).not.toHaveBeenCalled();
    expect(toastServiceMock.show).toHaveBeenCalledWith(
      toastNotifications.faildOperations.create,
      toastNotifications.status.error,
      'Please fill in all required fields correctly.',
    );
  });

  it('should handle error on user creation', () => {
    jest
      .spyOn(userServiceMock, 'createUser')
      .mockReturnValue(throwError(() => new Error('Create failed')));
    component.initializeForm();
    component.showAddUserModal = true;
    component.firstName.setValue('New');
    component.lastName.setValue('User');
    component.email.setValue('new@example.com');
    component.handleUserSave();
    expect(toastServiceMock.show).toHaveBeenCalledWith(
      toastNotifications.faildOperations.create,
      toastNotifications.status.error,
      'Please fill in all required fields correctly.',
    );
    expect(component.loading()).toBe(false);
  });

  it('should update existing user', () => {
    const user = mockUsers[0];
    component.initializeForm(user);
    component.userPendingAction = user;
    component.showEditModal = true;
    component.firstName.setValue('Updated');
    component.lastName.setValue('Name');
    component.email.setValue('updated@example.com');
    component.roleControl.setValue({ id: 2, name: 'User' });
    component.department.setValue('HR');
    component.handleUserSave();
    expect(userServiceMock.updateUser).toHaveBeenCalledWith(1, {
      firstName: 'Updated',
      lastName: 'Name',
      email: 'updated@example.com',
      roles: [{ id: 2, name: 'User' }],
      department: 'HR',
    });
    expect(toastServiceMock.show).toHaveBeenCalledWith(
      toastNotifications.operations.update,
      toastNotifications.status.success,
      'Update successful',
    );
    expect(component.showEditModal).toBe(false);
    expect(component.loading()).toBe(false);
  });

  it('should handle error on user update', () => {
    jest
      .spyOn(userServiceMock, 'updateUser')
      .mockReturnValue(throwError(() => new Error('Update failed')));
    const user = mockUsers[0];
    component.initializeForm(user);
    component.userPendingAction = user;
    component.showEditModal = true;
    component.firstName.setValue('Updated');
    component.lastName.setValue('Name');
    component.email.setValue('updated@example.com');
    component.handleUserSave();
    expect(toastServiceMock.show).toHaveBeenCalledWith(
      toastNotifications.faildOperations.update,
      toastNotifications.status.error,
      toastNotifications.messages.retry,
    );
    expect(component.loading()).toBe(false);
  });

  it('should toggle user status', () => {
    const user = mockUsers[0];
    component.userPendingAction = user;
    component.confirmationAction = 'toggle-status';
    component.confirmAction();
    expect(userServiceMock.toggleStatus).toHaveBeenCalledWith(user.id);
    expect(toastServiceMock.show).toHaveBeenCalledWith(
      toastNotifications.operations.update,
      toastNotifications.status.success,
      toastNotifications.operations.update,
    );
    expect(component.loading()).toBe(false);
  });

  it('should handle error on toggle status', () => {
    jest
      .spyOn(userServiceMock, 'toggleStatus')
      .mockReturnValue(throwError(() => new Error('Toggle failed')));
    const user = mockUsers[0];
    component.userPendingAction = user;
    component.confirmationAction = 'toggle-status';
    component.confirmAction();
    expect(toastServiceMock.show).toHaveBeenCalledWith(
      toastNotifications.faildOperations.update,
      toastNotifications.status.error,
      toastNotifications.messages.retry,
    );
    expect(component.loading()).toBe(false);
  });

  it('should delete user', () => {
    const user = mockUsers[0];
    component.userPendingAction = user;
    component.confirmationAction = 'delete';
    component.confirmAction();
    expect(userServiceMock.deleteUser).toHaveBeenCalledWith(user.id);
    expect(toastServiceMock.show).toHaveBeenCalledWith(
      toastNotifications.operations.delete,
      toastNotifications.status.success,
      'Deleted Successfully',
    );
    expect(component.loading()).toBe(false);
  });

  it('should handle error on delete user', () => {
    jest
      .spyOn(userServiceMock, 'deleteUser')
      .mockReturnValue(throwError(() => new Error('Delete failed')));
    const user = mockUsers[0];
    component.userPendingAction = user;
    component.confirmationAction = 'delete';
    component.confirmAction();
    expect(toastServiceMock.show).toHaveBeenCalledWith(
      toastNotifications.faildOperations.delete,
      toastNotifications.status.error,
      toastNotifications.messages.retry,
    );
    expect(component.loading()).toBe(false);
  });

  it('should confirm delete action', () => {
    component.allUsers.set(mockUsers);
    component.userPendingAction = mockUsers[0];
    component.confirmationAction = 'delete';
    component.confirmAction();
    expect(component.showConfirmationModal).toBe(false);
  });

  it('should close create/update modal', () => {
    component.initializeForm();
    component.showEditModal = true;
    component.userPendingAction = mockUsers[0];
    component.confirmationAction = 'toggle-status';
    component.firstName.setValue('Test');
    component.closeCreateUpdateModal();
    expect(component.showEditModal).toBe(false);
    expect(component.showAddUserModal).toBe(false);
    expect(component.userPendingAction).toBeNull();
    expect(component.confirmationAction).toBeNull();
    expect(component.showConfirmationModal).toBe(false);
    expect(component.firstName.value).toBeNull();
    expect(component.loading()).toBe(false);
  });

  it('should close confirmation modal', () => {
    component.showConfirmationModal = true;
    component.userPendingAction = mockUsers[0];
    component.confirmationAction = 'toggle-status';
    component.closeConfirmationModal();
    expect(component.showConfirmationModal).toBe(false);
    expect(component.userPendingAction).toBeNull();
    expect(component.confirmationAction).toBeNull();
    expect(component.loading()).toBe(false);
  });

  it('should not confirm action when no pending user or action', () => {
    component.confirmAction();
    expect(component.showConfirmationModal).toBe(false);
    expect(userServiceMock.toggleStatus).not.toHaveBeenCalled();
    expect(userServiceMock.deleteUser).not.toHaveBeenCalled();
  });

  it('should determine last or second to last user', () => {
    component.allUsers.set(mockUsers);
    component.itemsPerPage = 2;
    component.currentPage.set(1);
    expect(component.isLastOrSecondToLast(0)).toBe(true);
    expect(component.isLastOrSecondToLast(1)).toBe(true);
    component.itemsPerPage = 1;
    expect(component.isLastOrSecondToLast(0)).toBe(true);
  });

  it('should toggle user status and update userPendingAction.active', fakeAsync(() => {
    const user = { ...mockUsers[0], active: true };
    component.userPendingAction = user;
    jest.spyOn(userServiceMock, 'toggleStatus').mockReturnValue(
      of({
        content: [],
        pageable: { pageSize: 0, pageNumber: 0 },
        totalElements: 0,
        totalPages: 0,
        numberOfElements: 0,
        last: true,
        first: true,
        message: 'Status toggled',
      }),
    );
    component.updateUserStatus(user);
    tick(); // Wait for observable to emit
    expect(component.updating()).toBe(false);
  }));

  it('should handle error on toggle status', () => {
    jest
      .spyOn(userServiceMock, 'toggleStatus')
      .mockReturnValue(throwError(() => new Error('Toggle failed')));
    const user = mockUsers[0];
    component.userPendingAction = user;
    component.updateUserStatus(user);
    expect(toastServiceMock.show).toHaveBeenCalledWith(
      toastNotifications.faildOperations.update,
      toastNotifications.status.error,
      toastNotifications.messages.retry,
    );
    expect(component.updating()).toBe(false);
  });

  it('should not throw if updateUserStatus is called with null userPendingAction', () => {
    component.userPendingAction = null;
    expect(() => component.updateUserStatus(minimalUser)).not.toThrow();
  });

  it('should not throw if closeCreateUpdateModal is called when userForm is undefined', () => {
    component.userForm = undefined as unknown as FormGroup;
    expect(() => component.closeCreateUpdateModal()).not.toThrow();
  });

  it('should handle error in fetchRoles', () => {
    jest
      .spyOn(roleServiceMock, 'getRoles')
      .mockReturnValue(throwError(() => new Error('Fetch roles failed')));
    expect(() => component.fetchRoles()).not.toThrow();
  });

  it('should handle error in getUsers', () => {
    jest
      .spyOn(userServiceMock, 'getUsers')
      .mockReturnValue(throwError(() => new Error('Fetch users failed')));
    expect(() => component.getUsers()).not.toThrow();
    expect(component.fetching()).toBe(false);
  });

  it('should not perform any action in confirmAction if userPendingAction or confirmationAction is null', () => {
    component.userPendingAction = null;
    component.confirmationAction = 'delete';
    expect(() => component.confirmAction()).not.toThrow();
    component.userPendingAction = minimalUser;
    component.confirmationAction = null;
    expect(() => component.confirmAction()).not.toThrow();
  });

  it('should handle roleControl.valueChanges with falsy value', () => {
    expect(() => component.roleControl.setValue(null)).not.toThrow();
  });

  it('should handle onSortSelected for role', () => {
    component.onSortSelected('role', 'Admin');
    expect(component.selectedRole).toBe('Admin');
  });
  it('should handle onSortSelected for department', () => {
    component.onSortSelected('department', 'HR');
    expect(component.selectedDepartment).toBe('HR');
  });
  it('should handle onSortSelected for active', () => {
    component.onSortSelected('active', true);
    expect(component.selectedActive).toBe(true);
  });

  it('should call getUsers with all filters', () => {
    component.selectedRole = 'Admin';
    component.selectedDepartment = 'HR';
    component.selectedActive = true;
    component.searchTerm.setValue('test');
    const spy = jest.spyOn(userServiceMock, 'getUsers');
    component.getUsers();
    expect(spy).toHaveBeenCalled();
  });
});
