import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { HeaderComponent } from '@shared/components/header/header.component';
import { ChevronRight, LucideAngularModule } from 'lucide-angular';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sandwitch-layout',
  standalone: true,
  imports: [
    HeaderComponent,
    RouterOutlet,
    FooterComponent,
    LucideAngularModule,
    RouterLink,
    CommonModule,
  ],
  templateUrl: './sandwitch.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SandwitchLayoutComponent {
  protected readonly icons = { ChevronRight };
  private readonly router = inject(Router);

  public readonly currentUrl = signal<string>('patient');

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const segments = this.router.url.split('/');
      const pageName = segments[2]?.split('?')[0];
      this.currentUrl.set(pageName || 'patient');
    });
  }
}
