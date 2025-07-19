import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordSkelectonComponent } from './record-skelecton.component';

describe('RecordSkelectonComponent', () => {
  let component: RecordSkelectonComponent;
  let fixture: ComponentFixture<RecordSkelectonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordSkelectonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RecordSkelectonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
