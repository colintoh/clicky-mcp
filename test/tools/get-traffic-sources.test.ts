import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { handleGetTrafficSources } from '../../src/tools/get-traffic-sources.js';
import type { ClickyClient } from '../../src/clicky-client.js';

function clientReturning(payload: unknown): ClickyClient {
  return {
    getTrafficSources: async () => payload,
  } as unknown as ClickyClient;
}

describe('handleGetTrafficSources', () => {
  it('cleans a well-formed Clicky response into the LLM-friendly shape', async () => {
    const payload = [
      {
        type: 'traffic-sources',
        dates: [
          {
            date: '2024-01-01,2024-01-31',
            items: [
              { title: 'Direct', value: '120', value_percent: '40.5' },
              { title: 'Google', value: '80', value_percent: '27.0' },
            ],
          },
        ],
      },
    ];
    const result = await handleGetTrafficSources(
      { date_range: 'last-30-days' },
      clientReturning(payload)
    );
    const parsed = JSON.parse(result.content[0].text);
    assert.deepEqual(parsed, [
      {
        type: 'traffic-sources',
        dates: [
          {
            date: '2024-01-01,2024-01-31',
            traffic_sources: [
              { source: 'Direct', visitors: 120, percentage: 40.5 },
              { source: 'Google', visitors: 80, percentage: 27.0 },
            ],
          },
        ],
      },
    ]);
  });

  it('returns the raw payload when Clicky responds with an error array', async () => {
    const payload = [{ error: 'Invalid sitekey.' }];
    const result = await handleGetTrafficSources(
      { date_range: 'last-7-days' },
      clientReturning(payload)
    );
    const parsed = JSON.parse(result.content[0].text);
    assert.deepEqual(parsed, payload);
  });

  it('returns the raw payload when the response is an unexpected object shape', async () => {
    const payload = { foo: 'bar' };
    const result = await handleGetTrafficSources(
      { date_range: 'last-7-days' },
      clientReturning(payload)
    );
    const parsed = JSON.parse(result.content[0].text);
    assert.deepEqual(parsed, payload);
  });

  it('does not crash on null items inside a date entry', async () => {
    const payload = [
      {
        type: 'traffic-sources',
        dates: [{ date: '2024-01-01,2024-01-02' }],
      },
    ];
    const result = await handleGetTrafficSources(
      { date_range: 'last-7-days' },
      clientReturning(payload)
    );
    const parsed = JSON.parse(result.content[0].text);
    assert.equal(parsed[0].dates[0].traffic_sources.length, 0);
  });
});
