import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Loader, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './loader.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent {
  protected readonly icons = { Loader };
}
