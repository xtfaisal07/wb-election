const express = require('express');
const path = require('path');
const cors = require('cors');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// 🔴 Global live data
let latestData = {
  updatedAt: null,
  parties: {}
};

// 🔴 Function to fetch & parse data
async function updateResults() {
  try {
    console.log("Fetching latest results...");

    const res = await fetch("https://results.eci.gov.in/"); // you will refine this URL
    const html = await res.text();

    const $ = cheerio.load(html);

    // ⚠️ You MUST adjust selectors based on actual HTML
    const data = {};

    // Example parsing (you will customize)
    $("table tr").each((i, el) => {
      const party = $(el).find("td:nth-child(1)").text().trim();
      const seats = $(el).find("td:nth-child(2)").text().trim();

      if (party) {
        data[party] = seats;
      }
    });

    latestData = {
      updatedAt: new Date(),
      parties: data
    };

    console.log("Updated:", latestData);

  } catch (err) {
    console.error("Error fetching:", err.message);
  }
}

// 🔁 Run every 30 seconds
setInterval(updateResults, 30000);

// Run once at start
updateResults();

// ✅ API endpoint
app.get('/api/results', (req, res) => {
  res.json(latestData);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🗳️ WB Election Dashboard running on port ${PORT}`);
});