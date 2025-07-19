import { Component, input, output } from '@angular/core';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-image-preview',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './image-preview-modal.component.html',
})
export class ImagePreviewModalComponent {
  protected readonly icons = { X };
  public readonly imageUrl = input('');
  public readonly closeModal = output<void>();
}
