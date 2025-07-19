import { formatDate, getAgeFromDOB, formatTime } from './dates';
import { DatePipe } from '@angular/common';

const mockTransform = jest.fn();

jest.mock('@angular/common', () => ({
  DatePipe: jest.fn().mockImplementation(() => ({
    transform: mockTransform,
  })),
}));

const MockDatePipe = DatePipe as jest.MockedClass<typeof DatePipe>;

describe('formatDate', () => {
  beforeEach(() => {
    mockTransform.mockClear();
    MockDatePipe.mockClear();
  });

  it('should format valid date string correctly', () => {
    const mockDate = '2023-05-15T00:00:00';
    const expected = '2023-05-15';
    mockTransform.mockReturnValueOnce(expected);

    const result = formatDate(mockDate);

    expect(result).toBe(expected);
    expect(mockTransform).toHaveBeenCalledWith(mockDate, 'yyyy-MM-dd');
    expect(MockDatePipe).toHaveBeenCalledWith('en-US');
  });

  it('should return empty string when DatePipe returns null', () => {
    mockTransform.mockReturnValueOnce(null);

    const result = formatDate('invalid-date');

    expect(result).toBe('');
  });

  it('should handle empty input string', () => {
    mockTransform.mockReturnValueOnce(null);

    const result = formatDate('');

    expect(result).toBe('');
    expect(mockTransform).toHaveBeenCalledWith('', 'yyyy-MM-dd');
  });

  it('should use en-US locale', () => {
    formatDate('2023-01-01');

    expect(MockDatePipe).toHaveBeenCalledWith('en-US');
  });
});

describe('getAgeFromDOB', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2023-06-15'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should calculate age correctly when birthday has passed this year', () => {
    const dob = '1990-05-20';
    const age = getAgeFromDOB(dob);
    expect(age).toBe(33);
  });

  it('should calculate age correctly when birthday has not passed this year', () => {
    const dob = '1990-07-20';
    const age = getAgeFromDOB(dob);
    expect(age).toBe(32);
  });

  it('should calculate age correctly when birthday is today', () => {
    const dob = '1990-06-15';
    const age = getAgeFromDOB(dob);
    expect(age).toBe(33);
  });

  it('should calculate age correctly with Date object input', () => {
    const dob = new Date('1995-01-01');
    const age = getAgeFromDOB(dob);
    expect(age).toBe(28);
  });

  it('should handle leap year birthdays correctly', () => {
    const dob = '2000-02-29';
    const age = getAgeFromDOB(dob);
    expect(age).toBe(23);
  });

  it('should return 0 for a baby born this year', () => {
    const dob = '2023-01-01';
    const age = getAgeFromDOB(dob);
    expect(age).toBe(0);
  });

  it('should handle invalid date string by returning NaN', () => {
    const dob = 'invalid-date';
    const age = getAgeFromDOB(dob);
    expect(age).toBeNaN();
  });
});

describe('formatTime', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2023-06-15T14:30:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should format valid date string to time correctly', () => {
    const dateString = '2023-06-15T14:30:00';
    const result = formatTime(dateString);
    expect(result).toBe('2:30 PM');
  });

  it('should format time with single-digit hour correctly', () => {
    const dateString = '2023-06-15T09:05:00';
    const result = formatTime(dateString);
    expect(result).toBe('9:05 AM');
  });

  it('should format time at midnight correctly', () => {
    const dateString = '2023-06-15T00:00:00';
    const result = formatTime(dateString);
    expect(result).toBe('12:00 AM');
  });

  it('should format time at noon correctly', () => {
    const dateString = '2023-06-15T12:00:00';
    const result = formatTime(dateString);
    expect(result).toBe('12:00 PM');
  });

  it('should handle invalid date string by returning invalid time', () => {
    const dateString = 'invalid-date';
    const result = formatTime(dateString);
    expect(result).toBe('Invalid Date');
  });

  it('should handle empty date string by returning invalid time', () => {
    const dateString = '';
    const result = formatTime(dateString);
    expect(result).toBe('Invalid Date');
  });
});
