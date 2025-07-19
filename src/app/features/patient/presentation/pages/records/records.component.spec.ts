import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecordsPageComponent } from './records.component';

describe('RecordsPageComponent', () => {
  let component: RecordsPageComponent;
  let fixture: ComponentFixture<RecordsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordsPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RecordsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });
});
