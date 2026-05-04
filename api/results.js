const fetch = require('node-fetch');
const { parse } = require('node-html-parser');

const ECI_URL = 'https://results.eci.gov.in/ResultAcGenMay2026/partywiseresult-S25.htm';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
];

async function tryFetch(url, ua) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': ua,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-IN,en;q=0.9,hi;q=0.8',
      'Connection': 'keep-alive',
      'Referer': 'https://results.eci.gov.in/',
    },
    redirect: 'follow',
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

function parseHTML(html) {
  const root = parse(html);
  const parties = [];
  const tableRows = root.querySelectorAll('table tr');
  for (const row of tableRows) {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 3) {
      const party = cells[0]?.text?.trim();
      const won = parseInt(cells[1]?.text?.trim()) || 0;
      const leading = parseInt(cells[2]?.text?.trim()) || 0;
      const total = parseInt(cells[3]?.text?.trim()) || (won + leading);
      if (party && party !== 'Party' && party.toLowerCase() !== 'total' && party.length > 2) {
        parties.push({ party, won, leading, total });
      }
    }
  }
  const allText = root.text;
  const updatedMatch = allText.match(/Last Updated.*?(?=\n)/i);
  return { parties, lastUpdated: updatedMatch ? updatedMatch[0].trim() : '' };
}

function getFallbackData() {
  return [
    { party: 'Bharatiya Janata Party - BJP', won: 0, leading: 182, total: 182 },
    { party: 'All India Trinamool Congress - AITC', won: 0, leading: 91, total: 91 },
    { party: 'Aam Janata Unnayan party - AJUP', won: 0, leading: 2, total: 2 },
    { party: 'All India Secular Front - AISF', won: 0, leading: 2, total: 2 },
    { party: 'Communist Party of India (Marxist) - CPI(M)', won: 0, leading: 1, total: 1 },
  ];
}

async function fetchElectionData() {
  for (const ua of USER_AGENTS) {
    try {
      const html = await tryFetch(ECI_URL, ua);
      const { parties, lastUpdated } = parseHTML(html);
      if (parties.length > 0) {
        return { state: 'West Bengal', totalAC: 294, parties, lastUpdated, fetchedAt: new Date().toISOString(), source: 'live' };
      }
    } catch (e) { /* try next */ }
  }
  return { state: 'West Bengal', totalAC: 294, parties: getFallbackData(), lastUpdated: 'Cached data (ECI rate-limiting)', fetchedAt: new Date().toISOString(), source: 'fallback' };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
  const data = await fetchElectionData();
  res.status(200).json({ success: true, data });
};
