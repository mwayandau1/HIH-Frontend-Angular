import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  viewChild,
} from '@angular/core';
import { ToastService } from '@core/services/toast/toast.service';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements AfterViewInit {
  private readonly toastService = inject(ToastService);
  private readonly toast = viewChild(ToastComponent);

  ngAfterViewInit(): void {
    this.toastService.register(this.toast() as ToastComponent);
  }
}
