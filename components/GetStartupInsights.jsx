import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const GetStartupInsightsModal = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showMore, setShowMore] = useState({});
    const [searchInitiated, setSearchInitiated] = useState(false);
    const [modalTitle, setModalTitle] = useState('Latest Startup News'); // Default title

    // Fetch the latest startup news when the modal opens
    useEffect(() => {
        if (isOpen) {
            fetchLatestStartupNews();
        }
    }, [isOpen]);

    const fetchLatestStartupNews = async () => {
        setLoading(true);
        setSearchInitiated(false); // This prevents "No results found" from showing initially
        setModalTitle('Latest Startup Insights'); // Set title for latest news

        try {
            const response = await axios.get('/api/fetch-news', {
                params: { q: `updates inc42` }
            });
            setNews(response.data);

            console.log('API Response:', response.data);
        } catch (error) {
            console.error('Error fetching news:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        setSearchInitiated(true);
        setLoading(true);
        setModalTitle(`Insights for "${searchQuery}"`); // Update title based on search query

        try {
            const response = await axios.get('/api/fetch-news', {
                params: { q: `${searchQuery} news inc42 1 year` }
            });
            setNews(response.data);
        } catch (error) {
            console.error('Error fetching news:', error.message);
        } finally {
            setLoading(false);
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 h-3/4 overflow-hidden"
                    >
                        <div className="relative flex flex-col h-full">
                            <button
                                onClick={onClose}
                                className="absolute top-2 right-2 p-2 bg-gray-200 rounded-lg shadow z-10 hover:bg-gray-300"
                            >
                                &times;
                            </button>
                            <h2 className="text-2xl font-semibold mb-4 p-4">{modalTitle}</h2>
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
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-500 focus:outline-none"
                                        style={{ right: '10px' }}
                                    >
                                        <i className="fas fa-search"></i>
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-20 pt-4">
                                    {loading ? (
                                        <p>Loading...</p>
                                    ) : news.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {news.map((article, index) => (
                                                <div
                                                    key={index}
                                                    className="p-4 bg-gray-100 rounded-lg shadow-md hover:shadow-lg transform transition-transform duration-300 ease-in-out"
                                                >
                                                    <a
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 font-semibold hover:underline"
                                                    >
                                                        {article.title}
                                                    </a>
                                                    <p className="text-gray-500 text-sm">{article.date}</p>
                                                    <ul className="mt-2 list-disc pl-4 text-gray-700 space-y-1">
                                                        <li>{article.summary[0]}</li>
                                                    </ul>
                                                    {article.summary.length > 1 && !showMore[index] && (
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
                                                                {article.summary.slice(1).map((point, idx) => (
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
                                            ))}
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

export default GetStartupInsightsModal;
