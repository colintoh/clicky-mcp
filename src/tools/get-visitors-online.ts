import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ClickyClient } from '../clicky-client.js';

export const getVisitorsOnlineTool: Tool = {
  name: 'get_visitors_online',
  description: 'Get the count and segmentation of visitors currently online (real-time).',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export async function handleGetVisitorsOnline(_args: unknown, clickyClient: ClickyClient) {
  const data = await clickyClient.getVisitorsOnline();
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}
