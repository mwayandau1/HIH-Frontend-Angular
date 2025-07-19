/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { TypingIndicatorComponent } from './typing-indicator.component';

describe('TypingIndicatorComponent', () => {
  let component: TypingIndicatorComponent;
  let fixture: ComponentFixture<TypingIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypingIndicatorComponent, CommonModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TypingIndicatorComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('Component Initialization', () => {
    it('should create the component successfully', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default empty Map for typingUsers', () => {
      expect(component.typingUsers()).toBeInstanceOf(Map);
      expect(component.typingUsers().size).toBe(0);
    });

    it('should be a standalone component', () => {
      const componentDef = (component.constructor as any).ɵcmp;
      expect(componentDef.standalone).toBe(true);
    });
  });

  describe('typingText getter - Happy Path', () => {
    it('should return empty string when no users are typing', () => {
      const emptyMap = new Map<string, boolean>();
      fixture.componentRef.setInput('typingUsers', emptyMap);
      fixture.detectChanges();

      expect(component.typingText).toBe('');
    });

    it('should return correct text for multiple users typing', () => {
      const typingMap = new Map<string, boolean>([
        ['user1', true],
        ['user2', true],
        ['user3', true],
      ]);
      fixture.componentRef.setInput('typingUsers', typingMap);
      fixture.detectChanges();

      expect(component.typingText).toBe('3 people are typing...');
    });

    it('should ignore users who are not typing', () => {
      const typingMap = new Map<string, boolean>([
        ['user1', true],
        ['user2', false],
        ['user3', true],
      ]);
      fixture.componentRef.setInput('typingUsers', typingMap);
      fixture.detectChanges();

      expect(component.typingText).toBe('2 people are typing...');
    });

    it('should handle mixed typing states correctly', () => {
      const typingMap = new Map<string, boolean>([
        ['alice', true],
        ['bob', false],
        ['charlie', true],
        ['david', false],
        ['eve', true],
      ]);
      fixture.componentRef.setInput('typingUsers', typingMap);
      fixture.detectChanges();

      expect(component.typingText).toBe('3 people are typing...');
    });

    it('should handle numeric user IDs as strings', () => {
      const typingMap = new Map<string, boolean>([
        ['123', true],
        ['456', true],
      ]);
      fixture.componentRef.setInput('typingUsers', typingMap);
      fixture.detectChanges();

      expect(component.typingText).toBe('2 people are typing...');
    });

    it('should handle exactly two users typing', () => {
      const typingMap = new Map<string, boolean>([
        ['user1', true],
        ['user2', true],
      ]);
      fixture.componentRef.setInput('typingUsers', typingMap);
      fixture.detectChanges();

      expect(component.typingText).toBe('2 people are typing...');
    });

    it('should handle large number of typing users', () => {
      const typingMap = new Map<string, boolean>();
      for (let i = 1; i <= 100; i++) {
        typingMap.set(`user${i}`, true);
      }
      fixture.componentRef.setInput('typingUsers', typingMap);
      fixture.detectChanges();

      expect(component.typingText).toBe('100 people are typing...');
    });

    it('should maintain order independence for multiple users', () => {
      const typingMap1 = new Map<string, boolean>([
        ['alice', true],
        ['bob', true],
        ['charlie', true],
      ]);
      fixture.componentRef.setInput('typingUsers', typingMap1);
      fixture.detectChanges();

      const result1 = component.typingText;

      const typingMap2 = new Map<string, boolean>([
        ['charlie', true],
        ['alice', true],
        ['bob', true],
      ]);
      fixture.componentRef.setInput('typingUsers', typingMap2);
      fixture.detectChanges();

      const result2 = component.typingText;

      expect(result1).toBe('3 people are typing...');
      expect(result2).toBe('3 people are typing...');
    });

    it('should handle Unicode characters in user IDs', () => {
      const typingMap = new Map<string, boolean>([
        ['用户1', true],
        ['пользователь2', true],
      ]);
      fixture.componentRef.setInput('typingUsers', typingMap);
      fixture.detectChanges();

      expect(component.typingText).toBe('2 people are typing...');
    });
  });

  describe('typingText getter - Edge Cases and Error Handling', () => {
    it('should handle empty string user IDs', () => {
      const typingMap = new Map<string, boolean>([
        ['', true],
        ['user1', true],
      ]);
      fixture.componentRef.setInput('typingUsers', typingMap);
      fixture.detectChanges();

      expect(component.typingText).toBe('2 people are typing...');
    });

    it('should handle null-like string user IDs', () => {
      const typingMap = new Map<string, boolean>([
        ['null', true],
        ['undefined', true],
      ]);
      fixture.componentRef.setInput('typingUsers', typingMap);
      fixture.detectChanges();

      expect(component.typingText).toBe('2 people are typing...');
    });

    it('should handle Map with only false values', () => {
      const typingMap = new Map<string, boolean>([
        ['user1', false],
        ['user2', false],
        ['user3', false],
      ]);
      fixture.componentRef.setInput('typingUsers', typingMap);
      fixture.detectChanges();

      expect(component.typingText).toBe('');
    });

    it('should handle user IDs with only whitespace', () => {
      const typingMap = new Map<string, boolean>([
        ['   ', true],
        ['\t\n', true],
      ]);
      fixture.componentRef.setInput('typingUsers', typingMap);
      fixture.detectChanges();

      expect(component.typingText).toBe('2 people are typing...');
    });

    it('should handle special boolean-like string values', () => {
      const typingMap = new Map<string, boolean>([
        ['true', true],
        ['false', true],
        ['0', false],
        ['1', true],
      ]);
      fixture.componentRef.setInput('typingUsers', typingMap);
      fixture.detectChanges();

      expect(component.typingText).toBe('3 people are typing...');
    });

    it('should handle extremely large Map with mixed values', () => {
      const typingMap = new Map<string, boolean>();
      for (let i = 0; i < 1000; i++) {
        typingMap.set(`user${i}`, i % 2 === 0);
      }
      fixture.componentRef.setInput('typingUsers', typingMap);
      fixture.detectChanges();

      expect(component.typingText).toBe('500 people are typing...');
    });

    it('should handle Map with non-boolean values cast to boolean', () => {
      const typingMap = new Map<string, boolean>();
      typingMap.set('user1', 'true' as any);
      typingMap.set('user2', 0 as any);
      typingMap.set('user3', 1 as any);
      typingMap.set('user4', '' as any);
      fixture.componentRef.setInput('typingUsers', typingMap);
      fixture.detectChanges();

      expect(component.typingText).toBe('2 people are typing...');
    });

    it('should return correct text when one user is typing', () => {
      const typingMap = new Map<string, boolean>([['user1', true]]);
      fixture.componentRef.setInput('typingUsers', typingMap);
      fixture.componentRef.setInput('name', 'Alice');
      fixture.detectChanges();

      expect(component.typingText).toBe('Alice is typing...');
    });
  });
});
