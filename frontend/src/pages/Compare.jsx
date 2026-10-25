import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { GitCompare, ExternalLink, AlertCircle, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Compare() {
    const location = useLocation();
    const [dev1, setDev1] = useState('');
    const [dev2, setDev2] = useState('');
    const [comparisonName, setComparisonName] = useState('');
    const [data1, setData1] = useState(null);
    const [data2, setData2] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { token } = useAuth();

    // Automatically trigger comparison if navigated from Saved & Pins with usernames
    useEffect(() => {
        if (location.state?.usernames && location.state.usernames.length >= 2) {
            setDev1(location.state.usernames[0] || '');
            setDev2(location.state.usernames[1] || '');
            executeComparison(location.state.usernames[0], location.state.usernames[1]);
        }
    }, [location.state]);

    const executeComparison = async (username1, username2) => {
        setLoading(true);
        setError('');
        setData1(null);
        setData2(null);

        try {
            const [res1, res2] = await Promise.all([
                axios.get(`http://localhost:5000/api/github/profile/${username1.trim()}`),
                axios.get(`http://localhost:5000/api/github/profile/${username2.trim()}`)
            ]);
            setData1(res1.data.developer);
            setData2(res2.data.developer);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch developer profiles');
        } finally {
            setLoading(false);
        }
    };

    const handleCompareSubmit = (e) => {
        e.preventDefault();
        if (!dev1.trim() || !dev2.trim()) {
            setError('Please enter two GitHub usernames to compare.');
            return;
        }
        executeComparison(dev1, dev2);
    };

    const handleSaveComparison = async () => {
        if (!token) {
            alert('Please login to save comparisons.');
            return;
        }
        if (!comparisonName.trim()) {
            alert('Please enter a name for this comparison group.');
            return;
        }

        try {
            await axios.post(
                'http://localhost:5000/api/curation/comparisons',
                { name: comparisonName, usernames: [data1.username, data2.username] },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccessMessage('Comparison saved successfully!');
        } catch (err) {
            alert('Failed to save comparison');
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center py-6 space-y-3">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center justify-center gap-2">
                    <GitCompare className="w-8 h-8 text-purple-600" /> Side-by-Side Developer Comparison
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Benchmark metrics, followers, stars, and code ecosystems between two developers.
                </p>

                <form onSubmit={handleCompareSubmit} className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                    <input 
                        type="text"
                        value={dev1}
                        onChange={(e) => setDev1(e.target.value)}
                        placeholder="First username (e.g., torvalds)"
                        className="px-4 py-3 bg-white dark:bg-[#1f2028] border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none dark:text-white text-sm"
                    />
                    <div className="flex gap-2">
                        <input 
                            type="text"
                            value={dev2}
                            onChange={(e) => setDev2(e.target.value)}
                            placeholder="Second username (e.g., gaearon)"
                            className="flex-1 px-4 py-3 bg-white dark:bg-[#1f2028] border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none dark:text-white text-sm"
                        />
                        <button 
                            type="submit"
                            disabled={loading}
                            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl shadow-md transition shrink-0"
                        >
                            {loading ? 'Comparing...' : 'Compare'}
                        </button>
                    </div>
                </form>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400 text-sm max-w-xl mx-auto">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {data1 && data2 && (
                <div className="space-y-6">
                    {token && (
                        <div className="bg-white dark:bg-[#1f2028] border border-gray-200 dark:border-gray-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                            <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
                                <input 
                                    type="text"
                                    value={comparisonName}
                                    onChange={(e) => setComparisonName(e.target.value)}
                                    placeholder="Name this comparison (e.g., Top JS Creators)"
                                    className="w-full sm:w-80 px-4 py-2 bg-gray-50 dark:bg-[#16171d] border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:text-white"
                                />
                                <button 
                                    onClick={handleSaveComparison}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition flex items-center gap-1.5 shrink-0"
                                >
                                    <Save className="w-4 h-4" /> Save
                                </button>
                            </div>
                            {successMessage && <span className="text-xs text-emerald-600 font-medium">{successMessage}</span>}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[data1, data2].map((dev, idx) => (
                            <div key={idx} className="bg-white dark:bg-[#1f2028] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
                                <div className="flex items-center gap-4">
                                    <img src={dev.avatar_url} alt={dev.username} className="w-16 h-16 rounded-full border-2 border-purple-500/20" />
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                            {dev.username}
                                            <a href={`https://github.com/${dev.username}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-purple-600">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </h3>
                                        <p className="text-xs text-gray-500">GitHub Developer Profile</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-[#16171d] rounded-xl border border-gray-100 dark:border-gray-800 text-sm">
                                        <span className="text-gray-500">Followers</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{dev.followers}</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-[#16171d] rounded-xl border border-gray-100 dark:border-gray-800 text-sm">
                                        <span className="text-gray-500">Public Repositories</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{dev.public_repos}</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-[#16171d] rounded-xl border border-gray-100 dark:border-gray-800 text-sm">
                                        <span className="text-gray-500">Total Stars</span>
                                        <span className="font-bold text-purple-600 dark:text-purple-400">{dev.total_stars}</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-gray-50 dark:bg-[#16171d] rounded-xl border border-gray-100 dark:border-gray-800 text-sm">
                                        <span className="text-gray-500">Primary Language</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{Object.keys(dev.languages)[0] || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}