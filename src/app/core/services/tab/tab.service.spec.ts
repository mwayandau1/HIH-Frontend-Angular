import { TestBed } from '@angular/core/testing';
import { TabsService } from './tab.service';

describe('TabsService', () => {
  let service: TabsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TabsService],
    });
    service = TestBed.inject(TabsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('activeTabIndex', () => {
    it('should initialize with 0', () => {
      expect(service.getActiveTab()()).toBe(0);
    });

    it('should update active tab index', () => {
      expect(service.getActiveTab()()).toBe(0);

      service.setActiveTab(2);
      expect(service.getActiveTab()()).toBe(2);

      service.setActiveTab(1);
      expect(service.getActiveTab()()).toBe(1);
    });

    it('should return a readonly signal', () => {
      const activeTabSignal = service.getActiveTab();

      expect(() => {
        // @ts-expect-error - testing readonly behavior
        activeTabSignal.set(1);
      }).toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle negative indices', () => {
      service.setActiveTab(-1);
      expect(service.getActiveTab()()).toBe(-1);
    });

    it('should handle decimal indices', () => {
      service.setActiveTab(1.5);
      expect(service.getActiveTab()()).toBe(1.5);
    });

    it('should handle very large numbers', () => {
      const largeNumber = Number.MAX_SAFE_INTEGER;
      service.setActiveTab(largeNumber);
      expect(service.getActiveTab()()).toBe(largeNumber);
    });
  });
});
