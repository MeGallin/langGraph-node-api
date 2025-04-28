const { ChatPromptTemplate } = require('@langchain/core/prompts');

// Define keyword categories with weights for better prioritization
// Higher weight keywords are more specific to a domain and should have higher priority
const KEYWORDS = {
  restaurant: {
    // High priority restaurant keywords (weight 3)
    menu: 3,
    food: 3,
    restaurant: 3,
    chef: 3,
    dish: 3,
    meal: 3,
    cuisine: 3,
    dining: 3,
    appetizer: 3,
    dessert: 3,

    // Medium priority restaurant keywords (weight 2)
    table: 2,
    dinner: 2,
    breakfast: 2,
    lunch: 2,
    eat: 2,
    reservation: 2,
    taste: 2,
    flavor: 2,
    special: 2,
    order: 2,

    // Low priority restaurant keywords (weight 1)
    drink: 1,
    beverage: 1,
    wine: 1,
    beer: 1,
    cocktail: 1,
    hungry: 1,
    serve: 1,
  },
  maintenance: {
    // High priority maintenance keywords (weight 3)
    broken: 3,
    repair: 3,
    maintenance: 3,
    fix: 3,
    leak: 3,
    'not working': 3,
    "isn't working": 3,
    heating: 3,
    ac: 3,
    'air conditioning': 3,

    // Medium priority maintenance keywords (weight 2)
    'issue with': 2,
    'problem with': 2,
    cold: 2,
    hot: 2,
    toilet: 2,
    shower: 2,
    sink: 2,
    drain: 2,
    clogged: 2,
    stuck: 2,

    // Low priority maintenance keywords (weight 1)
    noisy: 1,
    loud: 1,
    smell: 1,
    odor: 1,
    light: 1,
    bulb: 1,
    electricity: 1,
    power: 1,
    outlet: 1,
    tv: 1,
    remote: 1,
    wifi: 1,
    internet: 1,
    connection: 1,
  },
  reception: {
    // High priority reception keywords (weight 3)
    'check in': 3,
    'check out': 3,
    'front desk': 3,
    lobby: 3,
    concierge: 3,
    reservation: 3,
    book: 3,

    // Medium priority reception keywords (weight 2)
    key: 2,
    card: 2,
    baggage: 2,
    luggage: 2,
    stay: 2,
    night: 2,
    extend: 2,
    bill: 2,
    invoice: 2,
    payment: 2,

    // Low priority reception keywords (weight 1)
    room: 1, // Lower priority since it can be used in many contexts
    early: 1,
    late: 1,
    charge: 1,
    credit: 1,
    debit: 1,
    cash: 1,
    receipt: 1,
    welcome: 1,
    hello: 1,
    hi: 1,
    greetings: 1,
    assistance: 1,
    help: 1,
    information: 1,
    question: 1,
  },
};

// Topic change indicators
const TOPIC_CHANGE_INDICATORS = [
  'by the way',
  'also',
  'another thing',
  'different',
  'new',
  'change topic',
  'something else',
  'instead',
  'rather',
  'speaking of',
  'on another note',
  'changing the subject',
  'unrelated',
  'off topic',
  'can you',
  'what about',
  'tell me about',
];

// Domain-specific phrases that should always trigger a specific agent
const DOMAIN_SPECIFIC_PHRASES = {
  restaurant: [
    "what's on the menu",
    'what is on the menu',
    'food options',
    'restaurant hours',
    'make a reservation',
    'book a table',
    'dining options',
  ],
  maintenance: [
    'my room is',
    'fix my',
    'repair my',
    'not working',
    'broken',
    "isn't working",
    "isn't heating",
    'no hot water',
    'maintenance issue',
  ],
  reception: [
    'check in time',
    'check out time',
    'extend my stay',
    'book a room',
    'reservation details',
    'front desk',
  ],
};

/**
 * Create a condition node that determines which agent should handle a request
 * Uses a weighted keyword-based routing mechanism with improved context awareness
 * @returns {Function} - The condition node function
 */
