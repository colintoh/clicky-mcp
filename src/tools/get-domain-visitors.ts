import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ClickyClient, DateRange } from '../clicky-client.js';

export const getDomainVisitorsTool: Tool = {
  name: 'get_domain_visitors',
  description: 'Get visitors filtered by domain from Clicky analytics with optional segmentation data',
  inputSchema: {
    type: 'object',
    properties: {
      domain: {
        type: 'string',
        description: 'Domain name to filter by (e.g., "facebook.com", "google.com")'
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
      },
      segments: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['pages', 'visitors']
        },
        description: 'Optional array of segments to include (pages, visitors). Defaults to visitors only. "visitors" gets the total number of visitors from the domain. "pages" get the list of pages and its visited count from the domain.'
      },
      limit: {
        type: 'number',
        minimum: 1,
        maximum: 1000,
        description: 'Optional limit for results (max 1000)'
      }
    },
    required: ['domain', 'start_date', 'end_date']
  }
};

export async function handleGetDomainVisitors(
  args: { domain: string; start_date: string; end_date: string; segments?: string[]; limit?: number },
  clickyClient: ClickyClient
) {
  try {
    const dateRange: DateRange = {
      startDate: args.start_date,
      endDate: args.end_date
    };

    const data = await clickyClient.getDomainVisitors(args.domain, dateRange, args.segments, args.limit);

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