import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ClickyClient } from '../clicky-client.js';
import { buildDateParam, CLICKY_DATE_KEYWORDS, DateInput } from '../date-utils.js';

export const getSearchesTool: Tool = {
  name: 'get_searches',
  description:
    'Get top search terms that brought visitors to the site for a date range. Provide EITHER start_date+end_date OR date_range.',
  inputSchema: {
    type: 'object',
    properties: {
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
      limit: {
        type: 'number',
        minimum: 1,
        maximum: 1000,
        description: 'Maximum number of search terms to return (max 1000)',
      },
    },
  },
};

export async function handleGetSearches(
  args: DateInput & { limit?: number },
  clickyClient: ClickyClient
) {
  const date = buildDateParam(args);
  const data = await clickyClient.getSearches(date, args.limit);
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}
