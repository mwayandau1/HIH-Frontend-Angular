import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { VitalsRecordComponent } from './vitals-record.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('VitalsRecordComponent', () => {
  let component: VitalsRecordComponent;
  let fixture: ComponentFixture<VitalsRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VitalsRecordComponent, HttpClientTestingModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(VitalsRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
