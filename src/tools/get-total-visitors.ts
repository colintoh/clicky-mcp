import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ClickyClient, DateRange } from '../clicky-client.js';

export const getTotalVisitorsTool: Tool = {
  name: 'get_total_visitors',
  description: 'Get total visitors for a date range from Clicky analytics',
  inputSchema: {
    type: 'object',
    properties: {
      start_date: {
        type: 'string',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        description: 'Start date in YYYY-MM-DD format'
      },
      end_date: {
        type: 'string',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        description: 'End date in YYYY-MM-DD format'
      }
    },
    required: ['start_date', 'end_date']
  }
};

export async function handleGetTotalVisitors(
  args: { start_date: string; end_date: string },
  clickyClient: ClickyClient
) {
  try {
    const dateRange: DateRange = {
      startDate: args.start_date,
      endDate: args.end_date
    };

    const data = await clickyClient.getTotalVisitors(dateRange);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2)
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error fetching total visitors: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
}