//const cheerio = require('cheerio');
import axios from 'axios';
import * as cheerio from 'cheerio';

//const cheerio = require('/node_modules/cheerio')

//const Cheerio = cheerio;



export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    const BASE_URL = 'https://news.google.com';
    const { query } = req;
    const searchString = query.q;

    if (!searchString) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    const encodedString = encodeURI(searchString);
    console.log('Encoded Query:', encodedString);

    const AXIOS_OPTIONS = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36',
        },
        params: {
            q: encodedString,
            tbm: 'nws',
            hl: 'en',
            gl: 'us',
        },
    };

    try {
        const { data } = await axios.get(`https://news.google.com/search?q=${encodedString}`);
        console.log('HTML Data:', data.substring(0, 1000)); // Log the first 1000 characters of the HTML to inspect

        if (typeof data !== 'string' || !data.includes('<html')) {
            throw new Error('Invalid HTML response');
        }
        

        const $ = cheerio.load(data);
        console.log('Cheerio Loaded Successfully');

        // Fetch only the top 20 articles
        const allNewsInfo = await Promise.all(
            $('.IFHyqb')
                .slice(0, 20)
                .map(async (index, el) => {
                    const source = $(el).find('.MCAGUe').text().trim();
                    const parts = source.split(/\s+/).filter(part => part.trim() !== '');

                    if (parts[0] === 'Inc42' || parts[0] === 'Business Standard') {
                        const link = new URL($(el).find('a.JtKRv').attr('href'), BASE_URL).href;
                        const title = $(el).find('.JtKRv').text().trim().replace('\n', '');
                        const date = $(el).find('.hvbAAd').text().trim();

                        // Fetch the summary from the article link
                        const summary = await fetchArticleSummary(link);

                        return {
                            link,
                            title,
                            date,
                            summary,
                        };
                    }
                })
                .get()
                .filter(item => item !== undefined)
        ); // Filter out undefined results

        console.log('All News Info with Summaries:', allNewsInfo); // Log final results
        res.status(200).json(allNewsInfo);

    } catch (error) {
        console.error('Error fetching news:', error.message);
        res.status(500).json({ error: 'Error fetching news', details: error.message });
    }
}


async function fetchArticleSummary(link) {
    try {
        const { data } = await axios.get(link);
        const $ = cheerio.load(data);

        // Extracting the div with class 'single-post-summary' that contains the word 'SUMMARY'
        const summaryDiv = $('.single-post-summary').filter((i, el) => {
            return $(el).find('span').text().trim().toUpperCase() === 'SUMMARY';
        });

        // Extracting the summary paragraphs within the identified div
        const summary = summaryDiv.find('p')
            .map((i, el) => $(el).text().trim())  // Loop through each <p> tag inside .single-post-summary
            .get()  // Get an array of the text contents
            .join(' ');  // Join all paragraphs together

        console.log(`Fetched summary from ${link}:`, summary);

        return summary || 'Summary not available';
    } catch (error) {
        console.error(`Error fetching summary from ${link}:`, error.message);
        return 'Summary not available';
    }
}


