import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ClickyClient } from '../clicky-client.js';
import { buildDateParam, CLICKY_DATE_KEYWORDS, DateInput } from '../date-utils.js';

export const getTrafficSourcesTool: Tool = {
  name: 'get_traffic_sources',
  description:
    'Get traffic sources breakdown from Clicky analytics. Optionally filter by specific page URL. Provide EITHER start_date+end_date OR date_range.',
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
      page_url: {
        type: 'string',
        description:
          'Optional: Full URL or path of the page to get traffic sources for (e.g., https://example.com/path or /path)',
      },
    },
  },
};

interface TrafficSourceItem {
  title?: string;
  value?: string;
  value_percent?: string;
}
interface TrafficSourceDate {
  date?: string;
  items?: TrafficSourceItem[];
}
interface TrafficSourceType {
  type?: string;
  dates?: TrafficSourceDate[];
}

function looksLikeTrafficSources(data: unknown): data is TrafficSourceType[] {
  return (
    Array.isArray(data) &&
    data.every(
      (d) =>
        d &&
        typeof d === 'object' &&
        Array.isArray((d as TrafficSourceType).dates)
    )
  );
}

export async function handleGetTrafficSources(
  args: DateInput & { page_url?: string },
  clickyClient: ClickyClient
) {
  const date = buildDateParam(args);
  const data = await clickyClient.getTrafficSources(date, args.page_url);

  if (!looksLikeTrafficSources(data)) {
    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
  }

  const cleanedData = data.map((typeData) => ({
    type: typeData.type,
    dates: (typeData.dates ?? []).map((dateData) => ({
      date: dateData.date,
      traffic_sources: (dateData.items ?? []).map((item) => ({
        source: item.title,
        visitors: parseInt(item.value ?? '0'),
        percentage: parseFloat(item.value_percent ?? '0'),
      })),
    })),
  }));

  return {
    content: [{ type: 'text', text: JSON.stringify(cleanedData, null, 2) }],
  };
}
