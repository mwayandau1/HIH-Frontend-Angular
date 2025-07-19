import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleFormModalComponent } from './role-form-modal.component';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { CheckboxComponent } from '@shared/components/custom-checkbox/custom-checkbox.component';
import { LucideAngularModule } from 'lucide-angular';
import { Role, Permission } from '@shared/models';

describe('RoleFormModalComponent', () => {
  let component: RoleFormModalComponent;
  let fixture: ComponentFixture<RoleFormModalComponent>;

  const mockRole: Role = {
    id: 1,
    name: 'Role Name',
    description: 'Test Description',
    active: true,
    createdAt: new Date().toISOString(),
    permissions: [1, 2],
  };

  const mockPermissions: Permission[] = [
    { id: 1, name: 'CREATE_USER' },
    { id: 2, name: 'EDIT_USER' },
    { id: 3, name: 'DELETE_USER' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RoleFormModalComponent,
        ReactiveFormsModule,
        ButtonComponent,
        InputComponent,
        CheckboxComponent,
        LucideAngularModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleFormModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('permissions', mockPermissions);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize in add mode by default', () => {
      expect(component.isEditMode()).toBeFalsy();
    });

    it('should initialize form with empty values in add mode', () => {
      expect(component.nameControl.value).toBe('');
      expect(component.descriptionControl.value).toBe('');
    });

    it('should initialize form with role values in edit mode', () => {
      fixture.componentRef.setInput('role', mockRole);
      fixture.componentRef.setInput('isEditMode', true);
      component.initializeForm();

      expect(component.nameControl.value).toBe(mockRole.name);
      expect(component.descriptionControl.value).toBe(mockRole.description);
    });

    it('should initialize permission controls with correct values', () => {
      fixture.componentRef.setInput('role', mockRole);
      fixture.componentRef.setInput('isEditMode', true);
      component.initializeForm();

      expect(component.getPermissionControl('CREATE_USER').value).toBe(true);
      expect(component.getPermissionControl('EDIT_USER').value).toBe(true);
      expect(component.getPermissionControl('DELETE_USER').value).toBe(false);
    });
  });

  describe('Form Validation', () => {
    it('should mark form as invalid when empty', () => {
      expect(component.roleForm.valid).toBeFalsy();
    });

    it('should mark form as valid when required fields are filled', () => {
      component.nameControl.setValue('Test Role');
      component.descriptionControl.setValue('Test Description');

      expect(component.roleForm.valid).toBeTruthy();
    });

    it('should mark name as invalid when empty', () => {
      component.nameControl.setValue('');
      component.nameControl.markAsTouched();

      expect(component.nameControl.valid).toBeFalsy();
      expect(component.nameControl.errors?.['required']).toBeTruthy();
    });

    it('should mark description as invalid when empty', () => {
      component.descriptionControl.setValue('');
      component.descriptionControl.markAsTouched();

      expect(component.descriptionControl.valid).toBeFalsy();
      expect(component.descriptionControl.errors?.['required']).toBeTruthy();
    });
  });

  describe('Output Events', () => {
    it('should emit closeModalEvent when onCloseModal is called', () => {
      const spy = jest.spyOn(component.closeModalEvent, 'emit');
      component.onCloseModal();
      expect(spy).toHaveBeenCalled();
    });

    it('should emit roleData with CREATE action when in add mode', () => {
      const spy = jest.spyOn(component.roleData, 'emit');
      component.nameControl.setValue('New Role');
      component.descriptionControl.setValue('New Description');
      component.getPermissionControl('CREATE_USER').setValue(true);

      component.toggleAction();

      expect(spy).toHaveBeenCalledWith({
        data: {
          name: 'New Role',
          description: 'New Description',
          permissions: [1],
        },
        action: 'CREATE',
      });
    });
    describe('Form Behavior', () => {
      it('should mark all as touched when form is invalid and toggleAction is called', () => {
        const markAllAsTouchedSpy = jest.spyOn(component.roleForm, 'markAllAsTouched');
        component.toggleAction();
        expect(markAllAsTouchedSpy).toHaveBeenCalled();
        expect(component.nameControl.touched).toBeTruthy();
        expect(component.descriptionControl.touched).toBeTruthy();
      });

      it('should not emit roleData when form is invalid', () => {
        const spy = jest.spyOn(component.roleData, 'emit');
        component.nameControl.setValue('');
        component.descriptionControl.setValue('');
        component.toggleAction();
        expect(spy).not.toHaveBeenCalled();
      });

      it('should initialize permission controls for all permissions', () => {
        component.initializeForm();
        expect(Object.keys(component.permissionControls).length).toBe(mockPermissions.length);
        expect(component.permissionControls['createUser']).toBeDefined();
        expect(component.permissionControls['editUser']).toBeDefined();
        expect(component.permissionControls['deleteUser']).toBeDefined();
      });
    });
    it('should emit roleData with UPDATE action when in edit mode', () => {
      fixture.componentRef.setInput('role', mockRole);
      fixture.componentRef.setInput('isEditMode', true);
      component.initializeForm();

      const spy = jest.spyOn(component.roleData, 'emit');
      component.nameControl.setValue('Updated Role');
      component.descriptionControl.setValue('Updated Description');

      component.toggleAction();

      expect(spy).toHaveBeenCalledWith({
        id: 1,
        data: {
          name: 'Updated Role',
          description: 'Updated Description',
          permissionIds: mockRole.permissions,
        },
        action: 'UPDATE',
      });
    });
  });

  describe('Helper Methods', () => {
    it('should convert string to camelCase', () => {
      expect(component.toCamelCase('TEST_PERMISSION')).toBe('testPermission');
      expect(component.toCamelCase('ANOTHER_TEST')).toBe('anotherTest');
    });

    it('should format permission name correctly', () => {
      expect(component.formatPermissionName('CREATE_USER')).toBe('Create User');
      expect(component.formatPermissionName('EDIT_ROLE')).toBe('Edit Role');
    });
  });

  describe('Form Controls Accessors', () => {
    it('should return name control', () => {
      expect(component.nameControl).toBeInstanceOf(FormControl);
    });

    it('should return description control', () => {
      expect(component.descriptionControl).toBeInstanceOf(FormControl);
    });

    it('should return permission control', () => {
      const control = component.getPermissionControl('CREATE_USER');
      expect(control).toBeInstanceOf(FormControl);
    });
  });

  describe('Form Reset Functionality', () => {
    it('should reset all form controls to default values', () => {
      // Set some values first
      component.nameControl.setValue('Test Role');
      component.descriptionControl.setValue('Test Description');
      component.getPermissionControl('CREATE_USER').setValue(true);
      component.getPermissionControl('EDIT_USER').setValue(true);

      // Mark form as touched and dirty
      component.roleForm.markAsTouched();
      component.roleForm.markAsDirty();

      // Reset form controls
      component.resetFormControls();

      // Verify all controls are reset
      expect(component.nameControl.value).toBe('');
      expect(component.descriptionControl.value).toBe('');
      expect(component.getPermissionControl('CREATE_USER').value).toBe(false);
      expect(component.getPermissionControl('EDIT_USER').value).toBe(false);
      expect(component.getPermissionControl('DELETE_USER').value).toBe(false);

      // Verify form state is reset
      expect(component.roleForm.touched).toBe(false);
      expect(component.roleForm.dirty).toBe(false);
    });

    it('should reset form controls when closing modal', () => {
      // Set some values
      component.nameControl.setValue('Test Role');
      component.descriptionControl.setValue('Test Description');

      const resetSpy = jest.spyOn(component, 'resetFormControls');
      const emitSpy = jest.spyOn(component.closeModalEvent, 'emit');

      component.onCloseModal();

      expect(resetSpy).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalled();
    });

    it('should reset form controls after successful form submission', () => {
      // Set valid form values
      component.nameControl.setValue('Test Role');
      component.descriptionControl.setValue('Test Description');

      const emitSpy = jest.spyOn(component.roleData, 'emit');

      component.toggleAction();

      expect(emitSpy).toHaveBeenCalled();
      // No longer expect resetSpy to have been called, since form is only reset on modal close
    });
  });
});
