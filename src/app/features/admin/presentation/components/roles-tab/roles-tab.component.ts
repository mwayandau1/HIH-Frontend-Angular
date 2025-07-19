import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Permission, Role } from '@shared/models';
import { sortOptions } from '@shared/constants/user';
import { LucideAngularModule, Search, X } from 'lucide-angular';
import { RoleFormModalComponent } from './role-form-modal/role-form-modal.component';
import { RoleService } from '@core/services/roles/roles.service';
import { ToastService } from '@core/services/toast/toast.service';
import { toastNotifications, ToastStatus } from '@shared/constants/toast';
import { formatDate } from '@shared/utils/helpers/dates';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import {
  LoaderComponent,
  ConfirmModalComponent,
  ButtonComponent,
  InputComponent,
} from '@shared/components';

@Component({
  selector: 'app-roles-tab',
  templateUrl: './roles-tab.component.html',
  imports: [
    CommonModule,
    InputComponent,
    ButtonComponent,
    LucideAngularModule,
    RoleFormModalComponent,
    LoaderComponent,
    ConfirmModalComponent,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesTabComponent implements OnInit {
  public readonly allRoles = signal<Role[]>([]);
  protected readonly options = sortOptions;
  public readonly icons = { Search, X };
  public permissions: Permission[] = [];
  private readonly toast = inject(ToastService);
  private readonly roleService = inject(RoleService);
  public searchTerm: FormControl = new FormControl('');
  public readonly searchSignal = signal('');
  public showRoleModal = signal(false);
  public readonly updating = signal(false);
  public readonly loading = signal(false);
  public readonly fetchingPermissions = signal(false);
  protected readonly formatDate = formatDate;
  public readonly currentSort: string | null = null;
  public openModalRoleId: number | null = null;
  public selectedRole: Role | null = null;
  public actionsModalOpen = false;
  public showConfirmationModal = false;
  public confirmationAction: 'toggle-status' | 'delete' | null = null;
  public isEditMode = false;
  public rolePendingAction: Role | null = null;

  @HostListener('document:click', ['$event'])
  public onDocumentClick(): void {
    this.openModalRoleId = null;
  }

  public actionsToggle(): void {
    this.actionsModalOpen = !this.actionsModalOpen;
  }
  public resetAllFormControls(): void {
    this.searchTerm.reset('');
    this.searchSignal.set('');
  }

  public clearSearch(): void {
    this.resetAllFormControls();
  }
  public isLastOrSecondToLast(index: number): boolean {
    const displayedUsers = this.allRoles().length;
    return index >= displayedUsers - 2;
  }

  public selectRole(role: Role): void {
    this.selectedRole = role;
  }

  public toggleRoleModal(roleId: number, event: Event): void {
    event.stopPropagation();
    this.openModalRoleId = this.openModalRoleId === roleId ? null : roleId;
  }

  public openAddRoleModal(): void {
    this.isEditMode = false;
    this.rolePendingAction = null;
    this.showRoleModal.set(true);
  }

  public editRole(role: Role, event: Event): void {
    event.stopPropagation();
    this.isEditMode = true;
    this.rolePendingAction = role;
    this.showRoleModal.set(true);
  }

  public toggleRoleStatus(role: Role, event: Event): void {
    event.stopPropagation();
    this.rolePendingAction = role;
    this.confirmationAction = 'toggle-status';
    this.showConfirmationModal = true;
  }

  public deleteRole(role: Role, event: Event): void {
    event.stopPropagation();
    this.rolePendingAction = role;
    this.confirmationAction = 'delete';
    this.showConfirmationModal = true;
  }

  public modalAction(event: { id?: number; data: Role; action: 'CREATE' | 'UPDATE' }): void {
    if (event.action === 'CREATE') {
      this.createRole(event.data);
    } else if (event.action === 'UPDATE' && event.id) {
      this.updateRole(event.id, event.data);
    }
  }

  public readonly filteredRoles = computed(() => {
    const term = this.searchSignal().toLowerCase();
    return this.allRoles().filter(
      (role) =>
        role.name.toLowerCase().includes(term) || role.description?.toLowerCase().includes(term),
    );
  });

  public createRole(roleData: Role): void {
    this.updating.set(true);
    this.roleService.createRole(roleData).subscribe({
      next: () => {
        this.showRoleModal.set(false);
        this.toast.show(
          toastNotifications.operations.create,
          toastNotifications.status.success as ToastStatus,
          toastNotifications.operations.create,
        );
        this.fetchRoles();

        this.updating.set(false);
      },
      error: () => {
        this.toast.show(
          toastNotifications.faildOperations.create,
          toastNotifications.status.error as ToastStatus,
          toastNotifications.messages.retry,
        );
        this.updating.set(false);
      },
    });
  }

  public updateRole(id: number, roleData: Role): void {
    this.updating.set(true);
    this.roleService.updateRole({ id, roleData }).subscribe({
      next: (response) => {
        this.showRoleModal.set(false);
        this.toast.show(
          toastNotifications.operations.update,
          toastNotifications.status.success as ToastStatus,
          response.message,
        );
        this.fetchRoles();

        this.updating.set(false);
      },
      error: () => {
        this.toast.show(
          toastNotifications.faildOperations.update,
          toastNotifications.status.error as ToastStatus,
          toastNotifications.messages.retry,
        );
        this.updating.set(false);
      },
    });
  }
  public updateRoleStatus(id: number): void {
    this.updating.set(true);
    this.roleService.updateRoleStatus(id).subscribe({
      next: () => {
        this.toast.show(
          toastNotifications.operations.update,
          toastNotifications.status.success as ToastStatus,
          toastNotifications.operations.update,
        );
        if (!this.rolePendingAction) return;
        this.rolePendingAction.active = !this.rolePendingAction.active;
        this.fetchRoles();
        this.closeRoleModal();
        this.updating.set(false);
      },
      error: () => {
        this.toast.show(
          toastNotifications.faildOperations.update,
          toastNotifications.status.error as ToastStatus,
          toastNotifications.messages.retry,
        );
        this.closeRoleModal();
        this.updating.set(false);
      },
    });
  }

  private confirmDeleteRole(id: number): void {
    this.updating.set(true);
    this.roleService.deleteRole(id).subscribe({
      next: () => {
        this.openModalRoleId = null;
        this.toast.show(
          toastNotifications.operations.delete,
          toastNotifications.status.success as ToastStatus,
          toastNotifications.operations.delete,
        );
        this.updating.set(false);
        this.closeConfirmationModal();
        this.fetchRoles();
      },
      error: () => {
        this.toast.show(
          toastNotifications.faildOperations.update,
          toastNotifications.status.error as ToastStatus,
          toastNotifications.messages.retry,
        );
        this.updating.set(false);
      },
    });
  }

  public closeRoleModal(): void {
    this.showRoleModal.set(false);
    this.rolePendingAction = null;
    this.updating.set(false);
    this.resetAllFormControls();
  }

  public confirmAction(): void {
    if (!this.rolePendingAction || !this.confirmationAction) return;

    if (this.confirmationAction === 'toggle-status') {
      this.updateRoleStatus(this.rolePendingAction.id!);
    } else if (this.confirmationAction === 'delete') {
      this.confirmDeleteRole(this.rolePendingAction.id!);
    }
  }

  public closeConfirmationModal(): void {
    this.showConfirmationModal = false;
    this.confirmationAction = null;
    this.rolePendingAction = null;
    this.loading.set(false);
    this.updating.set(false);
  }

  public fetchPermissions(): void {
    this.fetchingPermissions.set(true);
    this.roleService.getPermissions().subscribe({
      next: (response) => {
        this.permissions = response.data;
        this.fetchingPermissions.set(false);
      },
      error: () => {
        this.fetchingPermissions.set(false);
        this.toast.show(
          toastNotifications.faildOperations.fetch,
          toastNotifications.status.error as ToastStatus,
          toastNotifications.messages.retry,
        );
      },
    });
  }

  public fetchRoles(): void {
    this.loading.set(true);
    this.roleService.getRoles().subscribe({
      next: (response) => {
        this.allRoles.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.show(
          toastNotifications.faildOperations.fetch,
          toastNotifications.status.error as ToastStatus,
          toastNotifications.messages.retry,
        );
      },
    });
  }

  ngOnInit(): void {
    this.fetchPermissions();
    this.fetchRoles();

    this.searchTerm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.searchSignal.set(value ?? '');
      });
  }
}
