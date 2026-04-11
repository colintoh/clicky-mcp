import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ClickyClient } from '../clicky-client.js';
import { buildDateParam, CLICKY_DATE_KEYWORDS, DateInput } from '../date-utils.js';

export const getActionsTool: Tool = {
  name: 'get_actions',
  description:
    'Get total pageviews/actions for a date range. Provide EITHER start_date+end_date OR date_range.',
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
        description: 'Optional limit for results (max 1000)',
      },
    },
  },
};

export async function handleGetActions(
  args: DateInput & { limit?: number },
  clickyClient: ClickyClient
) {
  const date = buildDateParam(args);
  const data = await clickyClient.getActions(date, args.limit);
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}
