const { createAgentTools } = require('../src/tools/agentTools');

describe('Agent Tools', () => {
  test('createAgentTools should return an array of tools', () => {
    const tools = createAgentTools();
    expect(Array.isArray(tools)).toBe(true);
    expect(tools.length).toBeGreaterThan(0);
  });

  test('get-current-time tool should return a date string', async () => {
    const tools = createAgentTools();
    const timeToolIndex = tools.findIndex(
      (tool) => tool.name === 'get-current-time',
    );
    expect(timeToolIndex).not.toBe(-1);

    const timeTool = tools[timeToolIndex];
    const result = await timeTool.func();
    expect(typeof result).toBe('string');
    // Verify it's a valid date string
    expect(new Date(result).toString()).not.toBe('Invalid Date');
  });

  test('remember-user-info tool should handle valid JSON', async () => {
    const tools = createAgentTools();
    const userInfoToolIndex = tools.findIndex(
      (tool) => tool.name === 'remember-user-info',
    );
    expect(userInfoToolIndex).not.toBe(-1);

    const userInfoTool = tools[userInfoToolIndex];
    const testUserInfo = JSON.stringify({ name: 'Test User', age: 30 });
    const result = await userInfoTool.func(testUserInfo);
    expect(result).toContain('Successfully stored user information');
    expect(result).toContain('Test User');
  });

  test('remember-user-info tool should handle invalid JSON', async () => {
    const tools = createAgentTools();
    const userInfoToolIndex = tools.findIndex(
      (tool) => tool.name === 'remember-user-info',
    );
    const userInfoTool = tools[userInfoToolIndex];

    const invalidJson = '{name: "Invalid JSON"}'; // Missing quotes around property name
    const result = await userInfoTool.func(invalidJson);
    expect(result).toContain('Failed to parse user information');
  });
});
