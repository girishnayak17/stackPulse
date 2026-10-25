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

    // Helper to render proportional comparative bars
    const renderBarGroup = (label, val1, val2) => {
        const maxVal = Math.max(val1, val2, 1);
        const height1 = Math.max(Math.round((val1 / maxVal) * 100), 12);
        const height2 = Math.max(Math.round((val2 / maxVal) * 100), 12);

        return (
            <div className="flex flex-col items-center h-full justify-end gap-3">
                <div className="flex items-end justify-center gap-2 sm:gap-4 w-full h-48 sm:h-56 pb-2 px-1 border-b border-gray-200 dark:border-gray-800">
                    {/* Bar for Developer 1 */}
                    <div className="flex flex-col items-center gap-1.5 h-full justify-end w-1/2 max-w-[60px]">
                        <span className="text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-300">{val1}</span>
                        <div 
                            style={{ height: `${height1}%` }} 
                            className="w-full bg-blue-500 rounded-t-lg transition-all duration-500 hover:bg-blue-600 shadow-sm"
                            title={`@${data1.username}: ${val1}`}
                        ></div>
                    </div>
                    {/* Bar for Developer 2 */}
                    <div className="flex flex-col items-center gap-1.5 h-full justify-end w-1/2 max-w-[60px]">
                        <span className="text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-300">{val2}</span>
                        <div 
                            style={{ height: `${height2}%` }} 
                            className="w-full bg-amber-400 rounded-t-lg transition-all duration-500 hover:bg-amber-500 shadow-sm"
                            title={`@${data2.username}: ${val2}`}
                        ></div>
                    </div>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">{label}</span>
            </div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 px-2 sm:px-0">
            <div className="text-center py-6 space-y-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center justify-center gap-2">
                    <GitCompare className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600 shrink-0" /> Side-by-Side Comparison
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm px-2">
                    Benchmark metrics, followers, stars, and code ecosystems between two developers.
                </p>

                <form onSubmit={handleCompareSubmit} className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 px-2 sm:px-0">
                    <input 
                        type="text"
                        value={dev1}
                        onChange={(e) => setDev1(e.target.value)}
                        placeholder="First username (e.g., torvalds)"
                        className="px-4 py-3 bg-white dark:bg-[#1f2028] border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none dark:text-white text-sm"
                    />
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input 
                            type="text"
                            value={dev2}
                            onChange={(e) => setDev2(e.target.value)}
                            placeholder="Second username (e.g., gaearon)"
                            className="w-full sm:flex-1 px-4 py-3 bg-white dark:bg-[#1f2028] border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none dark:text-white text-sm"
                        />
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl shadow-md transition shrink-0"
                        >
                            {loading ? 'Comparing...' : 'Compare'}
                        </button>
                    </div>
                </form>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400 text-sm max-w-xl mx-auto mx-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {data1 && data2 && (
                <div className="space-y-6 px-2 sm:px-0">
                    {token && (
                        <div className="bg-white dark:bg-[#1f2028] border border-gray-200 dark:border-gray-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
                                <input 
                                    type="text"
                                    value={comparisonName}
                                    onChange={(e) => setComparisonName(e.target.value)}
                                    placeholder="Name this comparison group..."
                                    className="w-full sm:w-80 px-4 py-2 bg-gray-50 dark:bg-[#16171d] border border-gray-300 dark:border-gray-700 rounded-lg text-sm dark:text-white"
                                />
                                <button 
                                    onClick={handleSaveComparison}
                                    className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition flex items-center justify-center gap-1.5 shrink-0"
                                >
                                    <Save className="w-4 h-4" /> Save
                                </button>
                            </div>
                            {successMessage && <span className="text-xs text-emerald-600 font-medium text-center">{successMessage}</span>}
                        </div>
                    )}

                    {/* 1. Side-by-Side Detailed Cards First */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[data1, data2].map((dev, idx) => (
                            <div key={idx} className="bg-white dark:bg-[#1f2028] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-5 sm:p-6 space-y-6">
                                <div className="flex items-center gap-4">
                                    <img src={dev.avatar_url} alt={dev.username} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-purple-500/20 shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-1.5 truncate">
                                            <span className="truncate">{dev.username}</span>
                                            <a href={`https://github.com/${dev.username}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-purple-600 shrink-0">
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
                                        <span className="font-bold text-gray-900 dark:text-white truncate max-w-[150px]">{Object.keys(dev.languages)[0] || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 2. Bar Chart Visualization Section Underneath */}
                    <div className="bg-white dark:bg-[#1f2028] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-5 sm:p-8 space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Side-by-Side Profile Metrics Comparison</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Visualizing performance across key GitHub metrics</p>
                            </div>
                            {/* Dynamic Legend with Actual Usernames */}
                            <div className="flex items-center gap-6 text-xs sm:text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-3.5 h-3.5 rounded-md bg-blue-500 inline-block"></span>
                                    <span className="font-bold text-gray-800 dark:text-gray-200">@{data1.username}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3.5 h-3.5 rounded-md bg-amber-400 inline-block"></span>
                                    <span className="font-bold text-gray-800 dark:text-gray-200">@{data2.username}</span>
                                </div>
                            </div>
                        </div>

                        {/* Chart Grid Columns */}
                        <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4">
                            {renderBarGroup("Total Stars", data1.total_stars, data2.total_stars)}
                            {renderBarGroup("Repositories", data1.public_repos, data2.public_repos)}
                            {renderBarGroup("Followers", data1.followers, data2.followers)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}