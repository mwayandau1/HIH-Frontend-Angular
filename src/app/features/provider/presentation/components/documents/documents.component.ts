import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { DocumentsCardComponent } from './documents-card/documents-card.component';
import { CardSkelectonComponent } from './card-skelecton/card-skelecton.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DocumentsService } from '@core/services/documents/documents.service';
import { toastNotifications } from '@shared/constants/toast';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from '@core/services/toast/toast.service';
import { finalize } from 'rxjs';
import { Document } from '@shared/models';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, DocumentsCardComponent, CardSkelectonComponent, ReactiveFormsModule],
  templateUrl: './documents.component.html',
})
export class DocumentsComponent implements OnInit {
  public readonly documents = signal<Document[] | null>(null);
  private readonly documentsService = inject(DocumentsService);
  public fileControl = new FormControl(null);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastService);
  public readonly patientId = signal<string | null>(null);
  public loading = signal(false);
  public uploading = signal(false);

  constructor() {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((param) => {
      const id = param['id'];
      if (id) {
        this.patientId.set(id);
        this.getDocuments(id);
      } else {
        this.patientId.set(null);
        this.toast.show(
          toastNotifications.operations.fail,
          toastNotifications.status.error,
          toastNotifications.messages.invalidPateint,
        );
      }
    });
  }

  ngOnInit(): void {
    if (this.patientId()) {
      this.getDocuments(this.patientId()!);
    }
  }

  public onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files && files.length > 0) {
      const file = files[0];

      const fileName = file.name;
      const extension = fileName.split('.').pop()?.toLowerCase();

      if (extension) {
        this.handleFile(file, extension);
      } else {
        this.toast.show(
          toastNotifications.operations.fail,
          toastNotifications.status.error,
          toastNotifications.messages.invalidExtention,
        );
      }
      this.fileControl.setValue(null);
    }
  }

  public handleFile(file: File, extension: string): void {
    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
    if (!allowedExtensions.includes(extension)) {
      this.toast.show(
        toastNotifications.operations.fail,
        toastNotifications.status.error,
        `Unsupported file type: .${extension}. Allowed types: ${allowedExtensions.join(', ')}`,
      );
      return;
    }

    if (this.patientId()) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', extension);
      formData.append('patientId', this.patientId()!);

      this.uploadDocument(formData, this.patientId()!);
    } else {
      this.toast.show(
        toastNotifications.operations.fail,
        toastNotifications.status.error,
        toastNotifications.messages.invalidPateint,
      );
    }
  }

  public uploadDocument(data: FormData, id: string): void {
    this.uploading.set(true);

    this.documentsService
      .uploadDocument(data, id)
      .pipe(finalize(() => this.uploading.set(false)))
      .subscribe({
        next: () => {
          this.toast.show(
            toastNotifications.operations.success,
            toastNotifications.status.success,
            toastNotifications.messages.docLoad,
          );
          this.getDocuments(id);
        },
        error: () => {
          this.toast.show(
            toastNotifications.operations.fail,
            toastNotifications.status.error,
            toastNotifications.messages.docFailLoad,
          );
        },
      });
  }

  public getDocuments(id: string): void {
    this.loading.set(true);
    this.documentsService
      .getDocuments(id)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.documents.set(response);
        },
        error: () => {
          this.documents.set(null);
          this.toast.show(
            toastNotifications.operations.fail,
            toastNotifications.status.error,
            toastNotifications.messages.docFailLoad,
          );
        },
      });
  }
}
