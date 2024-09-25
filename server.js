const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

const apiKey = <your-NewRelic-API-Key-in-single-quotes>; // Replace with your New Relic Insights Query Key
const accountId = <your-account-ID-in-single-quotes>; // Use the New Relic account ID 
const query = `
  SELECT 
    average(cpuPercent) as 'CPU Usage', 
    average(memoryUsedBytes/memoryTotalBytes)*100 as 'Memory Usage',
    average(diskUsedBytes/diskTotalBytes)*100 as 'Storage Usage',
    rate(sum(receiveBytesPerSecond), 1 minute) as 'Receive Bytes Per Second',
    rate(sum(transmitBytesPerSecond), 1 minute) as 'Transmit Bytes Per Second',
    average(loadAverageOneMinute) as 'Load Average 1m',
    average(loadAverageFiveMinute) as 'Load Average 5m',
    average(loadAverageFifteenMinute) as 'Load Average 15m'
  FROM SystemSample, NetworkSample 
  SINCE 30 minutes ago
  TIMESERIES
`; // Query to get various metrics in the past 30 minutes

// Use CORS middleware
app.use(cors());

app.get('/newrelic', async (req, res) => {
  try {
    const fetch = await import('node-fetch');
    const response = await fetch.default(`https://insights-api.eu.newrelic.com/v1/accounts/${accountId}/query?nrql=${encodeURIComponent(query)}`, {
      headers: {
        'X-Query-Key': apiKey
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).send(`Error fetching data: ${error.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
