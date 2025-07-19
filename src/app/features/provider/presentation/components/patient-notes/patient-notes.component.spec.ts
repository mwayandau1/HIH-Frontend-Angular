import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PatientNotesComponent } from './patient-notes.component';
import { PatientService } from '@core/services/patient/patient.service';
import { ToastService } from '@core/services/toast/toast.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { toastNotifications } from '@shared/constants/toast';
import { InputComponent } from '@shared/components/input/input.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DatePipe } from '@angular/common';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { LucideAngularModule } from 'lucide-angular';

describe('PatientNotesComponent', () => {
  let component: PatientNotesComponent;
  let fixture: ComponentFixture<PatientNotesComponent>;
  let mockPatientService: Partial<PatientService>;
  let mockToastService: Partial<ToastService>;

  beforeEach(async () => {
    mockPatientService = {
      getPatientNotes: jest.fn().mockReturnValue(
        of({
          data: { content: [] },
        }),
      ),
      postPatientNotes: jest.fn().mockReturnValue(of({})),
    };

    mockToastService = {
      show: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        LucideAngularModule,
        InputComponent,
        ButtonComponent,
        LoaderComponent,
        PatientNotesComponent,
      ],
      providers: [
        DatePipe,
        FormBuilder,
        { provide: PatientService, useValue: mockPatientService },
        { provide: ToastService, useValue: mockToastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientNotesComponent);
    component = fixture.componentInstance;
  });

  describe('Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component['isFetchingNotes']()).toBe(false);
      expect(component['isPostingNotes']()).toBe(false);
      expect(component['patientNotes']()).toEqual([]);
      expect(component['noteForm']).toBeDefined();
    });
  });

  describe('Form Submission', () => {
    it('should not submit if form is invalid', () => {
      component['noteForm'].setValue({ title: '', note: '' });
      component['onSubmit']();

      expect(mockPatientService.postPatientNotes).not.toHaveBeenCalled();
      expect(component['isPostingNotes']()).toBe(false);
    });

    it('should submit valid form', fakeAsync(() => {
      const testTitle = 'Test Title';
      const testNote = 'This is a valid test note content';
      component['noteForm'].setValue({ title: testTitle, note: testNote });

      mockPatientService.postPatientNotes?.mockReturnValue(of({}));

      component['onSubmit']();
      tick();

      expect(mockPatientService.postPatientNotes).toHaveBeenCalledWith(testTitle, testNote);
      expect(component['isPostingNotes']()).toBe(false);
    }));

    it('should handle successful note submission', fakeAsync(() => {
      component['noteForm'].setValue({ title: 'Title', note: 'Valid note content' });
      mockPatientService.postPatientNotes?.mockReturnValue(of({}));

      component['onSubmit']();
      tick();

      expect(mockToastService.show).toHaveBeenCalledWith(
        toastNotifications.operations.send,
        toastNotifications.status.success,
        toastNotifications.messages.noteSuccess,
      );
      expect(component['noteForm'].value).toEqual({ title: null, note: null });
    }));

    it('should handle error during note submission', fakeAsync(() => {
      component['noteForm'].setValue({ title: 'Title', note: 'Valid note content' });
      mockPatientService.postPatientNotes?.mockReturnValue(
        throwError(() => new Error('Failed to post')),
      );

      component['onSubmit']();
      tick();

      expect(mockToastService.show).toHaveBeenCalledWith(
        toastNotifications.operations.actionFail,
        toastNotifications.status.error,
      );
      expect(component['isPostingNotes']()).toBe(false);
    }));
  });

  describe('Form Validation', () => {
    it('should validate title min length', () => {
      const titleControl = component['noteForm'].get('title');
      titleControl?.setValue('ab');
      expect(titleControl?.valid).toBeFalsy();
      titleControl?.setValue('abc');
      expect(titleControl?.valid).toBeTruthy();
    });

    it('should validate note min length', () => {
      const noteControl = component['noteForm'].get('note');
      noteControl?.setValue('too short');
      expect(noteControl?.valid).toBeFalsy();
      noteControl?.setValue('this is long enough');
      expect(noteControl?.valid).toBeTruthy();
    });
  });
});
