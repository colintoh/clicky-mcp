import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ClickyClient, DateRange } from '../clicky-client.js';

export const getDomainVisitorsTool: Tool = {
  name: 'get_domain_visitors',
  description: 'Get visitors filtered by domain from Clicky analytics',
  inputSchema: {
    type: 'object',
    properties: {
      domain: {
        type: 'string',
        description: 'Domain name to filter by (e.g., "facebook", "google")'
      },
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
    required: ['domain', 'start_date', 'end_date']
  }
};

export async function handleGetDomainVisitors(
  args: { domain: string; start_date: string; end_date: string },
  clickyClient: ClickyClient
) {
  try {
    const dateRange: DateRange = {
      startDate: args.start_date,
      endDate: args.end_date
    };

    const data = await clickyClient.getDomainVisitors(args.domain, dateRange);

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
          text: `Error fetching domain visitors: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
}