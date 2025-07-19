import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeartPulse, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-themed-loader',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './themed-loader.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemedLoaderComponent {
  protected readonly icons = { HeartPulse };
}
