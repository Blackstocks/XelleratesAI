import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core'; // Ensure you're using puppeteer-core
import * as cheerio from 'cheerio';

export default async function handler(req, res) {

    const { query } = req;
    const searchString = query.q;

    console.log('query: ', searchString);

    if (!searchString) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    const encodedString = encodeURI(searchString);
    let browser;

    const url = 'https://www.business-standard.com/advance-search?keyword=zomato';
    try {
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath, // This is the key line to fix your issue
            headless: true,
            ignoreHTTPSErrors: true,
        });

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        const content = await page.content();
        const $ = cheerio.load(content);

        const articles = [];

        $('.cardlist').each((i, el) => {
            const title = $(el).find('a.smallcard-title').text().trim() || $(el).find('h3 a.smallcard-title').text().trim() || $(el).find('h4 a.smallcard-title').text().trim();
            const summary = $(el).find('.bookreview-title').text().trim();
            const date = $(el).find('.listingstyle_updtText__lnZb7 span').first().text().trim();
            const decodedUrl = "https://google.com";

            articles.push({ decodedUrl, title, date, summary });
        });

    console.log(articles);

    return articles;

    } catch (error) {
        console.error('Error fetching news:', error.message);
        res.status(500).json({ error: 'Error fetching news', details: error.message });
    } finally {
        if (browser) {
            await browser.close();
        }
    }


};

