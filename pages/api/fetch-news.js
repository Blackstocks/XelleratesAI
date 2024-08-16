import axios from 'axios';
import * as cheerio from 'cheerio';



const proxies = [
    { host: '83.148.75.16', port: 3128 },
    { host: '72.10.160.90', port: 19153 },
    { host: '91.202.230.219', port: 8080 },
    { host: '190.69.157.208', port: 999 },
    { host: '74.48.78.52', port: 80 },
    { host: '27.147.28.73', port: 8080 },
    { host: '178.128.232.123', port: 8080 },
    { host: '8.213.195.191', port: 8081 },
    { host: '107.181.154.54', port: 5732 },
    { host: '185.55.205.118', port: 8080 }
];


function getRandomProxy() {
    return proxies[Math.floor(Math.random() * proxies.length)];
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    const BASE_URL = 'https://news.google.com';
    const { query } = req;
    const searchString = query.q;

    console.log('query: ', searchString);

    if (!searchString) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    const encodedString = encodeURI(searchString);

    const proxy = getRandomProxy(); 

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
        const { data } = await axios.get(`https://news.google.com/search?q=${encodedString}`, AXIOS_OPTIONS);

        

        const $ = cheerio.load(data);

        // Fetch only the top 20 articles
        const allNewsInfo = await Promise.all(
            $('.IFHyqb')
                .slice(0, 20)
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
                        const newlink = urlObject.toString();

                        // const title = $(el).find('.JtKRv').text().trim().replace('\n', '');
                        const title = $(el).find('.JtKRv').text().trim()
                        .replace(/\[update\]/i, '')  
                        .replace(/\[update\]\s*exclusive:/i, '')  
                        .replace(/Exclusive:/i, '')  
                        .trim();
                        const date = $(el).find('.hvbAAd').text().trim();

                        // Fetch the summary from the article link with retries
                        const decodedUrl = await decodeGoogleNewsUrl(newlink);
                        const summary = await fetchArticleSummaryWithRetries(decodedUrl);

                        if (!searchString.toLowerCase().includes("updates inc42") &&
                            !title.toLowerCase().includes(searchString.toLowerCase())) {
                            return null; 
                        }

                        //console.log("title: ", title);
                        //console.log("url: ", decodedUrl);
                        //console.log("summary: ", summary);

                        return {
                            decodedUrl,
                            title,
                            date,
                            summary,
                        };
                    }
                })
                .get()
                .filter(item => item !== null)
        ); // Filter out undefined results

        console.log('allNewsInfo: ', allNewsInfo);

        res.status(200).json(allNewsInfo);

    } catch (error) {
        console.error('Error fetching news:', error.message);
        res.status(500).json({ error: 'Error fetching news', details: error.message });
    }
}

// import axios from 'axios';
// import { HttpProxyAgent } from 'http-proxy-agent';
// import { HttpsProxyAgent } from 'https-proxy-agent';
// import * as cheerio from 'cheerio';

// const proxies = [
//     { host: '89.135.59.65', port: 8090, username: '', password: '' }, // Example proxy
//     { host: '82.152.165.218', port: 20000, username: '', password: '' } // Another example proxy
// ];

// function getRandomProxy() {
//     return proxies[Math.floor(Math.random() * proxies.length)];
// }

// export default async function handler(req, res) {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

//     const BASE_URL = 'https://news.google.com';
//     const { query } = req;
//     const searchString = query.q;

//     if (!searchString) {
//         return res.status(400).json({ error: 'Search query is required' });
//     }

//     const encodedString = encodeURI(searchString);

//     const MAX_RETRIES = 3; // Define the maximum number of retries

//     for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
//         const proxy = getRandomProxy(); // Get a random proxy from the list

//         const proxyUrl = `http://df4b94bb61b0d53c989634f943d0e492a53ada15:@proxy.zenrows.com:8001`;
//         const httpAgent = new HttpProxyAgent(proxyUrl);
//         const httpsAgent = new HttpsProxyAgent(proxyUrl);

//         process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

//         const AXIOS_OPTIONS = {
//             url: `https://news.google.com/search?q=${encodedString}`,
//             httpAgent,
//             httpsAgent,
//             headers: {
//                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36',
//                 'x-rapidapi-key': '5f66497934mshba6534b53e60867p118027jsn3ef1f3c1bf41',
//                 'x-rapidapi-host': 'newscatcher-api-test.p.rapidapi.com',
//                 'X-RapidAPI-Key': '88ba2fd60amsh430b0222cedf4dap10e0a4jsn7662ba307e20'
//             },
//             method: 'GET'
//         };

//         try {
//             const { data } = await axios.request(AXIOS_OPTIONS);
//             const $ = cheerio.load(data);

//             // Fetch only the top 20 articles
//             const allNewsInfo = await Promise.all(
//                 $('.IFHyqb')
//                     .slice(0, 10)
//                     .map(async (index, el) => {
//                         const source = $(el).find('.MCAGUe').text().trim();
//                         const parts = source.split(/\s+/).filter(part => part.trim() !== '');

