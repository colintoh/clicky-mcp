import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ClickyClient, DateRange } from '../clicky-client.js';

export const getTopPagesTool: Tool = {
  name: 'get_top_pages',
  description: 'Get top pages for a date range from Clicky analytics',
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
      },
      limit: {
        type: 'number',
        minimum: 1,
        maximum: 1000,
        description: 'Maximum number of pages to return (default: API default, max: 1000)'
      }
    },
    required: ['start_date', 'end_date']
  }
};

export async function handleGetTopPages(
  args: { start_date: string; end_date: string; limit?: number },
  clickyClient: ClickyClient
) {
  try {
    const dateRange: DateRange = {
      startDate: args.start_date,
      endDate: args.end_date
    };

    const data = await clickyClient.getTopPages(dateRange, args.limit);
    
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
          text: `Error fetching top pages: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
}