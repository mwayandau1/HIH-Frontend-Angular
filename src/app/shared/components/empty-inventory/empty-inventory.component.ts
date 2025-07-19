import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HeartOff, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-empty-inventory',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './empty-inventory.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyInventoryComponent {
  protected readonly icons = { HeartOff };
  public readonly title = input.required<string>();
}
