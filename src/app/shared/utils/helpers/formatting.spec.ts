import { formatWord, getInitials } from './formatting';

describe('formatWord', () => {
  it('should capitalize the first letter and lowercase the rest for a normal word', () => {
    expect(formatWord('hello')).toBe('Hello');
    expect(formatWord('WORLD')).toBe('World');
    expect(formatWord('tEsT')).toBe('Test');
  });

  it('should handle single-character strings', () => {
    expect(formatWord('a')).toBe('A');
    expect(formatWord('Z')).toBe('Z');
  });

  it('should handle empty string', () => {
    expect(formatWord('')).toBe('');
  });

  it('should handle null or undefined input', () => {
    expect(formatWord(null as unknown as string)).toBe('');
    expect(formatWord(undefined as unknown as string)).toBe('');
  });

  it('should handle strings with special characters', () => {
    expect(formatWord('héllo')).toBe('Héllo');
    expect(formatWord('$test')).toBe('$test');
    expect(formatWord('123word')).toBe('123word');
  });

  it('should handle strings with leading/trailing whitespace', () => {
    expect(formatWord(' hello ')).toBe(' hello ');
    expect(formatWord('\ttest\t')).toBe('\ttest\t');
  });

  it('should not change already properly formatted words', () => {
    expect(formatWord('Proper')).toBe('Proper');
    expect(formatWord('Correct')).toBe('Correct');
  });

  it('should properly format mixed case words', () => {
    expect(formatWord('mIxEdCaSe')).toBe('Mixedcase');
    expect(formatWord('jAVAsCRIPT')).toBe('Javascript');
  });
});

describe('getInitials', () => {
  it('should return uppercase initials for normal names', () => {
    expect(getInitials('John', 'Doe')).toBe('JD');
    expect(getInitials('mary', 'smith')).toBe('MS');
    expect(getInitials('ALICE', 'JOHNSON')).toBe('AJ');
  });

  it('should handle single-character names', () => {
    expect(getInitials('A', 'B')).toBe('AB');
    expect(getInitials('x', 'y')).toBe('XY');
  });

  it('should handle empty strings', () => {
    expect(() => getInitials('', 'Doe')).toThrow();
    expect(() => getInitials('John', '')).toThrow();
    expect(() => getInitials('', '')).toThrow();
  });

  it('should handle names with special characters', () => {
    expect(getInitials('Étienne', 'Dupont')).toBe('ÉD');
    expect(getInitials('Häns', 'Müller')).toBe('HM');
  });

  it('should handle names with leading/trailing whitespace', () => {
    expect(getInitials(' John ', ' Doe ')).toBe('JD');
    expect(getInitials('\tAlice\t', '\tSmith\t')).toBe('AS');
  });

  it('should throw error for null or undefined input', () => {
    expect(() => getInitials(null as unknown as string, 'Doe')).toThrow();
    expect(() => getInitials('John', undefined as unknown as string)).toThrow();
    expect(() => getInitials(null as unknown as string, null as unknown as string)).toThrow();
  });
});
