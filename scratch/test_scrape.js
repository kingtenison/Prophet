const cheerio = require('cheerio');

async function testScrape() {
  const query = 'Blue Bottle Coffee San Francisco official info';
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
    const html = await res.text();
    const $ = cheerio.load(html);
    const results = [];
    $('.result').each((i, el) => {
      results.push({
        title: $(el).find('.result__title').text().trim(),
        snippet: $(el).find('.result__snippet').text().trim(),
        url: $(el).find('.result__url').text().trim()
      });
    });
    console.log(JSON.stringify(results.slice(0, 3), null, 2));
  } catch (e) {
    console.error(e);
  }
}

testScrape();
