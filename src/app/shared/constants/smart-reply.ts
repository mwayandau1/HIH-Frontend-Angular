export const keywordResponses: Record<string, string[]> = {
  hello: [
    'Hello!',
    'Hi there!',
    'Hey! How are you?',
    'Hey! Nice to see you.',
    'Greetings!',
    'Hi! How can I help you today?',
  ],
  'how are you': [
    "I'm good, thanks!",
    'Doing well!',
    'Great! How about you?',
    'Feeling fantastic, you?',
    'Not bad! And you?',
  ],
  'thank you': ["You're welcome!", 'No problem!', 'My pleasure!', 'Happy to help!', 'Anytime!'],
  bye: ['Goodbye!', 'See you later!', 'Take care!', 'Bye for now!', 'Catch you later!'],
  '?': [
    'Yes',
    'No',
    'Maybe',
    'I think so',
    "I'm not sure",
    'Could be!',
    'Let me think about that...',
  ],
};

export const genericResponses = [
  'Got it, anything else?',
  'Cool, what’s next?',
  'Alright, let’s keep going!',
  'Interesting!',
  'Tell me more',
  'I see',
  'That makes sense',
  'Go on',
  'Really?',
  'And then what happened?',
  'Cool!',
  'I’d love to hear more',
  'Sounds intriguing',
];

interface ResponsePatterns {
  pattern: RegExp;
  responses: string[];
}

export const responsePatterns: ResponsePatterns[] = [
  {
    pattern: /(hi|hello|hey|hey there|hi ya)/i,
    responses: [
      'Hello!',
      'Hi there!',
      'Hey! How are you?',
      'Hi! What’s on your mind?',
      'Greetings! Ready to chat?',
    ],
  },
  {
    pattern: /(how are you|how're you|how's it going|how you doing)/i,
    responses: [
      "I'm good, thanks!",
      'Doing well!',
      'Great! How about you?',
      'Feeling fantastic, you?',
      'Pretty good! How’s your day?',
    ],
  },
  {
    pattern: /(thank you|thanks|thx|appreciate it)/i,
    responses: [
      "You're welcome!",
      'No problem!',
      'My pleasure!',
      'Happy to help!',
      'Glad I could assist!',
    ],
  },
  {
    pattern: /(bye|goodbye|see ya|catch you later)/i,
    responses: ['Goodbye!', 'See you later!', 'Take care!', 'Bye for now!', 'Have a great day!'],
  },
  {
    pattern: /\?$/,
    responses: [
      'Yes',
      'No',
      'Maybe',
      'I think so',
      "I'm not sure",
      'Could be!',
      'What do you think?',
    ],
  },
  {
    pattern: /(what|when|where|who|why|how)(?=\s|\?)/i,
    responses: [
      'Good question!',
      'I wonder about that too',
      'What do you think?',
      'Let’s explore that!',
      'Interesting point—tell me more!',
    ],
  },
  {
    pattern: /(sorry|apologize)/i,
    responses: ['No worries!', 'It’s okay!', 'Don’t mention it!', 'All good!', 'I forgive you!'],
  },
  {
    pattern: /(help|assist)/i,
    responses: [
      'Sure, how can I help?',
      'I’m here to assist!',
      'What do you need help with?',
      'Let me know how I can support you!',
      'Happy to lend a hand!',
    ],
  },
];
