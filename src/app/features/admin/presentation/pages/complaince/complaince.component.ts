import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SettingsHeadingComponent } from '@shared/components/settings-heading/settings-heading.component';
import { regulations } from '@shared/constants/complaince';
import { InputComponent } from '@shared/components';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-complaince-page',
  standalone: true,
  imports: [SettingsHeadingComponent, CommonModule, InputComponent],
  templateUrl: './complaince.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComplaincePageComponent {
  protected readonly regulations = regulations;
  protected readonly accessExpiration = new FormControl('2', [Validators.pattern(/^\d+$/)]);
}
