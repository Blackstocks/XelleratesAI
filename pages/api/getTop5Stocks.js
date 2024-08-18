import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fuzzball from 'fuzzball';

const sectors = [
    {"sector": "Aerospace & Defence", "synonyms": ["Aerospace", "Defense", "Aviation", "Military", "Space Technology"], "url": "/company/compare/00000085/"},
    {"sector": "Agro Chemicals", "synonyms": ["Agrochemicals", "Agricultural Chemicals", "Pesticides", "Fertilizers"], "url": "/company/compare/00000001/"},
    {"sector": "Air Transport Service", "synonyms": ["Airlines", "Aviation", "Air Transportation", "Air Cargo"], "url": "/company/compare/00000002/"},
    {"sector": "Alcoholic Beverages", "synonyms": ["Alcohol", "Beverages", "Wine", "Beer", "Spirits", "Distilleries"], "url": "/company/compare/00000003/"},
    {"sector": "Auto Ancillaries", "synonyms": ["Auto Components", "Automotive Parts", "Vehicle Components", "Car Parts"], "url": "/company/compare/00000004/"},
    {"sector": "Automobile", "synonyms": ["Automotive", "Cars", "Vehicles", "Motor Vehicles"], "url": "/company/compare/00000005/"},
    {"sector": "Banks", "synonyms": ["Banking", "Financial Institutions", "Commercial Banks", "Retail Banks"], "url": "/company/compare/00000006/"},
    {"sector": "Bearings", "synonyms": ["Mechanical Bearings", "Industrial Bearings"], "url": "/company/compare/00000066/"},
    {"sector": "Cables", "synonyms": ["Electrical Cables", "Wiring", "Wires"], "url": "/company/compare/00000007/"},
    {"sector": "Capital Goods - Electrical Equipment", "synonyms": ["Electrical Machinery", "Power Equipment", "Industrial Equipment"], "url": "/company/compare/00000008/"},
    {"sector": "Capital Goods-Non Electrical Equipment", "synonyms": ["Industrial Equipment", "Machinery", "Heavy Machinery"], "url": "/company/compare/00000009/"},
    {"sector": "Castings, Forgings & Fastners", "synonyms": ["Metal Castings", "Forged Components", "Fastening Products"], "url": "/company/compare/00000010/"},
    {"sector": "Cement", "synonyms": ["Construction Materials", "Concrete", "Building Materials"], "url": "/company/compare/00000011/"},
    {"sector": "Cement - Products", "synonyms": ["Concrete Products", "Building Products", "Cement Based Products"], "url": "/company/compare/00000012/"},
    {"sector": "Ceramic Products", "synonyms": ["Ceramics", "Pottery", "Tiles", "Porcelain"], "url": "/company/compare/00000013/"},
    {"sector": "Chemicals", "synonyms": ["Chemical Industry", "Industrial Chemicals", "Specialty Chemicals"], "url": "/company/compare/00000014/"},
    {"sector": "Computer Education", "synonyms": ["IT Training", "Tech Education", "Digital Education"], "url": "/company/compare/00000015/"},
    {"sector": "Construction", "synonyms": ["Real Estate Development", "Building Construction", "Infrastructure"], "url": "/company/compare/00000016/"},
    {"sector": "Consumer Durables", "synonyms": ["Home Appliances", "Electronics", "White Goods"], "url": "/company/compare/00000017/"},
    {"sector": "Credit Rating Agencies", "synonyms": ["Credit Ratings", "Financial Ratings", "Credit Assessment"], "url": "/company/compare/00000018/"},
    {"sector": "Crude Oil & Natural Gas", "synonyms": ["Oil and Gas", "Energy", "Petroleum", "Fossil Fuels"], "url": "/company/compare/00000019/"},
    {"sector": "Diamond, Gems and Jewellery", "synonyms": ["Jewelry", "Precious Stones", "Gems", "Diamonds"], "url": "/company/compare/00000020/"},
    {"sector": "Diversified", "synonyms": ["Conglomerates", "Holding Companies", "Diversified Industries"], "url": "/company/compare/00000021/"},
    {"sector": "Dry cells", "synonyms": ["Batteries", "Power Cells", "Portable Power"], "url": "/company/compare/00000022/"},
    {"sector": "E-Commerce/App based Aggregator", "synonyms": ["Online Retail", "E-Commerce", "Marketplaces", "Online Platforms"], "url": "/company/compare/00000080/"},
    {"sector": "Edible Oil", "synonyms": ["Cooking Oil", "Vegetable Oil", "Oil Products"], "url": "/company/compare/00000023/"},
    {"sector": "Education", "synonyms": ["EdTech", "Educational Services", "Learning", "Training"], "url": "/company/compare/00000073/"},
    {"sector": "Electronics", "synonyms": ["Consumer Electronics", "Electronic Devices", "Electronic Components"], "url": "/company/compare/00000076/"},
    {"sector": "Engineering", "synonyms": ["Manufacturing", "Industrial Engineering", "Mechanical Engineering"], "url": "/company/compare/00000072/"},
    {"sector": "Entertainment", "synonyms": ["Media", "Film Industry", "Television", "Music"], "url": "/company/compare/00000024/"},
    {"sector": "ETF", "synonyms": ["Exchange Traded Funds", "Investment Funds", "Passive Investments"], "url": "/company/compare/00000069/"},
    {"sector": "Ferro Alloys", "synonyms": ["Metal Alloys", "Steel Additives", "Alloying Metals"], "url": "/company/compare/00000071/"},
    {"sector": "Fertilizers", "synonyms": ["Agricultural Fertilizers", "Plant Nutrients", "Soil Fertilizers"], "url": "/company/compare/00000025/"},
    {"sector": "Finance", "synonyms": ["Financial Services", "Banking", "FinTech", "Lending"], "url": "/company/compare/00000026/"},
    {"sector": "Financial Services", "synonyms": ["FinTech", "Finance", "Banking", "Investments"], "url": "/company/compare/00000087/"},
    {"sector": "FMCG", "synonyms": ["Fast-Moving Consumer Goods", "Consumer Packaged Goods", "Retail"], "url": "/company/compare/00000027/"},
    {"sector": "Gas Distribution", "synonyms": ["Natural Gas", "Energy Distribution", "Gas Supply"], "url": "/company/compare/00000028/"},
    {"sector": "Glass & Glass Products", "synonyms": ["Glass Manufacturing", "Glassware", "Glass Industry"], "url": "/company/compare/00000029/"},
    {"sector": "Healthcare", "synonyms": ["Health Services", "Medical", "Hospitals", "Healthcare Technology"], "url": "/company/compare/00000030/"},
    {"sector": "Hotels & Restaurants", "synonyms": ["Hospitality", "Food and Beverage", "Lodging", "Dining"], "url": "/company/compare/00000031/"},
    {"sector": "Infrastructure Developers & Operators", "synonyms": ["Infrastructure", "Construction", "Real Estate Development"], "url": "/company/compare/00000032/"},
    {"sector": "Infrastructure Investment Trusts", "synonyms": ["Investment Trusts", "Infrastructure Funds", "REITs"], "url": "/company/compare/00000082/"},
    {"sector": "Insurance", "synonyms": ["InsurTech", "Financial Protection", "Risk Management"], "url": "/company/compare/00000067/"},
    {"sector": "IT - Hardware", "synonyms": ["Information Technology Hardware", "Computing Devices", "IT Equipment"], "url": "/company/compare/00000033/"},
    {"sector": "IT - Software", "synonyms": ["Information Technology Software", "Software Development", "IT Services"], "url": "/company/compare/00000034/"},
    {"sector": "Leather", "synonyms": ["Leather Goods", "Footwear", "Leather Products"], "url": "/company/compare/00000035/"},
    {"sector": "Logistics", "synonyms": ["Supply Chain", "Freight", "Shipping", "Transportation"], "url": "/company/compare/00000036/"},
    {"sector": "Marine Port & Services", "synonyms": ["Maritime", "Ports", "Shipping Services", "Harbor"], "url": "/company/compare/00000083/"},
    {"sector": "Media - Print/Television/Radio", "synonyms": ["Mass Media", "Broadcasting", "Publishing", "News Media"], "url": "/company/compare/00000037/"},
    {"sector": "Mining & Mineral products", "synonyms": ["Mining", "Mineral Extraction", "Raw Materials"], "url": "/company/compare/00000038/"},
    {"sector": "Miscellaneous", "synonyms": ["Various Industries", "Diverse Sectors", "Other Services"], "url": "/company/compare/00000039/"},
    {"sector": "Non Ferrous Metals", "synonyms": ["Metals", "Industrial Metals", "Aluminum", "Copper"], "url": "/company/compare/00000040/"},
    {"sector": "Oil Drill/Allied", "synonyms": ["Oil Exploration", "Drilling", "Energy", "Oil Services"], "url": "/company/compare/00000041/"},
    {"sector": "Online Media", "synonyms": ["Digital Media", "Internet Media", "Social Media", "Web Content"], "url": "/company/compare/00000075/"},
    {"sector": "Packaging", "synonyms": ["Packaging Materials", "Containers", "Packaging Solutions"], "url": "/company/compare/00000042/"},
    {"sector": "Paints/Varnish", "synonyms": ["Coatings", "Surface Treatments", "Paint Industry"], "url": "/company/compare/00000043/"},
    {"sector": "Paper", "synonyms": ["Pulp and Paper", "Paper Products", "Paper Manufacturing"], "url": "/company/compare/00000044/"},
    {"sector": "Petrochemicals", "synonyms": ["Chemical Products", "Oil Products", "Industrial Chemicals"], "url": "/company/compare/00000045/"},
    {"sector": "Pharmaceuticals", "synonyms": ["Pharma", "Medicines", "Drugs", "Biotechnology"], "url": "/company/compare/00000046/"},
    {"sector": "Plantation & Plantation Products", "synonyms": ["Agriculture", "Farming", "Plantation Goods"], "url": "/company/compare/00000047/"},
    {"sector": "Plastic products", "synonyms": ["Plastics", "Polymer Products", "Synthetic Materials"], "url": "/company/compare/00000048/"},
    {"sector": "Plywood Boards/Laminates", "synonyms": ["Wood Products", "Timber", "Laminates", "Wood Panels"], "url": "/company/compare/00000086/"},
    {"sector": "Power Generation & Distribution", "synonyms": ["Energy", "Electricity", "Power Supply", "Utilities"], "url": "/company/compare/00000049/"},
    {"sector": "Power Infrastructure", "synonyms": ["Energy Infrastructure", "Power Plants", "Electricity Infrastructure"], "url": "/company/compare/00000079/"},
    {"sector": "Printing & Stationery", "synonyms": ["Printing Services", "Stationery Products", "Office Supplies"], "url": "/company/compare/00000074/"},
    {"sector": "Quick Service Restaurant", "synonyms": ["Fast Food", "Restaurants", "Food Service", "QSR"], "url": "/company/compare/00000084/"},
    {"sector": "Railways", "synonyms": ["Rail Transport", "Trains", "Transportation", "Rail Industry"], "url": "/company/compare/00000077/"},
    {"sector": "Readymade Garments/ Apparels", "synonyms": ["Fashion", "Clothing", "Apparel", "Garments"], "url": "/company/compare/00000050/"},
    {"sector": "Real Estate Investment Trusts", "synonyms": ["REITs", "Real Estate Funds", "Property Investment"], "url": "/company/compare/00000081/"},
    {"sector": "Realty", "synonyms": ["Real Estate", "Property", "Construction", "Housing"], "url": "/company/compare/00000051/"},
    {"sector": "Refineries", "synonyms": ["Oil Refineries", "Petroleum Refining", "Energy Processing"], "url": "/company/compare/00000052/"},
    {"sector": "Refractories", "synonyms": ["Heat Resistant Materials", "Industrial Materials", "Furnace Materials"], "url": "/company/compare/00000053/"},
    {"sector": "Retail", "synonyms": ["Retail Industry", "Shopping", "Retail Stores", "E-Commerce"], "url": "/company/compare/00000054/"},
    {"sector": "Sanitaryware", "synonyms": ["Bathroom Fixtures", "Plumbing Products", "Sanitation Products"], "url": "/company/compare/00000070/"},
    {"sector": "Ship Building", "synonyms": ["Shipyards", "Maritime Construction", "Naval Architecture"], "url": "/company/compare/00000055/"},
    {"sector": "Shipping", "synonyms": ["Logistics", "Freight", "Maritime Transport"], "url": "/company/compare/00000056/"},
    {"sector": "Steel", "synonyms": ["Metal Industry", "Steel Manufacturing", "Iron and Steel"], "url": "/company/compare/00000057/"},
    {"sector": "Stock/ Commodity Brokers", "synonyms": ["Brokerage", "Trading", "Stock Market", "Commodities"], "url": "/company/compare/00000058/"},
    {"sector": "Sugar", "synonyms": ["Sugar Industry", "Sugar Production", "Sweeteners"], "url": "/company/compare/00000059/"},
    {"sector": "Telecom-Handsets/Mobile", "synonyms": ["Mobile Phones", "Handsets", "Telecom Devices"], "url": "/company/compare/00000068/"},
    {"sector": "Telecomm Equipment & Infra Services", "synonyms": ["Telecom Infrastructure", "Telecommunication Equipment", "Network Equipment"], "url": "/company/compare/00000060/"},
    {"sector": "Telecomm-Service", "synonyms": ["Telecommunications", "Mobile Network", "Telecom Services"], "url": "/company/compare/00000061/"},
    {"sector": "Textiles", "synonyms": ["Fabric", "Textile Industry", "Cloth", "Textile Manufacturing"], "url": "/company/compare/00000062/"},
    {"sector": "Tobacco Products", "synonyms": ["Tobacco Industry", "Cigarettes", "Cigars", "Smoking Products"], "url": "/company/compare/00000063/"},
    {"sector": "Trading", "synonyms": ["Commerce", "Trade", "Business", "Market Trading"], "url": "/company/compare/00000064/"},
    {"sector": "Tyres", "synonyms": ["Tire Manufacturing", "Automotive Tyres", "Rubber Tyres"], "url": "/company/compare/00000065/"}
]
;

