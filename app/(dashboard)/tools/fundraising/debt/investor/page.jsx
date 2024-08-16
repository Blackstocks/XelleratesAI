'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../../../lib/supabaseclient';
import { useRouter } from 'next/navigation';

const Investors = () => {
    const [investors, setInvestors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [connectedInvestors, setConnectedInvestors] = useState([]); // Track connected investors
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchInvestors = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase.from('debt_investor').select('*');
                if (error) {
                    console.error('Error fetching investors:', error.message);
                } else {
                    setInvestors(data);
                }
            } catch (error) {
                console.error('Unexpected error fetching investors:', error.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchConnectedInvestors = async () => {
            try {
                const { data: userData, error: userError } = await supabase.auth.getSession();
                if (userError) throw userError;

                const userId = userData?.session?.user?.id;
                if (!userId) {
                    console.error('User is not logged in');
                    return;
                }

                const { data, error } = await supabase
                    .from('connected_startups')
                    .select('connected_investor')
                    .eq('user_id', userId);

                if (error) {
                    console.error('Error fetching connected investors:', error.message);
                } else {
                    const connected = data.map((item) => item.connected_investor);
                    setConnectedInvestors(connected);
                }
            } catch (error) {
                console.error('Unexpected error fetching connected investors:', error.message);
            }
        };

        fetchInvestors();
        fetchConnectedInvestors();
    }, []);

    const handleConnect = async (investor) => {
        try {
            const { data: userData, error: userError } = await supabase.auth.getSession();
            if (userError) throw userError;

            const userId = userData?.session?.user?.id;
            if (!userId) {
                console.error('User is not logged in');
                return;
            }

            // Fetch user's profile data
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('company_name, name, email, mobile, linkedin_profile')
                .eq('id', userId)
                .single();

            if (profileError) throw profileError;

            const { company_name, name, email, mobile, linkedin_profile } = profile;

            // Insert connection data into connected_startups table
            const { data, error } = await supabase
                .from('connected_startups')
                .insert({
                    startup_name: company_name,
                    founder_name: name,
                    linkedin_profile,
                    email,
                    mobile,
                    user_type: 'debt',
                    user_id: userId,
                    has_connected: true,
                    connected_investor: investor.Investor, // Add investor's name to the connected_investor column
                });

            if (error) throw error;

            // Update the UI to reflect the connection
            setConnectedInvestors((prevConnected) => [...prevConnected, investor.Investor]);
            setIsMessageModalOpen(true);
        } catch (error) {
            console.error('Error connecting with investor:', error.message);
        }
    };

    if (loading) {
        return <p>Loading investors...</p>;
    }

    return (
        <div className="container mx-auto p-4 relative">
            <div className="absolute top-4 left-4">
                <button
                    onClick={() => router.back()}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Back
                </button>
            </div>
            <h1 className="text-2xl font-bold mb-4 text-center">Available Debt Investors</h1>
            {investors.length > 0 ? (
                <table className="min-w-full bg-white border">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border">Investor</th>
                            <th className="py-2 px-4 border">Requirements</th>
                            <th className="py-2 px-4 border">Connect</th>
                        </tr>
                    </thead>
                    <tbody>
                        {investors.map((investor, index) => (
                            <tr key={index}>
                                <td className="py-2 px-4 border">{investor.Investor}</td>
                                <td className="py-2 px-4 border">{investor.Requirements}</td>
                                <td className="py-2 px-4 border">
                                    <button
                                        onClick={() => handleConnect(investor)}
                                        className={`w-32 text-center ${
                                            connectedInvestors.includes(investor.Investor)
                                                ? 'bg-gray-500 cursor-not-allowed'
                                                : 'bg-blue-500 hover:bg-blue-600'
                                        } text-white px-4 py-2 rounded`}
                                        disabled={connectedInvestors.includes(investor.Investor)}
                                    >
                                        {connectedInvestors.includes(investor.Investor) ? 'Connected' : 'Connect'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No investors found.</p>
            )}
            {isMessageModalOpen && (
                <div className='fixed inset-0 flex items-center justify-center z-50'>
                    <div className='bg-[#1a235e] text-white p-6 rounded-lg shadow-lg relative z-60'>
                        <p className='text-lg font-bold mb-4 text-center'>
                            Our investment banker will reach out to you shortly.
                        </p>
                        <button
                            onClick={() => setIsMessageModalOpen(false)}
                            className='block mx-auto py-2 px-4 bg-[#e7ad6c] text-white rounded'
                        >
                            Close
                        </button>
                    </div>
                    <div
                        className='fixed inset-0 bg-black opacity-50 z-50'
                        onClick={() => setIsMessageModalOpen(false)}
                    ></div>
                </div>
            )}
        </div>
    );
};

export default Investors;
