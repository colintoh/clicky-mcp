import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ClickyClient, DateRange } from '../clicky-client.js';

export const getTrafficSourcesTool: Tool = {
  name: 'get_traffic_sources',
  description: 'Get traffic sources breakdown from Clicky analytics. Optionally filter by specific page URL.',
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
      page_url: {
        type: 'string',
        description: 'Optional: Full URL or path of the page to get traffic sources for (e.g., https://example.com/path or /path)'
      }
    },
    required: ['start_date', 'end_date']
  }
};

export async function handleGetTrafficSources(
  args: { start_date: string; end_date: string; page_url?: string },
  clickyClient: ClickyClient
) {
  try {
    const dateRange: DateRange = {
      startDate: args.start_date,
      endDate: args.end_date
    };

    const data = await clickyClient.getTrafficSources(dateRange, args.page_url);

    // Transform the response to be LLM-friendly
    const cleanedData = data.map((typeData: any) => ({
      type: typeData.type,
      dates: typeData.dates.map((dateData: any) => ({
        date: dateData.date,
        traffic_sources: dateData.items.map((item: any) => ({
          source: item.title,
          visitors: parseInt(item.value),
          percentage: parseFloat(item.value_percent || '0')
        }))
      }))
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(cleanedData, null, 2)
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error fetching traffic sources: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
}