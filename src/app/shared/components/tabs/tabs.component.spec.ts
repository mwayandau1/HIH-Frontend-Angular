import { Component } from '@angular/core';
import { render, screen, fireEvent } from '@testing-library/angular';
import { TabsComponent } from './tabs.component';
import { TabComponent } from '../tab/tab.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

@Component({
  standalone: true,
  template: '<p>Component A</p>',
})
class DummyAComponent {}

@Component({
  standalone: true,
  template: '<p>Component B</p>',
})
class DummyBComponent {}

describe('TabsComponent (via render)', () => {
  it('should render tab titles', async () => {
    await render(
      `<app-tabs>
        <app-tab title="Tab A"><app-dummy-a /></app-tab>
        <app-tab title="Tab B"><app-dummy-b /></app-tab>
      </app-tabs>`,
      {
        imports: [TabsComponent, TabComponent, DummyAComponent, DummyBComponent],
      },
    );

    expect(screen.getByText('Tab A')).toBeInTheDocument();
    expect(screen.getByText('Tab B')).toBeInTheDocument();
  });

  it('should render the content of the active tab', async () => {
    const { fixture } = await render(
      `<app-tabs>
        <app-tab title="Tab A"><app-dummy-a /></app-tab>
        <app-tab title="Tab B"><app-dummy-b /></app-tab>
      </app-tabs>`,
      {
        imports: [TabsComponent, TabComponent, DummyAComponent, DummyBComponent],
      },
    );

    const tabBButton = screen.getByRole('button', { name: 'Tab A' });
    fireEvent.click(tabBButton);

    fixture.detectChanges();
    await fixture.whenStable();

    const debugElement = fixture.debugElement;
    const dummyB = debugElement.query((e) => e.name === 'app-dummy-b');
    const dummyA = debugElement.query((e) => e.name === 'app-dummy-a');

    expect(dummyB).toBeNull();
    expect(dummyA).not.toBeNull();
  });

  it('should switch tabs and render the new content', async () => {
    const { fixture } = await render(
      `<app-tabs>
        <app-tab title="Tab A"><app-dummy-a /></app-tab>
        <app-tab title="Tab B"><app-dummy-b /></app-tab>
      </app-tabs>`,
      {
        imports: [TabsComponent, TabComponent, DummyAComponent, DummyBComponent],
      },
    );

    const tabBButton = screen.getByRole('button', { name: 'Tab B' });
    fireEvent.click(tabBButton);

    fixture.detectChanges();
    await fixture.whenStable();

    const debugElement = fixture.debugElement;
    const dummyA = debugElement.query((e) => e.name === 'app-dummy-a');
    const dummyB = debugElement.query((e) => e.name === 'app-dummy-b');

    expect(dummyA).toBeNull();
    expect(dummyB).not.toBeNull();
  });
});

describe('TabsComponent (unit - getCombinedClass)', () => {
  let component: TabsComponent;
  let fixture: ComponentFixture<TabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabsComponent, TabComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TabsComponent);
    component = fixture.componentInstance;

    const mockTabs = Array(3).fill({
      title: () => 'Mock Tab',
      setActive: jest.fn(),
    } as unknown as TabComponent);
    component['tabs'].set(mockTabs);
    component['tabsService'].setActiveTab(1);
  });

  it('should call getCombinedClass without error', () => {
    const result = component['getCombinedClass'](0);
    expect(result).toBeDefined();
  });

  it('should include active classes when index is active', () => {
    component['tabs'].set(
      Array(2).fill({
        title: () => 'Mock Tab',
        setActive: jest.fn(),
      } as unknown as TabComponent),
    );
    component['tabsService'].setActiveTab(1);
    fixture.componentRef.setInput('variant', 'primary');

    const result = component['getCombinedClass'](1);

    expect(result['bg-active-tab-bg']).toBe(true);
    expect(result['text-active-tab-text']).toBe(true);
  });

  it('should apply "w-auto px-2" when there are more than 5 tabs', () => {
    component['tabs'].set(
      Array(6).fill({
        title: () => 'Mock Tab',
        setActive: jest.fn(),
      } as unknown as TabComponent),
    );
    const result = component['getCombinedClass'](0);
    expect(result['w-auto px-2']).toBe(true);
  });

  it('should apply "w-1/4" when there are 4 tabs', () => {
    component['tabs'].set(
      Array(4).fill({
        title: () => 'Mock Tab',
        setActive: jest.fn(),
      } as unknown as TabComponent),
    );
    const result = component['getCombinedClass'](0);
    expect(result['w-1/4']).toBe(true);
  });

  it('should apply "w-1/5" when there are 5 tabs', () => {
    component['tabs'].set(
      Array(5).fill({
        title: () => 'Mock Tab',
        setActive: jest.fn(),
      } as unknown as TabComponent),
    );
    const result = component['getCombinedClass'](0);
    expect(result['w-1/5']).toBe(true);
  });

  it('should not include active classes when index is not active', () => {
    component['tabs'].set(
      Array(3).fill({
        title: () => 'Mock Tab',
        setActive: jest.fn(),
      } as unknown as TabComponent),
    );
    component['tabsService'].setActiveTab(2);
    const result = component['getCombinedClass'](0);
    expect(result['bg-active-tab-bg text-active-tab-text']).toBeFalsy();
  });
});

describe('TabsComponent (edge cases)', () => {
  let component: TabsComponent;
  let fixture: ComponentFixture<TabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabsComponent, TabComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TabsComponent);
    component = fixture.componentInstance;
  });

  it('should handle empty tabs gracefully', () => {
    component['tabs'].set([]);
    component['tabsService'].setActiveTab(0);
    fixture.componentRef.setInput('variant', 'primary');

    const classes = component['getCombinedClass'](0);

    expect(classes).toEqual({
      'w-1/2': false,
      'w-1/3': false,
      'w-1/4': false,
      'w-1/5': false,
      'w-auto px-2': false,
      'bg-active-tab-bg': true,
      'text-active-tab-text': true,
    });

    expect(() => component['updateActiveStates']()).not.toThrow();
  });

  it('should handle single tab correctly', () => {
    component['tabs'].set([
      {
        title: () => 'Mock Tab',
        setActive: jest.fn(),
      } as unknown as TabComponent,
    ]);
    const classes = component['getCombinedClass'](0);
    expect(classes['w-auto px-2']).toBe(true);
  });
});

describe('TabsComponent (updateActiveStates)', () => {
  let component: TabsComponent;
  let fixture: ComponentFixture<TabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabsComponent, TabComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TabsComponent);
    component = fixture.componentInstance;
  });

  it('should call setActive on each tab with correct value', () => {
    const mockTabs = [
      { title: () => 'Tab 1', setActive: jest.fn() },
      { title: () => 'Tab 2', setActive: jest.fn() },
      { title: () => 'Tab 3', setActive: jest.fn() },
    ] as unknown as TabComponent[];

    component['tabs'].set(mockTabs);
    component['tabsService'].setActiveTab(1);

    component['updateActiveStates']();

    expect(mockTabs[0]['setActive']).toHaveBeenCalledWith(false);
    expect(mockTabs[1]['setActive']).toHaveBeenCalledWith(true);
    expect(mockTabs[2]['setActive']).toHaveBeenCalledWith(false);
  });
});
