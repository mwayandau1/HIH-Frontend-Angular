import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabComponent } from './tab.component';

describe('TabComponent', () => {
  let component: TabComponent;
  let fixture: ComponentFixture<TabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should update active state via setActive', async () => {
    expect(component.isActive()).toBe(false);

    component['setActive'](true);
    expect(component.isActive()).toBe(true);

    component['setActive'](false);
    expect(component.isActive()).toBe(false);
  });
});