const createConditionNode = () => {
  const conditionNode = async (state) => {
    const userMessage = (state.latestUserMessage || '').toLowerCase();
    const currentAgent = state.targetAgent;

    // First, check for domain-specific phrases that should always trigger a specific agent
    for (const [domain, phrases] of Object.entries(DOMAIN_SPECIFIC_PHRASES)) {
      for (const phrase of phrases) {
        if (userMessage.includes(phrase)) {
          console.log(
            `🎯 Domain-specific phrase detected: "${phrase}" for ${domain} agent`,
          );
          return {
            ...state,
            next: domain,
            targetAgent: domain,
          };
        }
      }
    }

    // Check if this is a topic change when we're in an ongoing conversation
    const isTopicChangeAttempt = currentAgent && isNewTopic(userMessage);

    // Calculate weighted scores for each category
    const scores = {
      restaurant: calculateWeightedScore(userMessage, KEYWORDS.restaurant),
      maintenance: calculateWeightedScore(userMessage, KEYWORDS.maintenance),
      reception: calculateWeightedScore(userMessage, KEYWORDS.reception),
    };

    // Count keyword matches for logging
    const matches = {
      restaurant: countKeywordMatches(
        userMessage,
        Object.keys(KEYWORDS.restaurant),
      ),
      maintenance: countKeywordMatches(
        userMessage,
        Object.keys(KEYWORDS.maintenance),
      ),
      reception: countKeywordMatches(
        userMessage,
        Object.keys(KEYWORDS.reception),
      ),
    };

    // Log the keyword matches and scores for debugging
    console.log(`🔍 Keyword matches: ${JSON.stringify(matches)}`);
    console.log(`🔢 Weighted scores: ${JSON.stringify(scores)}`);

    // Determine the best agent based on weighted scores
    let bestAgent = 'reception'; // Default
    let highestScore = scores.reception;

    if (scores.restaurant > highestScore) {
      bestAgent = 'restaurant';
      highestScore = scores.restaurant;
    }

    if (scores.maintenance > highestScore) {
      bestAgent = 'maintenance';
      highestScore = scores.maintenance;
    }

    // If we have a clear winner with a good score, route to that agent
    if (highestScore >= 3) {
      console.log(
        `🔄 Routing to ${
          bestAgent.charAt(0).toUpperCase() + bestAgent.slice(1)
        } Agent based on weighted score of ${highestScore}`,
      );
      return {
        ...state,
        next: bestAgent,
        targetAgent: bestAgent,
      };
    }

    // If we have a moderate score and it's different from the current agent, consider it a topic change
    if (highestScore >= 2 && currentAgent && bestAgent !== currentAgent) {
      console.log(
        `🔄 Topic change detected. Routing to ${
          bestAgent.charAt(0).toUpperCase() + bestAgent.slice(1)
        } Agent with score ${highestScore}`,
      );
      return {
        ...state,
        next: bestAgent,
        targetAgent: bestAgent,
      };
    }

    // If we have an explicit topic change indicator and any score, route to the new agent
    if (isTopicChangeAttempt && highestScore > 0) {
      console.log(
        `🔄 Explicit topic change detected. Routing to ${
          bestAgent.charAt(0).toUpperCase() + bestAgent.slice(1)
        } Agent`,
      );
      return {
        ...state,
        next: bestAgent,
        targetAgent: bestAgent,
      };
    }

    // If we're in an ongoing conversation and no clear topic change, continue with current agent
    if (currentAgent) {
      console.log(`🔄 Continuing conversation with ${currentAgent} Agent`);
      return {
        ...state,
        next: currentAgent,
      };
    }

    // If we have any score at all, route to that agent
    if (highestScore > 0) {
      console.log(
        `🔄 Routing to ${
          bestAgent.charAt(0).toUpperCase() + bestAgent.slice(1)
        } Agent based on score ${highestScore}`,
      );
      return {
        ...state,
        next: bestAgent,
        targetAgent: bestAgent,
      };
    }

    // Default to reception for new conversations with no clear keywords
    console.log(
      `🔄 Routing to Reception Agent (default) for message: "${state.latestUserMessage}"`,
    );
    return {
      ...state,
      next: 'reception',
      targetAgent: 'reception',
    };
  };

  return conditionNode;
};

/**
 * Calculate a weighted score for keyword matches in a message
 * @param {string} message - The message to check
 * @param {Object} weightedKeywords - Object with keywords as keys and weights as values
 * @returns {number} - The weighted score
 */
function calculateWeightedScore(message, weightedKeywords) {
  return Object.entries(weightedKeywords).reduce((score, [keyword, weight]) => {
    return message.includes(keyword) ? score + weight : score;
  }, 0);
}

/**
 * Count the number of keyword matches in a message (unweighted)
 * @param {string} message - The message to check
 * @param {Array<string>} keywords - The keywords to look for
 * @returns {number} - The number of matches
 */
function countKeywordMatches(message, keywords) {
  return keywords.reduce((count, keyword) => {
    return message.includes(keyword) ? count + 1 : count;
  }, 0);
}

/**
 * Determine if a message indicates a topic change
 * @param {string} message - User message to analyze
 * @returns {boolean} - Whether this is likely a new topic
 */
function isNewTopic(message) {
  // Short messages are likely responses to previous context, not new topics
  if (message.split(' ').length <= 3) {
    return false;
  }

  return TOPIC_CHANGE_INDICATORS.some((indicator) =>
    message.includes(indicator),
  );
}

module.exports = { createConditionNode };
