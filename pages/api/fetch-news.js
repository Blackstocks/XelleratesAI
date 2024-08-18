import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    const { query } = req;
    const searchString = query.q

    if (!searchString) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    const encodedString = encodeURI(searchString);
    let url;
    if (searchString === 'category+startups'){
        url = `https://techcrunch.com/category/startups/`
    } else{
        url = `https://techcrunch.com/?s=${encodedString}`;
    }

    try {
        const AXIOS_OPTIONS = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36',
            },
        };

        const response = await axios.get(url, AXIOS_OPTIONS);
        const html = response.data;
        const $ = cheerio.load(html);

        const articles = [];

        const allNewsInfo = await Promise.all(
            $('li.wp-block-post')
                .slice(0, 20)
                .map(async (index, element) => {

                    const title = $(element).find('h2.wp-block-post-title a').text().trim();

                    // if (!searchString.toLowerCase().includes("category startups") &&
                    //         !title.toLowerCase().includes(searchString.toLowerCase())) {
                    //         return null; 
                    //     }

                    let date = $(element).find('time').text().trim();
                    const parts = date.split('•');
                    if (parts.length > 1) {
                        date = parts[1].trim();
                    }

                    const summary = [];
                    const articleLink = $(element).find('h2.wp-block-post-title a').attr('href');
                    const articleSummary = await fetchArticleSummary(articleLink);
                    summary.push(...articleSummary);

                    articles.push({ title, date, summary });
                    return {
                        title,
                        date,
                        summary,
                    };
                })
                .get()
                .filter(item => item !== null)
        );

        res.status(200).json(articles);
    } catch (error) {
        console.error('Error fetching news:', error.message);
        res.status(500).json({ error: 'Error fetching news', details: error.message });
    }
}

async function fetchArticleSummary(link) {
    try {
        const { data } = await axios.get(link);
        const $ = cheerio.load(data);

        // Extract the first two paragraphs from the article
        const paragraphs = [];
        $('.entry-content.wp-block-post-content p')
            .slice(0, 2)
            .each((i, el) => {
                paragraphs.push($(el).text().trim());
            });

        return paragraphs.length > 0 ? paragraphs : ['Summary not available'];
    } catch (error) {
        console.error(`Error fetching article from ${link}:`, error.message);
        return ['Summary not available'];
    }
}
