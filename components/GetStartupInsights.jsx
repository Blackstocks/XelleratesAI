import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const GetStartupInsightsModal = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        setLoading(true); // Start loading
        try {
            const response = await axios.get('/api/fetch-news', {
                params: { q: `${searchQuery} news inc42 1 year` }
            });
            setNews(response.data);
        } catch (error) {
            console.error('Error fetching news:', error.message);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 h-3/4"
                    >
                        <div className="relative flex flex-col h-full">
                            <button
                                onClick={onClose}
                                className="absolute top-2 right-2 p-2 bg-gray-200 rounded-full z-10"
                            >
                                &times;
                            </button>
                            <h2 className="text-2xl font-semibold mb-4 p-4">Get Startup Insights</h2>
                            <div className="px-4 flex flex-col h-full overflow-hidden">
                                <input
                                    type="text"
                                    placeholder="Enter startup name"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full p-2 border rounded mb-4"
                                />
                                <button
                                    onClick={handleSearch}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg mb-4"
                                >
                                    Search
                                </button>
                                <div className="flex-1 overflow-y-auto px-4">
                                    {loading ? (
                                        <p>Loading...</p>
                                    ) : news.length > 0 ? (
                                        <ul className="list-disc pl-5">
                                            {news.map((article, index) => (
                                                <li key={index} className="mb-4">
                                                    <a target="_blank" rel="noopener noreferrer" className="text-blue-600">
                                                        {article.title}
                                                    </a>
                                                    <p className="text-gray-600">{article.date}</p>
                                                    {/* <p>{article.summary}</p> */}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No results found.</p>
                                    )}
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
