import { errorMessages } from './errors';

describe('errorMessages', () => {
  describe('minLength', () => {
    it('should return correct message for minimum length of 5', () => {
      const result = errorMessages.minLength(5);
      expect(result).toBe('Minimum length is 5 characters.');
    });

    it('should return correct message for minimum length of 1', () => {
      const result = errorMessages.minLength(1);
      expect(result).toBe('Minimum length is 1 characters.');
    });

    it('should return correct message for minimum length of 100', () => {
      const result = errorMessages.minLength(100);
      expect(result).toBe('Minimum length is 100 characters.');
    });

    it('should handle zero length requirement', () => {
      const result = errorMessages.minLength(0);
      expect(result).toBe('Minimum length is 0 characters.');
    });

    it('should handle negative numbers (though this should never happen in practice)', () => {
      const result = errorMessages.minLength(-5);
      expect(result).toBe('Minimum length is -5 characters.');
    });

    it('should return message with proper pluralization', () => {
      const resultSingle = errorMessages.minLength(1);
      const resultPlural = errorMessages.minLength(2);

      expect(resultSingle).toContain('1 characters');
      expect(resultPlural).toContain('2 characters');
    });
  });
});
