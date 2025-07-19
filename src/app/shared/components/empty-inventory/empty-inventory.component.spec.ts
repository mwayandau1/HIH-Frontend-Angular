import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyInventoryComponent } from './empty-inventory.component';

describe('EmptyInventoryComponent', () => {
  let component: EmptyInventoryComponent;
  let fixture: ComponentFixture<EmptyInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyInventoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyInventoryComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', '');
    fixture.detectChanges();
  });

  it('should render the component', () => {
    expect(component).toBeTruthy();
  });
});
