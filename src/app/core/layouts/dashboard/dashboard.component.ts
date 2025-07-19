import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { UserService } from '@core/services/user/user.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { adminDashboardNavigation, providerDashboardNavigation } from '@shared/constants/dashboard';
import { endpoints } from '@shared/constants/endpoints';
import { UserProfile } from '@shared/models';
import { UserRole } from '@shared/models/userRoles';
import { Bell, CircleUserRound, LogOut, LucideAngularModule } from 'lucide-angular';
import { filter } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [LucideAngularModule, RouterModule, ButtonComponent],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly endpoints = endpoints.pages;
  private readonly scrollContainerRef = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');
  protected readonly userInfo = signal<UserProfile | null>(null);
  protected userRole = signal<UserRole | null>(UserRole.Admin);
  protected readonly icons = { Bell, CircleUserRound, LogOut };
  protected readonly links = computed(() =>
    this.userRole() === UserRole.Admin ? adminDashboardNavigation : providerDashboardNavigation,
  );

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() =>
        this.scrollContainerRef()?.nativeElement.scrollTo({ top: 0, behavior: 'smooth' }),
      );

    this.userService.getUserInfo().subscribe((user) => this.userInfo.set(user.data));
    this.userRole.set(this.authService.getUserRole());
  }

  protected handleLogout(): void {
    this.authService.logout();
    this.router.navigate([this.endpoints.login]);
  }
}
