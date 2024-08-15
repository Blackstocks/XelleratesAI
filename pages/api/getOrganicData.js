import unirest from 'unirest';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  const { query } = req.query;

  console.log("query: ", query);

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const response = await unirest
      .get(`https://www.google.com/search?q=${encodeURIComponent(query)}&gl=us&hl=en`)
      .headers({
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36",
      });

    let $ = cheerio.load(response.body);
    let firstLink = null;

    const firstDiv = $(".MjjYud").first();
    firstLink = firstDiv.find("a").attr("href");

    res.status(200).json({ firstLink });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
