import { ChangeDetectionStrategy, Component } from '@angular/core';
import { footerIcons, hyperLinks } from '@shared/constants/footer';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  protected readonly icons = footerIcons;
  protected readonly links = hyperLinks;
}
