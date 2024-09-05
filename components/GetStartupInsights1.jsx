import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios"; // Ensure axios is imported for the API call
import { fetchLatestInsightsData } from "@/components/latest-insights"; // Adjust the import path

const GetStartupInsightsModal1 = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [news, setNews] = useState([]);
    const [displayedNews, setDisplayedNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showMore, setShowMore] = useState({});
    const [searchInitiated, setSearchInitiated] = useState(false);
    const [modalTitle, setModalTitle] = useState('Latest Startup News'); // Default title
    const [sortOrder, setSortOrder] = useState('latest');
    const [categories, setCategories] = useState([]); // Store unique categories
    const [selectedCategory, setSelectedCategory] = useState(''); // Selected category

    const subCategoryMap = {
        edtech: 'EdTech',
        fintech: 'FinTech',
        agritech: 'AgriTech',
        artificialintelligence: 'AI',
        general: 'General',
        healthtech: 'HealthTech',
        tech: 'Tech',
        logistech: 'LogisTech',
      };

    // Fetch the latest startup news when the modal opens
    useEffect(() => {
        if (isOpen) {
            fetchLatestStartupNews();
        }
    }, [isOpen]);

    // Function to fetch data from Supabase
    const fetchLatestStartupNews = async () => {
        setLoading(true);
        setSearchInitiated(false); // This prevents "No results found" from showing initially
        setModalTitle('Latest Startup Insights'); // Set title for latest news

        try {
            const insightsData = await fetchLatestInsightsData(); // Fetch data using your backend function
            const filteredNews = filterNewsByLastYear(insightsData); // Filter news from the last year
            const uniqueCategories = [...new Set(filteredNews.map(article => article.subcategory))]; // Get unique categories
            setCategories(uniqueCategories);
            setNews(filteredNews);
            handleSortOrderChange('latest', filteredNews); // Set default sort to latest
        } catch (error) {
            console.error('Error fetching news:', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Filter news from the last year
    const filterNewsByLastYear = (newsList) => {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return newsList.filter((article) => {
            const articleDate = new Date(article.date); // Convert text date to Date object
            return articleDate >= oneYearAgo;
        });
    };

    const handleSearch = async () => {
        setSearchInitiated(true);
        setLoading(true);
        setModalTitle(`Insights for "${searchQuery}"`); // Update title based on search query

        try {
            const response = await axios.get('/api/fetch-news', {
                params: { q: `${searchQuery}` }
            });
            const filteredNews = filterNewsByLastYear(response.data); // Assuming the response data structure is consistent
            setNews(filteredNews);
            handleSortOrderChange(sortOrder, filteredNews); // Apply sorting to search results
        } catch (error) {
            console.error('Error fetching news:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSortOrderChange = (order, newsList = news) => {
        setSortOrder(order);
        const sortedNews = [...newsList].sort((a, b) => {
            const dateA = new Date(a.date); // Convert text date to Date object
            const dateB = new Date(b.date); // Convert text date to Date object
            return order === 'latest' ? dateB - dateA : dateA - dateB;
        });
        setDisplayedNews(sortedNews);
    };

    const handleCategoryChange = (event) => {
        const selectedCategory = event.target.value;
        setSelectedCategory(selectedCategory);
        const filteredNews = news.filter(article => article.subcategory === selectedCategory); // Use subcategory
        handleSortOrderChange(sortOrder, filteredNews); // Filter news by selected category
    };

    // Helper function to split summaries by full stops
    const splitSummaryIntoPoints = (summary) => {
        if (searchQuery === '') {
            return summary
                .split('. ')
                .map(point => point.trim())
                .filter(point => point.length > 0 && !point.toLowerCase().includes('source link'));
        } else {
            return summary;
        }
        
    };

    return (
        <>
            <head>
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
                />
            </head>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-auto h-4/5 md:h-3/4 overflow-hidden"
                    >
                        <div className="relative flex flex-col h-full">
                            <button
                                onClick={onClose}
                                className="absolute top-2 right-2 p-2 bg-gray-200 rounded-lg shadow z-10 hover:bg-gray-300"
                            >
                                &times;
                            </button>
                            <h2 className="text-xl md:text-2xl font-semibold mb-4 p-4">{modalTitle}</h2>
                            <div className="px-4 flex flex-col h-full">
                                <div className="relative mb-4">
                                    <input
                                        type="text"
                                        placeholder="Enter startup name"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-full p-3 border rounded-lg shadow-sm pr-12"
                                    />
                                    <button
                                        onClick={handleSearch}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-500 focus:outline-none"
                                    >
                                        <i className="fas fa-search"></i>
                                    </button>
                                </div>

                                <div className={!searchQuery ? `grid grid-cols-2 gap-4 mb-4 ml-4 mr-4` : `flex justify-end ml-4 mr-4`}>
                                    {!searchQuery && (
                                        <div className="flex items-center">
                                            <label className="mr-2 font-semibold text-gray-700">Category:</label>
                                            <select
                                                value={selectedCategory}
                                                onChange={handleCategoryChange}
                                                className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">All</option>
                                                {categories.map((category, index) => (
                                                    <option key={index} value={category}>
                                                        {subCategoryMap[category]}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-end">
                                        <label className="mr-2 font-semibold text-gray-700">Sort by:</label>
                                        <select
                                            value={sortOrder}
                                            onChange={(e) => handleSortOrderChange(e.target.value)}
                                            className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="latest">Latest First</option>
                                            <option value="oldest">Oldest First</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto px-2 md:px-4 space-y-4 pb-16 pt-4 mb-6">
                                    {loading ? (
                                        <p>Loading...</p>
                                    ) : displayedNews.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {displayedNews.map((article, index) => {
                                                const summaryPoints = splitSummaryIntoPoints(article.summary);
                                                return (
                                                    <div
                                                        key={index}
                                                        className="p-4 bg-gray-100 rounded-lg shadow-md hover:shadow-lg transform transition-transform duration-300 ease-in-out"
                                                    >
                                                        <a
                                                            href={article.article_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 font-semibold hover:underline"
                                                        >
                                                            {article.title}
                                                        </a>
                                                        <p className="text-gray-500 text-sm">{new Date(article.date).toLocaleDateString()}</p>
                                                        <ul className="mt-2 list-disc pl-4 text-gray-700 space-y-1">
                                                            <li>{summaryPoints[0]}</li> {/* Show the first point */}
                                                        </ul>
                                                        {summaryPoints.length > 1 && !showMore[index] && (
                                                            <button
                                                                onClick={() =>
                                                                    setShowMore((prev) => ({
                                                                        ...prev,
                                                                        [index]: true,
                                                                    }))
                                                                }
                                                                className="text-blue-500 hover:text-blue-700 text-sm mt-2"
                                                            >
                                                                Read More
                                                            </button>
                                                        )}
                                                        {showMore[index] && (
                                                            <div className="mt-2">
                                                                <ul className="list-disc pl-4 text-gray-700 space-y-1">
                                                                    {summaryPoints.slice(1).map((point, idx) => (
                                                                        <li key={idx}>{point}</li>
                                                                    ))}
                                                                </ul>
                                                                <button
                                                                    onClick={() =>
                                                                        setShowMore((prev) => ({
                                                                            ...prev,
                                                                            [index]: false,
                                                                        }))
                                                                    }
                                                                    className="text-blue-500 hover:text-blue-700 text-sm mt-2"
                                                                >
                                                                    Show Less
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : searchInitiated ? (
                                        <p>Currently, there is no media presence of {searchQuery}</p>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
};

export default GetStartupInsightsModal1;
