const fetch = require('node-fetch');
const { parse } = require('node-html-parser');

const ECI_URL = 'https://results.eci.gov.in/ResultAcGenMay2026/partywiseresult-S25.htm';

// 🔁 Cache
let cache = null;
let lastFetchTime = 0;

function parseHTML(html) {
  const root = parse(html);
  const parties = [];

  const rows = root.querySelectorAll('table tr');

  for (const row of rows) {
    const cells = row.querySelectorAll('td');

    if (cells.length >= 4) {
      const party = cells[0]?.text?.trim();
      const won = parseInt(cells[1]?.text?.trim()) || 0;
      const leading = parseInt(cells[2]?.text?.trim()) || 0;
      const total = parseInt(cells[3]?.text?.trim()) || (won + leading);

      if (
        party &&
        party !== 'Party' &&
        party.toLowerCase() !== 'total' &&
        party.length > 2
      ) {
        parties.push({ party, won, leading, total });
      }
    }
  }

  const allText = root.text;
  const updatedMatch = allText.match(/Last Updated.*?(?=\n)/i);

  return {
    parties,
    lastUpdated: updatedMatch ? updatedMatch[0].trim() : '',
  };
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

// 🔥 Fetch using proxy (fixes Vercel 403)
async function fetchElectionData() {
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(ECI_URL)}`;

    const response = await fetch(proxyUrl);

    if (!response.ok) {
      throw new Error(`Proxy error ${response.status}`);
    }

    const html = await response.text();

    const { parties, lastUpdated } = parseHTML(html);

    if (parties.length > 0) {
      return {
        state: 'West Bengal',
        totalAC: 294,
        parties,
        lastUpdated,
        fetchedAt: new Date().toISOString(),
        source: 'live',
      };
    }
  } catch (err) {
    console.error('Fetch failed:', err.message);
  }

  // fallback
  return {
    state: 'West Bengal',
    totalAC: 294,
    parties: getFallbackData(),
    lastUpdated: 'Fallback (proxy failed)',
    fetchedAt: new Date().toISOString(),
    source: 'fallback',
  };
}

// ✅ Vercel API handler
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  const now = Date.now();

  // ⚡ 15 sec cache
  if (cache && now - lastFetchTime < 15000) {
    return res.status(200).json(cache);
  }

  const data = await fetchElectionData();

  cache = data;
  lastFetchTime = now;

  res.status(200).json(data);
};