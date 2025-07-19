import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  OnInit,
  output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { LucideAngularModule, X } from 'lucide-angular';
import { Role, Permission } from '@shared/models';
import { checkFieldErrors } from '@shared/utils/helpers/errorHandlers';
import {
  ModalComponent,
  InputComponent,
  CheckboxComponent,
  LoaderComponent,
} from '@shared/components';

@Component({
  selector: 'app-role-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    CheckboxComponent,
    LucideAngularModule,
    ModalComponent,
    LoaderComponent,
  ],
  templateUrl: './role-form-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleFormModalComponent implements OnInit, OnChanges {
  public readonly role = input<Role | null>(null);
  public readonly isEditMode = input<boolean>(false);
  public readonly updating = input<boolean>(false);
  public readonly gettingPermissions = input<boolean>(false);

  public readonly isOpen = input<boolean>(false);
  public readonly closeModalEvent = output<void>();
  public readonly roleData = output<{ id?: number; data: Role; action: 'CREATE' | 'UPDATE' }>();
  protected readonly checkFieldError = checkFieldErrors;
  public readonly RoleName = new FormControl('');
  public readonly dummy = new FormControl('');

  public readonly RoleDescription = new FormControl('');
  public readonly permissions = input<Permission[]>([]);
  private readonly changeDetectionRef = inject(ChangeDetectorRef);
  public roleForm!: FormGroup;

  public permissionControls: Record<string, FormControl> = {};

  public icons = { X };

  ngOnInit(): void {
    this.changeDetectionRef.markForCheck();
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['role'] && !changes['role'].firstChange) ||
      (changes['permissions'] && !changes['permissions'].firstChange)
    ) {
      this.initializeForm();
      this.changeDetectionRef.markForCheck();
    }
  }

  public initializeForm(): void {
    if (!this.permissions() || this.permissions().length === 0) {
      return;
    }
    const role = this.role();

    const name = role?.name ?? '';
    const description = role?.description ?? '';
    const rolePermissions = role?.permissions ?? [];

    const permissionGroup: Record<string, FormControl> = {};
    this.permissions().forEach((permission) => {
      const controlName = this.toCamelCase(permission.name);
      const hasPermission = rolePermissions.includes(permission.id);
      permissionGroup[controlName] = new FormControl(hasPermission);
    });

    this.permissionControls = permissionGroup;

    this.roleForm = new FormGroup({
      name: new FormControl(name, Validators.required),
      description: new FormControl(description, Validators.required),
      permissions: new FormGroup(permissionGroup),
    });
  }

  public toCamelCase(str: string): string {
    return str
      .split(/[^a-zA-Z0-9]+/)
      .map((word, index) =>
        index === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      )
      .join('');
  }

  public formatPermissionName(name: string): string {
    return name
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  public get nameControl(): FormControl {
    return this.roleForm.get('name') as FormControl;
  }

  public get descriptionControl(): FormControl {
    return this.roleForm.get('description') as FormControl;
  }

  public getPermissionControl(name: string): FormControl {
    const controlName = this.toCamelCase(name);
    const permissionsGroup = this.roleForm.get('permissions') as FormGroup;
    return permissionsGroup.get(controlName) as FormControl;
  }

  public resetFormControls(): void {
    this.nameControl.reset('');
    this.descriptionControl.reset('');

    Object.values(this.permissionControls).forEach((control) => {
      control.reset(false);
    });
    this.roleForm.markAsUntouched();
    this.roleForm.markAsPristine();
  }

  public onCloseModal(): void {
    this.resetFormControls();
    this.closeModalEvent.emit();
  }

  public toggleAction(): void {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }
    const selectedPermissions = this.permissions().filter((permission) => {
      const controlName = this.toCamelCase(permission.name);
      return this.permissionControls[controlName]?.value === true;
    });

    const selectedPermissionIds = selectedPermissions.map((permission) => permission.id);

    const name = this.nameControl.value ?? '';
    const description = this.descriptionControl.value ?? '';

    if (this.isEditMode() && this.role()) {
      const updatePayload: { name: string; description: string; permissionIds: number[] } = {
        name,
        description,
        permissionIds: selectedPermissionIds,
      };
      this.roleData.emit({
        id: this.role()?.id,
        data: updatePayload,
        action: 'UPDATE',
      });
    } else {
      this.roleData.emit({
        data: {
          name,
          description,
          permissions: selectedPermissionIds,
        },
        action: 'CREATE',
      });
    }
  }
}