//                         if (parts[0] === 'Inc42') {
//                             const link = new URL($(el).find('a.JtKRv').attr('href'), BASE_URL).href;

//                             const urlObject = new URL(link);
//                             const pathParts = urlObject.pathname.split('/');

//                             // Replace 'read' with 'rss/articles'
//                             if (pathParts[1] === 'read') {
//                                 pathParts[1] = 'rss/articles';
//                             }
//                             urlObject.pathname = pathParts.join('/');
//                             const newlink = urlObject.toString();

//                             const title = $(el).find('.JtKRv').text().trim()
//                                 .replace(/\[update\]/i, '')
//                                 .replace(/\[update\]\s*exclusive:/i, '')
//                                 .replace(/Exclusive:/i, '')
//                                 .trim();
//                             const date = $(el).find('.hvbAAd').text().trim();

//                             // Fetch the summary from the article link with retries
//                             const decodedUrl = await decodeGoogleNewsUrl(newlink);
//                             const summary = "Not Available";

//                             return {
//                                 decodedUrl,
//                                 title,
//                                 date,
//                                 summary,
//                             };
//                         }
//                     })
//                     .get()
//                     .filter(item => item !== undefined)
//             );

//             res.status(200).json(allNewsInfo);
//             return; // Exit the loop and function after a successful request

//         } catch (error) {
//             console.error(`Attempt ${attempt + 1} failed: ${error.message}`);

//             if (attempt === MAX_RETRIES - 1) {
//                 // If it's the last attempt, send an error response
//                 res.status(500).json({ error: 'Error fetching news after multiple attempts', details: error.message });
//             }
//         }
//     }
// }

// Additional functions like decodeGoogleNewsUrl, fetchArticleSummary, fetchArticleSummaryWithRetries...






async function fetchDecodedBatchExecute(id) {
    const s = `[[["Fbv4je","[\\"garturlreq\\",[[\\"en-US\\",\\"US\\",[\\"FINANCE_TOP_INDICES\\",\\"WEB_TEST_1_0_0\\"],null,null,1,1,\\"US:en\\",null,180,null,null,null,null,null,0,null,null,[1608992183,723341000]],\\"en-US\\",\\"US\\",1,[2,3,4,8],1,0,\\"655000234\\",0,0,null,0],\\"${id}\\"]",null,"generic"]]]`;

    const headers = {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        "Referer": "https://news.google.com/",
    };

    const response = await axios.post(
        "https://news.google.com/_/DotsSplashUi/data/batchexecute?rpcids=Fbv4je",
        `f.req=${encodeURIComponent(s)}`,
        { headers }
    );

    if (response.status !== 200) {
        throw new Error("Failed to fetch data from Google.");
    }

    const text = response.data;
    const header = '[\\"garturlres\\",\\"';
    const footer = '\\",';

    if (!text.includes(header)) {
        throw new Error(`Header not found in response: ${text}`);
    }

    const start = text.split(header)[1];
    if (!start.includes(footer)) {
        throw new Error("Footer not found in response.");
    }

    const url = start.split(footer)[0];
    return url;
}

function decodeGoogleNewsUrl(sourceUrl) {
    const url = new URL(sourceUrl);
    const path = url.pathname.split("/");

    if (url.hostname === "news.google.com" && path.length > 1 && path[path.length - 2] === "articles") {
        const base64Str = path[path.length - 1];
        const decodedBytes = Buffer.from(base64Str, 'base64');
        let decodedStr = decodedBytes.toString('latin1');

        const prefix = "\x08\x13\x22";
        if (decodedStr.startsWith(prefix)) {
            decodedStr = decodedStr.slice(prefix.length);
        }

        const suffix = "\xd2\x01\x00";
        if (decodedStr.endsWith(suffix)) {
            decodedStr = decodedStr.slice(0, -suffix.length);
        }

        const length = decodedStr.charCodeAt(0);
        if (length >= 0x80) {
            decodedStr = decodedStr.slice(2, length + 1);
        } else {
            decodedStr = decodedStr.slice(1, length + 1);
        }

        if (decodedStr.startsWith("AU_yqL")) {
            return fetchDecodedBatchExecute(base64Str);
        }

        return decodedStr;
    } else {
        return sourceUrl;
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
        const summaryPoints = summaryDiv.find('p')
            .map((i, el) => $(el).text().trim())  // Loop through each <p> tag inside .single-post-summary
            .get();  // Get an array of the text contents

        return summaryPoints.length > 0 ? summaryPoints : ['Summary not available'];
    } catch (error) {
        console.error(`Error fetching summary from ${link}:`, error.message);
        return ['Summary not available'];
    }
}

async function fetchArticleSummaryWithRetries(link, retries = 2) {
    let attempt = 0;
    while (attempt <= retries) {
        const summary = await fetchArticleSummary(link);
        if (summary[0] !== 'Summary not available') {
            return summary;
        }
        attempt++;
        console.log(`Retrying to fetch summary from ${link}. Attempt ${attempt}`);
    }
    return ['Summary not available'];
}
