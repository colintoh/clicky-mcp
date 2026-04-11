import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ClickyClient } from '../clicky-client.js';
import { buildDateParam, CLICKY_DATE_KEYWORDS, DateInput } from '../date-utils.js';

export const getPageTrafficTool: Tool = {
  name: 'get_page_traffic',
  description:
    'Get traffic data for a specific page by filtering with its URL. Provide EITHER start_date+end_date OR date_range.',
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description:
          'Full URL or path of the page to get traffic for (e.g., https://example.com/path or /path)',
      },
      start_date: {
        type: 'string',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        description: 'Start date in YYYY-MM-DD format',
      },
      end_date: {
        type: 'string',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        description: 'End date in YYYY-MM-DD format',
      },
      date_range: {
        type: 'string',
        enum: [...CLICKY_DATE_KEYWORDS],
        description: 'Clicky relative date keyword (alternative to start_date+end_date)',
      },
    },
    required: ['url'],
  },
};

export async function handleGetPageTraffic(
  args: DateInput & { url: string },
  clickyClient: ClickyClient
) {
  const date = buildDateParam(args);
  const data = await clickyClient.getPageTraffic(args.url, date);
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}
