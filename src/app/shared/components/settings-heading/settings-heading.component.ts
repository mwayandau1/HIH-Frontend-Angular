import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

@Component({
  selector: 'app-settings-heading',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './settings-heading.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsHeadingComponent {
  public readonly title = input.required<string>();
  public readonly description = input<string>();
  public readonly icon = input<LucideIconData>();
}
