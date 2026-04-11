import { config } from 'dotenv';
config({ path: '.env' });

import { ClickyClient } from '../dist/clicky-client.js';
import { handleGetTotalVisitors } from '../dist/tools/get-total-visitors.js';
import { handleGetDomainVisitors } from '../dist/tools/get-domain-visitors.js';
import { handleGetTopPages } from '../dist/tools/get-top-pages.js';
import { handleGetTrafficSources } from '../dist/tools/get-traffic-sources.js';
import { handleGetPageTraffic } from '../dist/tools/get-page-traffic.js';
import { handleGetVisitorsOnline } from '../dist/tools/get-visitors-online.js';
import { handleGetActions } from '../dist/tools/get-actions.js';
import { handleGetBounceRate } from '../dist/tools/get-bounce-rate.js';
import { handleGetCountries } from '../dist/tools/get-countries.js';
import { handleGetSearches } from '../dist/tools/get-searches.js';
import { handleGetReferringDomains } from '../dist/tools/get-referring-domains.js';

const client = new ClickyClient({
  siteId: process.env.CLICKY_SITE_ID,
  siteKey: process.env.CLICKY_SITE_KEY,
});

let pass = 0;
let fail = 0;

async function expectThrow(name, fn, needle) {
  try {
    await fn();
    console.log(`FAIL ${name} — expected throw, got success`);
    fail++;
  } catch (e) {
    if (needle && !String(e.message).toLowerCase().includes(needle.toLowerCase())) {
      console.log(`FAIL ${name} — error didn't include "${needle}": ${e.message}`);
      fail++;
    } else {
      console.log(`PASS ${name} — ${e.message}`);
      pass++;
    }
  }
}

async function expectOk(name, fn) {
  try {
    const r = await fn();
    if (r?.isError) {
      console.log(`FAIL ${name} — isError: ${r.content?.[0]?.text?.slice(0, 200)}`);
      fail++;
      return null;
    }
    const txt = r?.content?.[0]?.text ?? '';
    console.log(`PASS ${name} — ${txt.slice(0, 120).replace(/\n/g, ' ')}…`);
    pass++;
    return r;
  } catch (e) {
    console.log(`FAIL ${name} — threw: ${e.message}`);
    fail++;
    return null;
  }
}

console.log('\n=== Date validation regressions ===');
await expectThrow(
  'invalid calendar date 2024-02-30',
  () => handleGetTotalVisitors({ start_date: '2024-02-30', end_date: '2024-03-01' }, client),
  'valid calendar'
);
await expectThrow(
  'reversed range',
  () => handleGetTotalVisitors({ start_date: '2024-03-01', end_date: '2024-01-01' }, client),
  'on or before'
);
await expectThrow(
  'range >31 days',
  () => handleGetTotalVisitors({ start_date: '2024-01-01', end_date: '2024-02-15' }, client),
  '31 days'
);
await expectThrow(
  'missing end_date',
  () => handleGetTotalVisitors({ start_date: '2024-01-01' }, client),
  'both start_date and end_date'
);
await expectThrow(
  'no params at all',
  () => handleGetTotalVisitors({}, client),
  'EITHER'
);
await expectThrow(
  'both explicit and keyword',
  () =>
    handleGetTotalVisitors(
      { start_date: '2024-01-01', end_date: '2024-01-02', date_range: 'today' },
      client
    ),
  'not both'
);
await expectThrow(
  'invalid keyword',
  () => handleGetTotalVisitors({ date_range: 'last-3-days' }, client),
  'Invalid date_range'
);

console.log('\n=== Happy path: existing tools ===');
await expectOk('get_total_visitors last-7-days', () =>
  handleGetTotalVisitors({ date_range: 'last-7-days' }, client)
);
await expectOk('get_top_pages last-7-days limit=5', () =>
  handleGetTopPages({ date_range: 'last-7-days', limit: 5 }, client)
);
await expectOk('get_traffic_sources last-7-days', () =>
  handleGetTrafficSources({ date_range: 'last-7-days' }, client)
);
await expectOk('get_domain_visitors google.com last-30-days', () =>
  handleGetDomainVisitors(
    { domain: 'google.com', date_range: 'last-30-days' },
    client
  )
);

console.log('\n=== Happy path: new tools ===');
await expectOk('get_visitors_online', () => handleGetVisitorsOnline({}, client));
await expectOk('get_actions yesterday', () =>
  handleGetActions({ date_range: 'yesterday' }, client)
);
await expectOk('get_bounce_rate yesterday', () =>
  handleGetBounceRate({ date_range: 'yesterday' }, client)
);
await expectOk('get_countries last-7-days limit=5', () =>
  handleGetCountries({ date_range: 'last-7-days', limit: 5 }, client)
);
await expectOk('get_searches last-7-days limit=5', () =>
  handleGetSearches({ date_range: 'last-7-days', limit: 5 }, client)
);
await expectOk('get_referring_domains last-7-days limit=5', () =>
  handleGetReferringDomains({ date_range: 'last-7-days', limit: 5 }, client)
);

console.log('\n=== Defensive transform: bad credentials ===');
const badClient = new ClickyClient({ siteId: '999', siteKey: 'bogus' });
await expectOk('get_traffic_sources with bad creds (should not crash)', () =>
  handleGetTrafficSources({ date_range: 'last-7-days' }, badClient)
);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
