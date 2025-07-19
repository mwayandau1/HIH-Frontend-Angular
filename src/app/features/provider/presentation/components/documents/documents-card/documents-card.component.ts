import { Component, computed, input } from '@angular/core';
import { ButtonComponent } from '@shared/components';
import { Document } from '@shared/models';
import { formatDate } from '@shared/utils/helpers/dates';

@Component({
  selector: 'app-documents-card',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './documents-card.component.html',
})
export class DocumentsCardComponent {
  public document = input<Document>();
  public formattedDate = computed(() => {
    const doc = this.document();
    return doc?.uploadDate ? formatDate(Date.now().toString()) : '';
  });
}
