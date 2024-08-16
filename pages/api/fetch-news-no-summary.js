import axios from 'axios';
import * as cheerio from 'cheerio';

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
        // If using a proxy, it would be included here.
        // proxy: {
        //     host: 'proxy.example.com',
        //     port: 8080
        // }
    };

    try {
        const { data } = await axios.get(`https://news.google.com/search?q=${encodedString}`, AXIOS_OPTIONS);

        const $ = cheerio.load(data);

        // Fetch only the top 20 articles
        const allNewsInfo = await Promise.all(
            $('.IFHyqb')
                .slice(0, 10)
                .map(async (index, el) => {
                    const source = $(el).find('.MCAGUe').text().trim();
                    const parts = source.split(/\s+/).filter(part => part.trim() !== '');

                    if (parts[0] === 'Inc42') {
                        const link = new URL($(el).find('a.JtKRv').attr('href'), BASE_URL).href;

                        const urlObject = new URL(link);
                        const pathParts = urlObject.pathname.split('/');

                        // Replace 'read' with 'rss/articles'
                        if (pathParts[1] === 'read') {
                            pathParts[1] = 'rss/articles';
                        }
                        urlObject.pathname = pathParts.join('/');

                        // const title = $(el).find('.JtKRv').text().trim().replace('\n', '');
                        const title = $(el).find('.JtKRv').text().trim()
                        .replace(/\[update\]/i, '')  
                        .replace(/\[update\]\s*exclusive:/i, '')  
                        .replace(/Exclusive:/i, '')  
                        .trim();
                        const date = $(el).find('.hvbAAd').text().trim();

                        if (!searchString.toLowerCase().includes("updates inc42") &&
                            !title.toLowerCase().includes(searchString.toLowerCase())) {
                            return null; 
                        }

                        console.log("title: ", title);
                        console.log("date: ", date);

                        return {
                            title,
                            date,
                        };
                    }
                })
                .get()
                .filter(item => item !== undefined)
        ); // Filter out undefined results

        res.status(200).json(allNewsInfo);

    } catch (error) {
        console.error('Error fetching news:', error.message);
        res.status(500).json({ error: 'Error fetching news', details: error.message });
    }
}
