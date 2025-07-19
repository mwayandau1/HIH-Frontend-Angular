import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectUserProfile } from '@core/store';
import { PatientHomeCards } from '@shared/constants/patientHome';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  private readonly store = inject(Store);
  protected readonly user = this.store.selectSignal(selectUserProfile);
  protected readonly cards = signal(PatientHomeCards);
}
