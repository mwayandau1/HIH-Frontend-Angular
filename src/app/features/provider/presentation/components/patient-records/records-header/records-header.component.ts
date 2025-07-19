import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ChevronRight } from 'lucide-angular';

@Component({
  selector: 'app-records-header',
  standalone: true,
  imports: [LucideAngularModule, RouterModule],
  templateUrl: './records-header.component.html',
})
export class RecordsHeaderComponent {
  protected readonly icons = { ChevronRight };
  public page = input<string>('');
  public readonly patientId = input<string>('');
}
