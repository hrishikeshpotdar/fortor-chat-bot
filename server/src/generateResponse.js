
import natural from 'natural';
const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
const tokenizer = new natural.WordTokenizer();
// A simple function to get the sentiment of a message
function getSentiment(message) {
  return analyzer.getSentiment(tokenizer.tokenize(message));
}

function generateHumorousResponse(message) {
    const sentimentScore = getSentiment(message);
    
    const positiveResponses = [
      "Your optimism shines brighter than the sun!",
      "You're an absolute treasure, don't forget that.",
      "That's fantastic news, keep the positive vibes flowing!",
      "Your positive energy is infectious, spread it around!",
      "Bravo! Your hard work is truly paying off.",
      "You're like a breath of fresh air.",
      "Keep up the great work, you're on a roll!",
      "That's the spirit! Nothing can stop you now.",
      "Your enthusiasm is the spark we all need.",
      "You've made my day with such great news!"
    ];
  
    const negativeResponses = [
      "It's okay to not be okay, I'm here for you.",
      "Tough times never last, but tough people do.",
      "Remember, after the rain comes a rainbow.",
      "It's just a bad day, not a bad life.",
      "Let's find a silver lining in this cloud.",
      "Take a deep breath, it will get better.",
      "You're stronger than you think, hang in there.",
      "Every setback is a setup for a comeback.",
      "It's okay to feel down, let's talk it out.",
      "This too shall pass, stay strong."
    ];
  
    const neutralResponses = [
      "Hmm, that's quite interesting, tell me more.",
      "I'm intrigued, could you elaborate on that?",
      "Let's dive deeper into this topic.",
      "That's an interesting point of view.",
      "I wonder what led to that situation.",
      "Let's explore this idea together.",
      "There's a lot to unpack here, isn't there?",
      "I'm curious to hear more about your thoughts.",
      "That's a neutral stance, any further thoughts?",
      "It seems like there's more to this story."
    ];
  
    // Function to get a random response from an array
    const getRandomResponse = (responses) => responses[Math.floor(Math.random() * responses.length)];
  
    if (sentimentScore > 0) {
      return getRandomResponse(positiveResponses);
    } else if (sentimentScore < 0) {
      return getRandomResponse(negativeResponses);
    } else {
      return getRandomResponse(neutralResponses);
    }
  }

  function isQuestion(input) {
    // Tokenize the input
    const tokens = tokenizer.tokenize(input.toLowerCase());
  
    // Define common question words
    const questionWords = ['who', 'what', 'where', 'when', 'why', 'how'];
  
    // Check if the input ends with a question mark
    const endsWithQuestionMark = input.trim().endsWith('?');
  
    // Check if any token is a question word
    const containsQuestionWord = tokens.some(token => questionWords.includes(token));
  
    return endsWithQuestionMark || containsQuestionWord;
  }

  const greetingResponses = [
    "Hello! How can I assist you today?",
    "Hi there! What's on your mind?",
    "Hey! Ready for an adventure?",
    "Greetings! Let's solve some mysteries together.",
    "Good day! How can I make your day better?",
    "Hello, world! How can I help?",
    "Hi! Ask me anything, I'm here to help.",
    "Hey there! Feeling good today?",
    "Good to see you! What can I do for you?",
    "Hello! Let's chat about something exciting.",
    "Hi! Got any questions for me?",
    "Hey! Let's dive into your queries.",
    "Greetings! Ready to explore some answers?",
    "Good day! Seeking advice or just here to chat?",
    "Hi! Let's make today great together.",
    "Hello! I'm here to provide the answers you seek.",
    "Hey there! Let's make learning fun.",
    "Hi! How can I brighten your day?",
    "Greetings! What's the topic of the day?",
    "Hello! I'm your friendly neighborhood chatbot, how can I assist?"
];

const profanityResponses = [
  "I'm sorry, but I cannot process language that includes profanity.",
  "Let's keep our conversation respectful, please refrain from using offensive language.",
  "I'm here to help, but I need us to communicate without using profanity.",
  "Oops! It looks like your message contains words I'm not allowed to engage with.",
  "I value constructive conversation, so let's skip the swear words, shall we?",
  "I'm programmed to promote positive interactions, which means I can't respond to profane language.",
  "Language matters! Let's try to keep our dialogue clean and polite.",
  "I didn't catch that. Could you rephrase your sentence without using profanity?",
  "As a friendly chatbot, I encourage the use of language that would be appropriate for all audiences.",
  "My apologies, but I'm not equipped to respond to messages that contain swearing."
];

// Function to get a random response
function getProfanityResponse() {
  const index = Math.floor(Math.random() * profanityResponses.length);
  return profanityResponses[index];
}

// Function to get a random greeting response
function getRandomGreetingResponse() {
    const index = Math.floor(Math.random() * greetingResponses.length);
    return greetingResponses[index];
}

function isGreeting(message) {
    const input = message.toLowerCase();
    const tokens = tokenizer.tokenize(input);
    const greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'bro', 'buddy'];

    // Check for multi-word greetings first
    const multiWordGreetings = ['good morning', 'good afternoon', 'good evening'];
    const hasMultiWordGreeting = multiWordGreetings.some(greeting => input.includes(greeting));

    // Then check for single-word greetings
    const hasSingleWordGreeting = tokens.some(token => greetings.includes(token));

    return hasMultiWordGreeting || hasSingleWordGreeting;
}

  export { generateHumorousResponse, isQuestion, getRandomGreetingResponse, isGreeting, getProfanityResponse };