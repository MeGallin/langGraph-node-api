const { DynamicTool } = require('langchain/tools');

/**
 * Creates and returns a collection of tools for the agent to use
 * @returns {Array} Array of LangChain tool objects
 */
const createAgentTools = () => {
  return [
    new DynamicTool({
      name: 'get-current-time',
      description: 'Get the current time and date',
      func: async () => {
        const now = new Date();
        return now.toLocaleString();
      },
    }),

    new DynamicTool({
      name: 'remember-user-info',
      description: 'Store information about the user',
      func: async (input) => {
        try {
          const userInfo = JSON.parse(input);
          return `Successfully stored user information: ${JSON.stringify(
            userInfo,
          )}`;
        } catch (e) {
          return `Failed to parse user information: ${e.message}`;
        }
      },
    }),

    new DynamicTool({
      name: 'calculate',
      description: 'Perform a mathematical calculation',
      func: async (input) => {
        try {
          // Use Function constructor to safely evaluate mathematical expressions
          // This is safer than eval() but still needs to be used carefully
          const result = new Function(`return ${input}`)();
          return `Result: ${result}`;
        } catch (e) {
          return `Error performing calculation: ${e.message}`;
        }
      },
    }),

    new DynamicTool({
      name: 'finance-calculator',
      description:
        'Perform financial calculations like tax, tips, discounts, and interest calculations',
      func: async (input) => {
        console.log('Input for finance calculator:', input);
        try {
          let result;
          const params = JSON.parse(input);

          switch (params.operation) {
            case 'tax':
              // Calculate tax: amount * (taxRate / 100)
              result = params.amount * (params.taxRate / 100);
              return `Tax amount: ${result.toFixed(2)}. Total with tax: ${(
                params.amount + result
              ).toFixed(2)}`;

            case 'tip':
              // Calculate tip: amount * (tipPercentage / 100)
              result = params.amount * (params.tipPercentage / 100);
              return `Tip amount: ${result.toFixed(2)}. Total with tip: ${(
                params.amount + result
              ).toFixed(2)}`;

            case 'discount':
              // Calculate discount: amount * (discountPercentage / 100)
              result = params.amount * (params.discountPercentage / 100);
              return `Discount amount: ${result.toFixed(
                2,
              )}. Discounted total: ${(params.amount - result).toFixed(2)}`;

            case 'interest':
              // Calculate simple interest: principal * rate * time / 100
              result = (params.principal * params.rate * params.time) / 100;
              return `Interest amount: ${result.toFixed(
                2,
              )}. Total with interest: ${(params.principal + result).toFixed(
                2,
              )}`;

            case 'installment':
              // Calculate installment payment: total / numberOfPayments
              result = params.totalAmount / params.numberOfPayments;
              return `Monthly installment amount: ${result.toFixed(2)} for ${
                params.numberOfPayments
              } payments`;

            case 'currency-conversion':
              // Calculate currency conversion: amount * exchangeRate
              result = params.amount * params.exchangeRate;
              return `Converted amount: ${result.toFixed(2)} ${
                params.targetCurrency
              }`;

            default:
              // For custom calculations, use the generic calculator
              result = new Function(`return ${params.expression}`)();
              return `Result: ${result}`;
          }
        } catch (e) {
          return `Error performing financial calculation: ${e.message}. Please check your input format.`;
        }
      },
    }),

    new DynamicTool({
      name: 'format-date',
      description: 'Format a date string or timestamp into a readable format',
      func: async (input) => {
        try {
          const date = new Date(input);
          if (isNaN(date.getTime())) {
            return 'Invalid date input';
          }

          const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          };

          return date.toLocaleDateString('en-US', options);
        } catch (e) {
          return `Error formatting date: ${e.message}`;
        }
      },
    }),

    new DynamicTool({
      name: 'generate-confirmation-code',
      description:
        'Generate a random confirmation code for bookings or reservations',
      func: async (input) => {
        // Generate a random alphanumeric code
        const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like 0,O,1,I
        let code = '';
        const length = input ? parseInt(input) || 6 : 6; // Default to 6 characters if not specified

        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length);
          code += characters.charAt(randomIndex);
        }

        return `Confirmation code: ${code}`;
      },
    }),
  ];
};

module.exports = { createAgentTools };
