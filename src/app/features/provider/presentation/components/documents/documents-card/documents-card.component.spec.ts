import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsCardComponent } from './documents-card.component';

describe('DocumentsCardComponent', () => {
  let component: DocumentsCardComponent;
  let fixture: ComponentFixture<DocumentsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentsCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
