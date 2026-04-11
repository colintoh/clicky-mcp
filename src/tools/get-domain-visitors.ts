import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ClickyClient } from '../clicky-client.js';
import { buildDateParam, CLICKY_DATE_KEYWORDS, DateInput } from '../date-utils.js';

export const getDomainVisitorsTool: Tool = {
  name: 'get_domain_visitors',
  description:
    'Get visitors filtered by domain from Clicky analytics with optional segmentation data. Provide EITHER start_date+end_date OR date_range.',
  inputSchema: {
    type: 'object',
    properties: {
      domain: {
        type: 'string',
        description: 'Domain name to filter by (e.g., "facebook.com", "google.com")',
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
      segments: {
        type: 'array',
        items: { type: 'string', enum: ['pages', 'visitors'] },
        description:
          'Optional segments. "visitors" gets total visitors from the domain; "pages" gets pages and visit counts. Defaults to ["visitors"].',
      },
      limit: {
        type: 'number',
        minimum: 1,
        maximum: 1000,
        description: 'Optional limit for results (max 1000)',
      },
    },
    required: ['domain'],
  },
};

export async function handleGetDomainVisitors(
  args: DateInput & { domain: string; segments?: string[]; limit?: number },
  clickyClient: ClickyClient
) {
  const date = buildDateParam(args);
  const data = await clickyClient.getDomainVisitors(args.domain, date, args.segments, args.limit);
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}
