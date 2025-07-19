import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  signal,
  computed,
  HostListener,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ButtonDropdownComponent } from '../button-dropdown/button-dropdown.component';
import { DropdownItem, Role, User, UserDataResponse } from '@shared/models';
import { UserRole } from '@shared/models/userRoles';
import { sortOptions } from '@shared/constants/user';
import { LucideAngularModule, Search, X } from 'lucide-angular';
import { UserService } from '@core/services/user/user.service';
import {
  ConfirmModalComponent,
  ModalComponent,
  InputComponent,
  ButtonComponent,
  SelectInputComponent,
  PaginationComponent,
  LoaderComponent,
} from '@shared/components';
import { ToastService } from '@core/services/toast/toast.service';
import { ToastStatus, toastNotifications } from '@shared/constants/toast';
import { RoleService } from '@core/services/roles/roles.service';
import { checkFieldErrors } from '@shared/utils/helpers/errorHandlers';
import { formatWord } from '@shared/utils/helpers/formatting';
import { ActivatedRoute } from '@angular/router';
import { customEmailValidator } from '@shared/utils/validators/validators';

@Component({
  selector: 'app-users-tab',
  templateUrl: './users-tab.component.html',
  imports: [
    CommonModule,
    ButtonDropdownComponent,
    InputComponent,
    ButtonComponent,
    LucideAngularModule,
    SelectInputComponent,
    ModalComponent,
    PaginationComponent,
    LoaderComponent,
    ConfirmModalComponent,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersTabComponent implements OnInit {
  public readonly allUsers = signal<User[]>([]);
  public readonly loading = signal<boolean>(false);
  public readonly fetching = signal<boolean>(false);
  public readonly isDepartmentRequired = signal<boolean>(false);
  public readonly updating = signal<boolean>(false);
  public readonly creating = signal<boolean>(false);
  public readonly totalRecords = signal<number>(0);
  public readonly numOfPages = signal<number>(0);
  public selectedRole: string | null = null;
  public selectedDepartment: string | null = null;
  public selectedActive: string | boolean | null = null;

  public readonly formatWord = formatWord;
  protected readonly options = sortOptions;
  public readonly checkFieldErrors = checkFieldErrors;
  public readonly roles = signal<Role[]>([]);
  public readonly sortRoles = computed(() => {
    return this.roles().map(
      (role) =>
        ({
          id: role.name,
          label: role.name,
        }) as unknown as DropdownItem,
    );
  });
  public readonly allRoles = computed(() => {
    return this.roles().map(
      (role) =>
        ({
          id: role.id,
          label: role.name,
        }) as unknown as DropdownItem,
    );
  });

  private readonly toast = inject(ToastService);
  private readonly changeDetectionRef = inject(ChangeDetectorRef);
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly route = inject(ActivatedRoute);

  public readonly searchTerm = new FormControl('');
  public readonly roleControl = new FormControl();
  public userForm!: FormGroup;
  public readonly departmentControl = new FormControl('');
  public readonly activeControl = new FormControl('');

  public currentSort: string | boolean = true;
  public openModalUserId: number | null = null;
  public selectedUser: User | null = null;
  public actionsModalOpen = false;
  public showAddUserModal = false;
  public showConfirmationModal = false;
  public showEditModal = false;
  public confirmationAction: 'toggle-status' | 'delete' | null = null;
  public userPendingAction: User | null = null;
  public currentPage = signal(0);
  public itemsPerPage = 12;

  public readonly icons = { Search, X };

  @HostListener('document:click', ['$event'])
  public onDocumentClick(): void {
    this.openModalUserId = null;
  }

  public constructor() {
    this.searchTerm.valueChanges.subscribe(() => {
      this.currentPage.set(0);
    });

    this.route.queryParams.subscribe((params) => {
      const page = parseInt(params['page'] ?? '0', 10);
      const size = parseInt(params['size'] ?? this.itemsPerPage.toString(), 10);

      if (page > 0) {
        this.currentPage.set(page - 1);
      } else {
        this.currentPage.set(page);
      }

      if (size > 0) this.itemsPerPage = size;
      this.getUsers();
    });

    this.roleControl.valueChanges.subscribe((selectedRoleId) => {
      if (selectedRoleId) {
        const selectedRole = this.roles().find((role) => role.id === selectedRoleId);
        const shouldhaveDepartment =
          selectedRole?.name.toLowerCase() === UserRole.Admin.toLowerCase() ||
          selectedRole?.name.toLowerCase() === UserRole.Patient.toLowerCase();
        const isProvider = selectedRole?.name.toLowerCase() === UserRole.Provider.toLowerCase();
        if (shouldhaveDepartment) {
          this.department.setValue('NA', { emitEvent: false });
          this.department.disable({ emitEvent: false });
        } else {
          this.department.setValue('', { emitEvent: false });
          this.department.enable({ emitEvent: false });
        }
        if (isProvider) {
          this.department.setValidators(Validators.required);
        } else {
          this.department.clearValidators();
        }
        this.department.updateValueAndValidity();
        this.isDepartmentRequired.set(
          !!this.department.validator && this.department.validator.toString().includes('required'),
        );
        this.changeDetectionRef.markForCheck();
      }
      this.userForm?.get('role')?.setValue(selectedRoleId, { emitEvent: false });
    });
  }

  public get firstName(): FormControl {
    return this.userForm.get('firstName') as FormControl;
  }

  public get lastName(): FormControl {
    return this.userForm.get('lastName') as FormControl;
  }

  public get email(): FormControl {
    return this.userForm.get('email') as FormControl;
  }

  public get role(): FormControl {
    return this.userForm.get('role') as FormControl;
  }

  get department(): FormControl {
    return this.userForm.get('department') as FormControl;
  }

  public initializeForm(user?: User): void {
    const isProvider = user?.roles?.[0]?.name?.toLowerCase() === UserRole.Provider.toLowerCase();
    this.userForm = new FormGroup({
      firstName: new FormControl(user?.firstName ?? '', Validators.required),
      lastName: new FormControl(user?.lastName ?? '', Validators.required),
      email: new FormControl(user?.email ?? '', [Validators.required, customEmailValidator]),
      role: new FormControl(user?.roles[0].id ?? '', Validators.required),
      department: new FormControl('', isProvider ? Validators.required : undefined),
    });

    if (user?.roles?.[0]) {
      const roleId = user.roles[0].id;
      const shouldhaveDepartment =
        user.roles[0].name.toLowerCase() === UserRole.Admin.toLowerCase() ||
        user.roles[0].name.toLowerCase() === UserRole.Patient.toLowerCase();

      this.roleControl.setValue(roleId, { emitEvent: false });
      this.userForm.get('role')?.setValue(roleId, { emitEvent: false });

      if (shouldhaveDepartment) {
        this.department.setValue('NA', { emitEvent: false });
        this.department.disable({ emitEvent: false });
      } else {
        this.department.setValue(user?.department ?? '', { emitEvent: false });
        this.department.enable({ emitEvent: false });
      }
    }

    this.changeDetectionRef.markForCheck();
  }

  public actionsToggle(): void {
    this.actionsModalOpen = !this.actionsModalOpen;
  }

  public selectUser(user: User): void {
    this.selectedUser = user;
  }

  public toggleUserModal(userId: number, event: Event): void {
    event.stopPropagation();
    this.openModalUserId = this.openModalUserId === userId ? null : userId;
  }

  public isLastOrSecondToLast(index: number): boolean {
    const displayedUsers = this.allUsers().length;
    return index >= displayedUsers - 2;
  }

  public handleUserSave(): void {
    this.creating.set(true);
    if (this.userForm.invalid) {
      this.showFormErrorToast();
      return;
    }

    const formValues = this.userForm.value;
    const shouldhaveDepartment = this.checkIfShouldHaveDepartment();
    const newUser = this.createUserObject(formValues, shouldhaveDepartment);

    if (this.showEditModal && this.userPendingAction) {
      this.updateExistingUser(newUser);
    } else {
      this.createNewUser(formValues, shouldhaveDepartment);
    }
  }

  private showFormErrorToast(): void {
    this.toast.show(
      toastNotifications.faildOperations.create,
      toastNotifications.status.error as ToastStatus,
      'Please fill in all required fields correctly.',
    );
    this.creating.set(false);
  }

  private checkIfShouldHaveDepartment(): boolean {
    const selectedRole = this.roles().find((role) => role.id === this.roleControl.value);
    return (
      selectedRole?.name.toLowerCase() === UserRole.Admin.toLowerCase() ||
      selectedRole?.name.toLowerCase() === UserRole.Patient.toLowerCase()
    );
  }

  private createUserObject(formValues: User, shouldhaveDepartment: boolean): Partial<User> {
    return {
      ...(formValues.firstName && { firstName: formValues.firstName }),
      ...(formValues.lastName && { lastName: formValues.lastName }),
      ...(formValues.email && { email: formValues.email }),
      ...(this.roleControl.value && { roles: [this.roleControl.value] }),
      ...(formValues && {
        department: shouldhaveDepartment ? 'NA' : (formValues.department ?? ''),
      }),
    };
  }

  private updateExistingUser(userData: Partial<User>): void {
    this.userService.updateUser(this.userPendingAction!.id!, userData as User).subscribe({
      next: () => this.handleUpdateSuccess(),
      error: () => this.handleUpdateError(),
    });
  }

  private handleUpdateSuccess(): void {
    this.showEditModal = false;
    this.userPendingAction = null;
    this.resetFormControls();
    this.getUsers();
    this.toast.show(
      toastNotifications.operations.update,
      toastNotifications.status.success as ToastStatus,
      toastNotifications.messages.credentialChange,
    );
    this.creating.set(false);
    this.isDepartmentRequired.set(false);
  }

  private handleUpdateError(): void {
    this.toast.show(
      toastNotifications.faildOperations.update,
      toastNotifications.status.error as ToastStatus,
      toastNotifications.messages.retry,
    );
    this.creating.set(false);
  }

  private createNewUser(formValues: User, shouldhaveDepartment: boolean): void {
    const userData: User = {
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      email: formValues.email,
      roles: this.roleControl.value ? [this.roleControl.value] : [],
      department: shouldhaveDepartment ? 'NA' : (formValues.department ?? ''),
    };

    this.userService.createUser(userData).subscribe({
      next: (response) => this.handleCreateSuccess(response),
      error: () => this.handleCreateError(),
    });
  }

  private handleCreateSuccess(response: UserDataResponse): void {
    this.resetFormControls();
    this.getUsers();
    this.toast.show(
      toastNotifications.operations.create,
      toastNotifications.status.success as ToastStatus,
      response.message,
    );
    this.creating.set(false);
    this.isDepartmentRequired.set(false);
  }

  private handleCreateError(): void {
    this.toast.show(
      toastNotifications.faildOperations.create,
      toastNotifications.status.error as ToastStatus,
      toastNotifications.messages.retry,
    );
    this.creating.set(false);
  }

  public resetFormControls(): void {
    if (this.userForm) {
      this.userForm.reset();
      this.roleControl.reset();
    }
  }

  public editUser(user: User, event: Event): void {
    event.stopPropagation();
    this.userPendingAction = user;
    this.showEditModal = true;
    this.initializeForm(user);
  }

  public toggleUserAction(user: User, event: Event, action: 'toggle-status' | 'delete'): void {
    event.stopPropagation();
    this.userPendingAction = user;
    this.confirmationAction = action;
    this.showConfirmationModal = true;
  }

  public deleteUser(user: User): void {
    this.updating.set(true);

    this.userService.deleteUser(user.id as number).subscribe({
      next: () => {
        this.toast.show(
          toastNotifications.operations.delete,
          toastNotifications.status.success as ToastStatus,
          toastNotifications.operations.delete,
        );
        this.closeCreateUpdateModal();
        this.updating.set(false);
        this.getUsers();
      },
      error: () => {
        this.toast.show(
          toastNotifications.faildOperations.delete,
          toastNotifications.status.error as ToastStatus,
          toastNotifications.messages.retry,
        );
        this.updating.set(false);
      },
    });
  }

  public updateUserStatus(user: User): void {
    this.updating.set(true);

    this.userService.toggleStatus(user.id as number).subscribe({
      next: () => {
        this.getUsers();
        this.toast.show(
          toastNotifications.operations.update,
          toastNotifications.status.success as ToastStatus,
          toastNotifications.operations.update,
        );
        this.getUsers();
        this.closeCreateUpdateModal();
        if (this.userPendingAction) {
          this.userPendingAction.active = !this.userPendingAction.active || false;
        }
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

  public confirmAction(): void {
    if (!this.userPendingAction || !this.confirmationAction) return;

    if (this.confirmationAction === 'toggle-status') {
      this.updateUserStatus(this.userPendingAction);
    } else if (this.confirmationAction === 'delete') {
      this.deleteUser(this.userPendingAction);
    }
  }

  public closeCreateUpdateModal(): void {
    this.showEditModal = false;
    this.showAddUserModal = false;
    this.confirmationAction = null;
    this.userPendingAction = null;
    this.openModalUserId = null;
    this.showConfirmationModal = false;
    this.resetFormControls();
    this.loading.set(false);
  }

  public closeConfirmationModal(): void {
    this.showConfirmationModal = false;
    this.confirmationAction = null;
    this.userPendingAction = null;
    this.updating.set(false);
  }

  public onSortSelected(name: string, value: string | boolean): void {
    this.currentPage.set(0);
    if (name === 'role') {
      this.selectedRole = typeof value === 'string' ? value : null;
    } else if (name === 'department') {
      this.selectedDepartment = typeof value === 'string' ? value : null;
    } else if (name === 'active') {
      this.selectedActive = value;
    }
    this.getUsers();
  }

  public getUsers(): void {
    this.fetching.set(true);
    this.allUsers.set([]);
    this.totalRecords.set(0);
    this.numOfPages.set(1);
    const queryParams: Record<string, string | number | boolean> = {
      page: this.currentPage(),
      size: this.itemsPerPage,
    };
    if (this.selectedRole) {
      queryParams['role'] = this.selectedRole;
    }
    if (this.selectedDepartment) {
      queryParams['department'] = this.selectedDepartment;
    }
    if (
      this.selectedActive !== undefined &&
      this.selectedActive !== 'all' &&
      this.selectedActive !== null
    ) {
      queryParams['active'] = this.selectedActive;
    }

    if (this.searchTerm.value) {
      queryParams['search'] = this.searchTerm.value;
    }
    this.userService.getUsers(queryParams).subscribe({
      next: (response) => {
        this.allUsers.set(response.content);
        this.totalRecords.set(response.totalElements);
        this.numOfPages.set(response.totalPages);
        this.fetching.set(false);
      },
      error: () => {
        this.fetching.set(false);
      },
    });
  }

  public fetchRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (response) => {
        this.roles.set(response.data);
      },
      error: (error) => {
        return error;
      },
    });
  }

  public ngOnInit(): void {
    this.initializeForm();
    this.fetchRoles();
    this.getUsers();

    this.searchTerm.valueChanges.subscribe(() => {
      this.currentPage.set(0);
      this.getUsers();
    });
  }
}
