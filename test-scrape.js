const cheerio = require('cheerio');

async function testScrape() {
  const url = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent('coffee shop new york official reviews');
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
  const html = await res.text();
  const $ = cheerio.load(html);
  const results = [];
  $('.result').each((i, el) => {
    if (i < 3) {
      results.push({
        title: $(el).find('.result__title').text().trim().replace(/\s+/g, ' '),
        snippet: $(el).find('.result__snippet').text().trim().replace(/\s+/g, ' '),
        link: $(el).find('.result__url').text().trim()
      });
    }
  });
  console.log(JSON.stringify(results, null, 2));
}
testScrape();
