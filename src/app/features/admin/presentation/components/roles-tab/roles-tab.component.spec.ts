import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RolesTabComponent } from './roles-tab.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RoleService } from '@core/services/roles/roles.service';
import { ToastService } from '@core/services/toast/toast.service';
import { Role, RolesResponse } from '@shared/models';
import { of, throwError } from 'rxjs';
import { toastNotifications } from '@shared/constants/toast';

describe('RolesTabComponent', () => {
  let component: RolesTabComponent;
  let fixture: ComponentFixture<RolesTabComponent>;
  let roleServiceMock: Partial<RoleService>;
  let toastServiceMock: Partial<ToastService>;

  const mockRoles: Role[] = [
    { id: 1, name: 'Admin', description: 'Full system access', active: true, permissions: [] },
    { id: 2, name: 'Editor', description: 'Content editing rights', active: true, permissions: [] },
    { id: 3, name: 'Viewer', description: 'Read-only access', active: true, permissions: [] },
    { id: 4, name: 'Manager', description: 'Team management', active: true, permissions: [] },
    { id: 5, name: 'Guest', description: undefined, active: true, permissions: [] },
  ];

  beforeEach(async () => {
    jest.useFakeTimers();

    roleServiceMock = {
      getRoles: jest
        .fn()
        .mockReturnValue(of({ message: 'ok', data: [mockRoles[0]] } as RolesResponse)),
      getPermissions: jest
        .fn()
        .mockReturnValue(of({ success: true, message: 'ok', data: [{ id: 1, name: 'PERM' }] })),
      createRole: jest
        .fn()
        .mockReturnValue(of({ message: 'Role created', data: [mockRoles[0]] } as RolesResponse)),
      updateRole: jest
        .fn()
        .mockReturnValue(of({ message: 'Role updated', data: [mockRoles[0]] } as RolesResponse)),
      updateRoleStatus: jest
        .fn()
        .mockReturnValue(of({ message: 'Status updated', data: [mockRoles[0]] } as RolesResponse)),
      deleteRole: jest
        .fn()
        .mockReturnValue(of({ message: 'Role deleted', data: [] } as RolesResponse)),
    };

    toastServiceMock = {
      show: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RolesTabComponent, HttpClientTestingModule],
      providers: [
        { provide: RoleService, useValue: roleServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RolesTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    jest.useRealTimers();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.allRoles()).toEqual([mockRoles[0]]);
    expect(component.searchTerm.value).toBe('');
    expect(component.currentSort).toBeNull();
    expect(component.openModalRoleId).toBeNull();
    expect(component.selectedRole).toBeNull();
    expect(component.actionsModalOpen).toBe(false);
    expect(component.showRoleModal()).toBe(false);
    expect(component.showConfirmationModal).toBe(false);
    expect(component.isEditMode).toBe(false);
    expect(component.rolePendingAction).toBeNull();
  });

  it('should fetch roles and permissions on init', () => {
    const fetchRolesSpy = jest.spyOn(component, 'fetchRoles');
    const fetchPermissionsSpy = jest.spyOn(component, 'fetchPermissions');
    component.ngOnInit();
    expect(fetchRolesSpy).toHaveBeenCalled();
    expect(fetchPermissionsSpy).toHaveBeenCalled();
    expect(component.allRoles()).toEqual([mockRoles[0]]);
    expect(component.permissions).toEqual([{ id: 1, name: 'PERM' }]);
  });

  it('should handle error when fetching roles without updating state or showing toast', () => {
    component.allRoles.set([]);
    jest
      .spyOn(roleServiceMock, 'getRoles')
      .mockReturnValue(throwError(() => new Error('Fetch failed')));
    component.fetchRoles();
    expect(roleServiceMock.getRoles).toHaveBeenCalled();
    expect(component.allRoles()).toEqual([]);
    expect(toastServiceMock.show).toHaveBeenCalled();
  });

  it('should handle error when fetching permissions without updating state or showing toast', () => {
    component.permissions = [];
    jest
      .spyOn(roleServiceMock, 'getPermissions')
      .mockReturnValue(throwError(() => new Error('Fetch failed')));
    component.fetchPermissions();
    expect(roleServiceMock.getPermissions).toHaveBeenCalled();
    expect(component.permissions).toEqual([]);
    expect(toastServiceMock.show).toHaveBeenCalled();
  });

  it('should toggle actions modal', () => {
    component.actionsToggle();
    expect(component.actionsModalOpen).toBe(true);
    component.actionsToggle();
    expect(component.actionsModalOpen).toBe(false);
  });

  it('should select a role', () => {
    component.selectRole(mockRoles[0]);
    expect(component.selectedRole).toEqual(mockRoles[0]);
  });

  it('should toggle role modal', () => {
    const event = { stopPropagation: jest.fn() } as unknown as Event;
    component.toggleRoleModal(1, event);
    expect(component.openModalRoleId).toBe(1);
    expect(event.stopPropagation).toHaveBeenCalled();
    component.toggleRoleModal(1, event);
    expect(component.openModalRoleId).toBeNull();
  });

  it('should open add role modal', () => {
    component.openAddRoleModal();
    expect(component.isEditMode).toBe(false);
    expect(component.rolePendingAction).toBeNull();
    expect(component.showRoleModal()).toBe(true);
  });

  it('should open edit role modal', () => {
    const event = { stopPropagation: jest.fn() } as unknown as Event;
    component.editRole(mockRoles[0], event);
    expect(component.isEditMode).toBe(true);
    expect(component.rolePendingAction).toEqual(mockRoles[0]);
    expect(component.showRoleModal()).toBe(true);
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should toggle role status and open confirmation modal', () => {
    const event = { stopPropagation: jest.fn() } as unknown as Event;
    component.toggleRoleStatus(mockRoles[0], event);
    expect(component.rolePendingAction).toEqual(mockRoles[0]);
    expect(component.confirmationAction).toBe('toggle-status');
    expect(component.showConfirmationModal).toBe(true);
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should delete role and open confirmation modal', () => {
    const event = { stopPropagation: jest.fn() } as unknown as Event;
    component.deleteRole(mockRoles[0], event);
    expect(component.rolePendingAction).toEqual(mockRoles[0]);
    expect(component.confirmationAction).toBe('delete');
    expect(component.showConfirmationModal).toBe(true);
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should close role modal and reset state', () => {
    component.showRoleModal.set(true);
    component.rolePendingAction = mockRoles[0];
    component.closeRoleModal();
    expect(component.showRoleModal()).toBe(false);
    expect(component.rolePendingAction).toBeNull();
  });

  it('should close confirmation modal and reset state', () => {
    component.showConfirmationModal = true;
    component.confirmationAction = 'delete';
    component.rolePendingAction = mockRoles[0];
    component.closeConfirmationModal();
    expect(component.showConfirmationModal).toBe(false);
    expect(component.confirmationAction).toBeNull();
    expect(component.rolePendingAction).toBeNull();
  });

  it('should create role and close modal on success', () => {
    const newRole: Role = { id: 2, name: 'User', active: true, permissions: [] };
    component.showRoleModal.set(true);
    component.createRole(newRole);
    expect(roleServiceMock.createRole).toHaveBeenCalledWith(newRole);
    expect(toastServiceMock.show).toHaveBeenCalledWith(
      toastNotifications.operations.create,
      toastNotifications.status.success,
      toastNotifications.operations.create,
    );
    expect(component.showRoleModal()).toBe(false);
  });

  it('should handle error when creating role', () => {
    jest
      .spyOn(roleServiceMock, 'createRole')
      .mockReturnValue(throwError(() => new Error('Create failed')));
    const newRole: Role = { id: 2, name: 'User', active: true, permissions: [] };
    component.showRoleModal.set(true);
    component.createRole(newRole);
    expect(toastServiceMock.show).toHaveBeenCalledWith(
      toastNotifications.faildOperations.create,
      toastNotifications.status.error,
      toastNotifications.messages.retry,
    );
    expect(component.showRoleModal()).toBe(true);
  });

  it('should update role and close modal on success', () => {
    const updatedRole: Role = { id: 1, name: 'Updated Admin', active: true, permissions: [] };
    component.showRoleModal.set(true);
    component.allRoles.set([mockRoles[0]]);
    component.updateRole(1, updatedRole);
    expect(roleServiceMock.updateRole).toHaveBeenCalledWith({ id: 1, roleData: updatedRole });
    expect(toastServiceMock.show).toHaveBeenCalledWith(
      toastNotifications.operations.update,
      toastNotifications.status.success,
      'Role updated',
    );
    expect(component.showRoleModal()).toBe(false);
  });

  it('should handle error when updating role', () => {
    jest
      .spyOn(roleServiceMock, 'updateRole')
      .mockReturnValue(throwError(() => new Error('Update failed')));
    const updatedRole: Role = { id: 1, name: 'Updated Admin', active: true, permissions: [] };
    component.showRoleModal.set(true);
    component.updateRole(1, updatedRole);
    expect(toastServiceMock.show).toHaveBeenCalledWith(
      toastNotifications.faildOperations.update,
      toastNotifications.status.error,
      toastNotifications.messages.retry,
    );
    expect(component.showRoleModal()).toBe(true);
  });

  it('should update role status and refresh roles', () => {
    const role: Role = { id: 1, name: 'Admin', active: true, permissions: [] };
    component.rolePendingAction = role;
    component.updateRoleStatus(1);
    expect(roleServiceMock.updateRoleStatus).toHaveBeenCalledWith(1);
    expect(toastServiceMock.show).toHaveBeenCalledWith(
      toastNotifications.operations.update,
      toastNotifications.status.success,
      toastNotifications.operations.update,
    );
    expect(role.active).toBe(false);
    expect(roleServiceMock.getRoles).toHaveBeenCalled();
    expect(component.showRoleModal()).toBe(false);
  });

  it('should handle error when updating role status', () => {
    jest
      .spyOn(roleServiceMock, 'updateRoleStatus')
      .mockReturnValue(throwError(() => new Error('Update failed')));
    component.rolePendingAction = mockRoles[0];
    component.updateRoleStatus(1);
    expect(toastServiceMock.show).toHaveBeenCalledWith(
      toastNotifications.faildOperations.update,
      toastNotifications.status.error,
      toastNotifications.messages.retry,
    );
    expect(component.showRoleModal()).toBe(false);
  });

  it('should delete role and refresh roles', () => {
    component.allRoles.set([mockRoles[0]]);
    component.rolePendingAction = mockRoles[0];
    component['confirmDeleteRole'](1);
    expect(roleServiceMock.deleteRole).toHaveBeenCalledWith(1);
    expect(toastServiceMock.show).toHaveBeenCalledWith(
      toastNotifications.operations.delete,
      toastNotifications.status.success,
      toastNotifications.operations.delete,
    );
    expect(component.openModalRoleId).toBeNull();
  });

  it('should handle error when deleting role', () => {
    jest
      .spyOn(roleServiceMock, 'deleteRole')
      .mockReturnValue(throwError(() => new Error('Delete failed')));
    component.allRoles.set([mockRoles[0]]);
    component['confirmDeleteRole'](1);
    expect(toastServiceMock.show).toHaveBeenCalledWith(
      toastNotifications.faildOperations.update,
      toastNotifications.status.error,
      expect.any(String),
    );
    expect(component.openModalRoleId).toBeNull();
  });

  it('should handle modal action for create', () => {
    const newRole: Role = { id: 2, name: 'User', active: true, permissions: [] };
    const createRoleSpy = jest.spyOn(component, 'createRole');
    component.modalAction({ data: newRole, action: 'CREATE' });
    expect(createRoleSpy).toHaveBeenCalledWith(newRole);
  });

  it('should handle modal action for update', () => {
    const updatedRole: Role = { id: 1, name: 'Updated Admin', active: true, permissions: [] };
    const updateRoleSpy = jest.spyOn(component, 'updateRole');
    component.modalAction({ id: 1, data: updatedRole, action: 'UPDATE' });
    expect(updateRoleSpy).toHaveBeenCalledWith(1, updatedRole);
  });

  it('should confirm action for toggle status', () => {
    const role: Role = { id: 1, name: 'Admin', active: true, permissions: [] };
    component.allRoles.set([role]);
    component.rolePendingAction = role;
    component.confirmationAction = 'toggle-status';
    const updateRoleStatusSpy = jest.spyOn(component, 'updateRoleStatus');
    component.confirmAction();
    expect(updateRoleStatusSpy).toHaveBeenCalledWith(1);
  });

  it('should not confirm action when rolePendingAction is null', () => {
    component.rolePendingAction = null;
    component.confirmationAction = 'toggle-status';
    component.confirmAction();
    expect(roleServiceMock.updateRoleStatus).not.toHaveBeenCalled();
    expect(roleServiceMock.deleteRole).not.toHaveBeenCalled();
  });

  it('should not confirm action when confirmationAction is null', () => {
    component.rolePendingAction = mockRoles[0];
    component.confirmationAction = null;
    component.confirmAction();
    expect(roleServiceMock.updateRoleStatus).not.toHaveBeenCalled();
    expect(roleServiceMock.deleteRole).not.toHaveBeenCalled();
  });

  it('should handle empty role list', () => {
    jest
      .spyOn(roleServiceMock, 'getRoles')
      .mockReturnValue(of({ message: 'ok', data: [] } as RolesResponse));
    component.ngOnInit();
    expect(component.allRoles()).toEqual([]);
  });

  it('should filter roles by name using searchTerm', () => {
    component.allRoles.set(mockRoles);
    component.searchTerm.patchValue('Admin');
    // Simulate debounce
    jest.advanceTimersByTime(300);
    expect(component.filteredRoles()).toEqual([mockRoles[0]]);
  });

  it('should filter roles by description using searchTerm', () => {
    component.allRoles.set(mockRoles);
    component.searchTerm.patchValue('Content editing');
    jest.advanceTimersByTime(300);
    expect(component.filteredRoles()).toEqual([mockRoles[1]]);
  });

  it('should return all roles when searchTerm is empty', () => {
    component.allRoles.set(mockRoles);
    component.searchTerm.patchValue('');
    jest.advanceTimersByTime(300);
    expect(component.filteredRoles()).toEqual(mockRoles);
  });

  it('should return no roles if searchTerm does not match any name or description', () => {
    component.allRoles.set(mockRoles);
    component.searchTerm.patchValue('Nonexistent');
    jest.advanceTimersByTime(300);
    expect(component.filteredRoles()).toEqual([]);
  });

  it('should clear search and return all roles', () => {
    component.allRoles.set(mockRoles);
    component.searchTerm.patchValue('Admin');
    jest.advanceTimersByTime(300);
    expect(component.filteredRoles()).toEqual([mockRoles[0]]);
    component.clearSearch();
    jest.advanceTimersByTime(300);
    expect(component.filteredRoles()).toEqual(mockRoles);
  });

  it('should update searchSignal when searchTerm value changes', () => {
    component.searchTerm.patchValue('test search');
    jest.advanceTimersByTime(300);
    expect(component.searchSignal()).toBe('test search');
  });

  it('should reset all form controls to default values', () => {
    // Set search term
    component.searchTerm.patchValue('test search');
    jest.advanceTimersByTime(300);
    expect(component.searchSignal()).toBe('test search');

    // Reset all form controls
    component.resetAllFormControls();

    // Verify search is reset
    expect(component.searchTerm.value).toBe('');
    expect(component.searchSignal()).toBe('');
  });

  it('should reset form controls when closing role modal', () => {
    // Set search term
    component.searchTerm.patchValue('test search');
    jest.advanceTimersByTime(300);

    // Close modal
    component.closeRoleModal();

    // Verify search is reset
    expect(component.searchTerm.value).toBe('');
    expect(component.searchSignal()).toBe('');
    expect(component.showRoleModal()).toBe(false);
  });

  it('should use resetAllFormControls in clearSearch method', () => {
    const resetSpy = jest.spyOn(component, 'resetAllFormControls');

    component.clearSearch();

    expect(resetSpy).toHaveBeenCalled();
  });
});