// Weights for scoring
const weights = {
    marketCap: 0.5,
    peRatio: 0.3,
    profit: 0.2,
};

// Function to find the closest sector
function findClosestSector(startupSector) {
    let bestMatch = null;
    let highestScore = 0;

    sectors.forEach(sectorObj => {
        const sectorNameScore = fuzzball.token_set_ratio(startupSector, sectorObj.sector);
        const synonymScores = sectorObj.synonyms.map(synonym => fuzzball.token_set_ratio(startupSector, synonym));
        const maxSynonymScore = Math.max(...synonymScores);

        const overallScore = Math.max(sectorNameScore, maxSynonymScore);

        if (overallScore > highestScore) {
            highestScore = overallScore;
            bestMatch = sectorObj;
        }
    });

    return bestMatch;
}

// Function to fetch stock data from a given URL
async function fetchStockData(url) {
    try {
        const { data } = await axios.get(`https://www.screener.in${url}`);
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

// Function to extract stock data (Market Price, P/E, and Profit)
function extractStockData(html) {
    const $ = cheerio.load(html);
    const stockData = [];

    // Iterate through table rows
    $('table.data-table tbody tr').each((index, element) => {
        const stock = {};
        const columns = $(element).find('td');

        // Extract data from columns
        stock.name = $(columns[1]).text().trim();
        stock.marketCap = parseFloat($(columns[4]).text().trim());
        stock.peRatio = parseFloat($(columns[3]).text().trim());
        stock.profit = parseFloat($(columns[6]).text().trim());

        // Push stock data to array if all values are valid numbers
        if (!isNaN(stock.marketCap) && !isNaN(stock.peRatio) && !isNaN(stock.profit)) {
            stockData.push(stock);
        }
    });

    return stockData;
}

// Function to normalize metrics and calculate the total score
function normalizeAndScore(companies, weights) {
    const maxMarketCap = Math.max(...companies.map(c => c.marketCap));
    const maxPeRatio = Math.max(...companies.map(c => c.peRatio));
    const maxProfit = Math.max(...companies.map(c => c.profit));

    return companies.map(company => {
        const normalizedMarketCap = company.marketCap / maxMarketCap;
        const normalizedPeRatio = company.peRatio / maxPeRatio;
        const normalizedProfit = company.profit / maxProfit;

        const totalScore = 
            (normalizedMarketCap * weights.marketCap) +
            (normalizedPeRatio * weights.peRatio) +
            (normalizedProfit * weights.profit);

        return { ...company, totalScore };
    });
}

// Function to get the top 5 stocks by sector
function getTop5BySector(companies, weights) {
    const scoredCompanies = normalizeAndScore(companies, weights);
    return scoredCompanies
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, 5);
}

// API handler function
export default async function handler(req, res) {
    const { sector } = req.query;

    if (!sector) {
        return res.status(400).json({ error: 'Sector is required' });
    }

    const sectorMatch = findClosestSector(sector);

    if (!sectorMatch) {
        return res.status(404).json({ error: 'No matching sector found' });
    }

    const html = await fetchStockData(sectorMatch.url);
    
    if (html) {
        const stockData = extractStockData(html);
        const top5Stocks = getTop5BySector(stockData, weights);
        return res.status(200).json(top5Stocks);
    } else {
        return res.status(500).json({ error: 'Failed to fetch stock data' });
    }
}
