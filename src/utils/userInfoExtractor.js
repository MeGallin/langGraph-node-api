/**
 * Utility functions for extracting user information from messages
 */

/**
 * Extract user information from a message
 * @param {string} message - The user message to extract information from
 * @param {Object} currentUserInfo - The current user info object to update
 * @returns {Object} - Updated user info object
 */
const extractUserInfo = (message, currentUserInfo = {}) => {
  const userInfo = { ...currentUserInfo };

  // Extract all available information
  extractName(message, userInfo);
  extractRoomNumber(message, userInfo);
  extractDietaryPreferences(message, userInfo);
  extractMaintenanceIssues(message, userInfo);

  return userInfo;
};

/**
 * Extract user name from a message
 * @param {string} message - The user message to extract name from
 * @param {Object} userInfo - The user info object to update
 */
const extractName = (message, userInfo) => {
  if (!message) return;

  const messageLower = message.toLowerCase();

  if (
    messageLower.includes('my name is') ||
    messageLower.includes("i'm") ||
    messageLower.includes('i am')
  ) {
    // Basic name extraction logic
    const namePrefixes = ['my name is ', "i'm ", 'i am '];
    let extractedName = null;

    for (const prefix of namePrefixes) {
      if (messageLower.includes(prefix)) {
        const startIndex = messageLower.indexOf(prefix) + prefix.length;
        extractedName = message
          .slice(startIndex)
          .split('.')[0]
          .split(',')[0]
          .trim();
        break;
      }
    }

    if (extractedName) {
      userInfo.name = extractedName;
    }
  }
};

/**
 * Extract room number from a message
 * @param {string} message - The user message to extract room number from
 * @param {Object} userInfo - The user info object to update
 */
const extractRoomNumber = (message, userInfo) => {
  if (!message) return;

  // Track room number if mentioned
  const roomRegex = /room\s*(\d+)/i;
  const roomMatch = message.match(roomRegex);
  if (roomMatch && roomMatch[1]) {
    userInfo.roomNumber = roomMatch[1];
  } else if (/^(\d{1,4})$/.test(message.trim())) {
    // If the message is just a number, it's likely a room number
    userInfo.roomNumber = message.trim();
  }
};

/**
 * Extract dietary preferences from a message
 * @param {string} message - The user message to extract dietary preferences from
 * @param {Object} userInfo - The user info object to update
 */
const extractDietaryPreferences = (message, userInfo) => {
  if (!message) return;

  const messageLower = message.toLowerCase();

  // Track dietary preferences if mentioned
  const dietaryKeywords = {
    vegetarian: true,
    vegan: true,
    'gluten-free': true,
    'nut allergy': true,
    'dairy-free': true,
    'lactose intolerant': true,
    'shellfish allergy': true,
  };

  for (const [diet, _] of Object.entries(dietaryKeywords)) {
    if (messageLower.includes(diet)) {
      if (!userInfo.dietaryPreferences) {
        userInfo.dietaryPreferences = [];
      }
      if (!userInfo.dietaryPreferences.includes(diet)) {
        userInfo.dietaryPreferences.push(diet);
      }
    }
  }
};

/**
 * Extract maintenance issues from a message
 * @param {string} message - The user message to extract maintenance issues from
 * @param {Object} userInfo - The user info object to update
 */
const extractMaintenanceIssues = (message, userInfo) => {
  if (!message) return;

  const messageLower = message.toLowerCase();

  // Track maintenance issues
  const maintenanceIssues = {
    'air conditioning': 'HVAC',
    ac: 'HVAC',
    heating: 'HVAC',
    'hot water': 'Plumbing',
    water: 'Plumbing',
    toilet: 'Plumbing',
    sink: 'Plumbing',
    shower: 'Plumbing',
    leak: 'Plumbing',
    tv: 'Electronics',
    television: 'Electronics',
    remote: 'Electronics',
    wifi: 'Internet',
    internet: 'Internet',
    light: 'Electrical',
    power: 'Electrical',
    outlet: 'Electrical',
    cleaning: 'Housekeeping',
    towel: 'Housekeeping',
    bed: 'Housekeeping',
    sheet: 'Housekeeping',
    noise: 'Noise Complaint',
    door: 'Door/Lock',
    handle: 'Door/Lock',
    lock: 'Door/Lock',
    key: 'Door/Lock',
  };

  for (const [keyword, category] of Object.entries(maintenanceIssues)) {
    if (messageLower.includes(keyword)) {
      if (!userInfo.maintenanceIssues) {
        userInfo.maintenanceIssues = [];
      }

      // Add maintenance issue if it's not already tracked
      const issue = { category, keyword, reported: new Date().toISOString() };
      const alreadyTracked = userInfo.maintenanceIssues.some(
        (existingIssue) =>
          existingIssue.category === category &&
          existingIssue.keyword === keyword,
      );

      if (!alreadyTracked) {
        userInfo.maintenanceIssues.push(issue);
      }
    }
  }
};

module.exports = {
  extractUserInfo,
  extractName,
  extractRoomNumber,
  extractDietaryPreferences,
  extractMaintenanceIssues,
};
