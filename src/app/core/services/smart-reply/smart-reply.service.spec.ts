/* eslint-disable @typescript-eslint/no-explicit-any */
import { SmartReplyService } from './smart-reply.service';
import {
  genericResponses,
  keywordResponses,
  responsePatterns,
} from '@shared/constants/smart-reply';

describe('SmartReplyService', () => {
  let service: SmartReplyService;

  beforeEach(() => {
    service = new SmartReplyService();
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('generateSmartReplies', () => {
    it('should return greetings when no message is provided', () => {
      const result = service.generateSmartReplies('');
      expect(result).toEqual(expect.arrayContaining(keywordResponses['hello']));
      expect(result.length).toBe(keywordResponses['hello'].length);
    });

    it('should return pattern-matched responses when message matches a pattern', () => {
      const testMessage = 'How are you doing today?';
      const result = service.generateSmartReplies(testMessage);
      const expectedPattern = responsePatterns.find((p) =>
        p.pattern.test(testMessage.toLowerCase()),
      );

      expect(expectedPattern?.responses).toEqual(expect.arrayContaining(result));
      expect(result.length).toBe(3);
    });

    it('should return keyword responses when message contains keywords but no pattern matches', () => {
      jest.spyOn(service, 'responsePatterns', 'get').mockReturnValue([]);
      const testMessage = 'I just wanted to say thank you!';
      const result = service.generateSmartReplies(testMessage);

      expect(result.length).toBe(3);
      result.forEach((response) => {
        expect(keywordResponses['thank you']).toContain(response);
      });
    });

    it('should prioritize pattern matches over keyword matches', () => {
      const testMessage = 'Hi there, thank you!';
      const result = service.generateSmartReplies(testMessage);
      const expectedPattern = responsePatterns.find((p) => p.pattern.test('hi'));

      expect(expectedPattern?.responses).toEqual(expect.arrayContaining(result));
      expect(result.length).toBe(3);
    });

    it('should return generic responses when no patterns or keywords match', () => {
      const testMessage = 'xysdfg randomtext123';
      const result = service.generateSmartReplies(testMessage);

      const allKeywordResponses = Object.values(keywordResponses).flat();
      result.forEach((response) => {
        expect(allKeywordResponses).not.toContain(response);
      });

      expect(genericResponses).toEqual(expect.arrayContaining(result));
      expect(result.length).toBe(3);
    });

    it('should handle case-insensitive matching', () => {
      const testMessage = 'HELLO THERE';
      const result = service.generateSmartReplies(testMessage);

      const expectedResponses = [
        'Hello!',
        'Hi there!',
        'Hey! How are you?',
        'Hi! What’s on your mind?',
        'Greetings! Ready to chat?',
      ];

      expect(result.length).toBe(3);
      expect(result).toEqual(
        expect.arrayContaining(['Hello!', 'Hi! What’s on your mind?', 'Hi there!']),
      );
      result.forEach((response) => {
        expect(expectedResponses).toContain(response);
      });
    });
  });

  describe('getGreetings', () => {
    it('should return hello keyword responses', () => {
      const result = (service as any).getGreetings();
      expect(result).toEqual(expect.arrayContaining(keywordResponses['hello']));
    });

    it('should return shuffled responses', () => {
      const original = [...keywordResponses['hello']];
      jest.spyOn(Math, 'random').mockReturnValue(0.7);

      const result = (service as any).getGreetings();
      expect(result).not.toEqual(original);
      expect(result.sort()).toEqual(original.sort());
    });
  });

  describe('shuffleArray', () => {
    it('should return an array with the same elements', () => {
      const testArray = ['a', 'b', 'c', 'd'];
      const result = (service as any).shuffleArray(testArray);

      expect(result.sort()).toEqual(testArray.sort());
    });

    it('should return a different order when shuffled', () => {
      const testArray = ['a', 'b', 'c', 'd', 'e'];
      jest
        .spyOn(Math, 'random')
        .mockReturnValueOnce(0.1)
        .mockReturnValueOnce(0.7)
        .mockReturnValueOnce(0.3);

      const result1 = (service as any).shuffleArray([...testArray]);
      const result2 = (service as any).shuffleArray([...testArray]);

      expect(result1).not.toEqual(result2);
    });

    it('should implement Fisher-Yates shuffle correctly', () => {
      const testArray = ['a', 'b', 'c'];
      const randomMock = jest
        .spyOn(Math, 'random')
        .mockReturnValueOnce(0.6)
        .mockReturnValueOnce(0.3);

      const result = (service as any).shuffleArray(testArray);

      expect(randomMock).toHaveBeenCalledTimes(2);
      expect(result).toEqual(['c', 'a', 'b']);
    });
  });
});
