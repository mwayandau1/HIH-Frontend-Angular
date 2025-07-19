import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyInboxComponent } from './empty-inbox.component';

describe('EmptyInboxComponent', () => {
  let component: EmptyInboxComponent;
  let fixture: ComponentFixture<EmptyInboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyInboxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyInboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render the component', () => {
    expect(component).toBeTruthy();
  });
});
