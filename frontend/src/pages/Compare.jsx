import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { GitCompare, ExternalLink, AlertCircle, Save, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Compare() {
    const location = useLocation();
    const [usernames, setUsernames] = useState(['', '']);
    const [comparisonName, setComparisonName] = useState('');
    const [developersData, setDevelopersData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { token } = useAuth();

    useEffect(() => {
        if (location.state?.usernames && location.state.usernames.length >= 2) {
            setUsernames(location.state.usernames);
            executeComparison(location.state.usernames);
        }
    }, [location.state]);

    const executeComparison = async (listToCompare) => {
        const validNames = listToCompare.map(n => n.trim()).filter(Boolean);
        if (validNames.length < 2) {
            setError('Please enter at least two valid GitHub usernames to compare.');
            return;
        }

        setLoading(true);
        setError('');
        setDevelopersData([]);

        try {
            const requests = validNames.map(name => axios.get(`http://localhost:5000/api/github/profile/${name}`));
            const responses = await Promise.all(requests);
            setDevelopersData(responses.map(res => res.data.developer));
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch one or more developer profiles');
        } finally {
            setLoading(false);
        }
    };

    const handleCompareSubmit = (e) => {
        e.preventDefault();
        executeComparison(usernames);
    };

    const handleAddUsernameField = () => {
        if (usernames.length < 4) {
            setUsernames([...usernames, '']);
        }
    };

    const handleRemoveUsernameField = (index) => {
        if (usernames.length > 2) {
            const updated = usernames.filter((_, i) => i !== index);
            setUsernames(updated);
        }
    };

    const handleUsernameChange = (index, value) => {
        const updated = [...usernames];
        updated[index] = value;
        setUsernames(updated);
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
            const validNames = developersData.map(d => d.username);
            await axios.post(
                'http://localhost:5000/api/curation/comparisons',
                { name: comparisonName, usernames: validNames },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccessMessage('Comparison saved successfully!');
        } catch (err) {
            alert('Failed to save comparison');
        }
    };

    const renderBarGroup = (label, metricKey) => {
        const values = developersData.map(dev => dev[metricKey] || 0);
        const maxVal = Math.max(...values, 1);
        const colors = ['bg-blue-500', 'bg-amber-400', 'bg-emerald-500', 'bg-purple-500'];

        return (
            <div className="flex flex-col items-center h-full justify-end gap-3">
                <div className="flex items-end justify-center gap-2 sm:gap-4 w-full h-48 sm:h-56 pb-2 px-1 border-b border-gray-200 dark:border-gray-800">
                    {developersData.map((dev, idx) => {
                        const val = dev[metricKey] || 0;
                        const heightPct = Math.max(Math.round((val / maxVal) * 100), 12);
                        return (
                            <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end w-1/4 max-w-[50px]">
                                <span className="text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-300">{val}</span>
                                <div 
                                    style={{ height: `${heightPct}%` }} 
                                    className={`w-full ${colors[idx % colors.length]} rounded-t-lg transition-all duration-500 shadow-sm`}
                                    title={`@${dev.username}: ${val}`}
                                ></div>
                            </div>
                        );
                    })}
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">{label}</span>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 px-2 sm:px-0">
            <div className="text-center py-6 space-y-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center justify-center gap-2">
                    <GitCompare className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600 shrink-0" /> Side-by-Side Comparison
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm px-2">
                    Benchmark metrics, followers, stars, and code ecosystems across multiple developers.
                </p>

                <form onSubmit={handleCompareSubmit} className="max-w-4xl mx-auto mt-6 px-2 sm:px-0">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-3">
                        {usernames.map((name, idx) => (
                            <div key={idx} className="relative w-full md:w-64 flex items-center">
                                <input 
                                    type="text"
                                    value={name}
                                    onChange={(e) => handleUsernameChange(idx, e.target.value)}
                                    placeholder={`Username ${idx + 1} (e.g. torvalds)`}
                                    className="w-full h-12 px-4 bg-white dark:bg-[#1f2028] border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none dark:text-white text-sm"
                                    required={idx < 2}
                                />
                                {usernames.length > 2 && (
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveUsernameField(idx)}
                                        className="absolute right-3 text-gray-400 hover:text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}

                        {usernames.length < 4 && (
                            <button
                                type="button"
                                onClick={handleAddUsernameField}
                                className="h-12 px-4 border border-dashed border-gray-400 dark:border-gray-600 hover:border-purple-500 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium flex items-center gap-1.5 transition shrink-0"
                                title="Add another user"
                            >
                                <Plus className="w-4 h-4" /> Add
                            </button>
                        )}

                        <button 
                            type="submit"
                            disabled={loading}
                            className="h-12 px-8 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl shadow-md transition shrink-0 flex items-center justify-center text-sm"
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

            {developersData.length > 0 && (
                <div className="space-y-6 px-2 sm:px-0">
                    {/* Reverted Saving Toolbar without the odd background wrapping block */}
                    {token && (
                        <div className="max-w-xl mx-auto flex items-center gap-3 py-2">
                            <input 
                                type="text"
                                value={comparisonName}
                                onChange={(e) => setComparisonName(e.target.value)}
                                placeholder="Name this comparison group..."
                                className="flex-1 h-11 px-4 bg-white dark:bg-[#1f2028] border border-gray-300 dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                            />
                            <button 
                                onClick={handleSaveComparison}
                                className="h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm transition flex items-center gap-1.5 shrink-0 shadow-sm"
                            >
                                <Save className="w-4 h-4" /> Save
                            </button>
                            {successMessage && <span className="text-xs text-emerald-600 font-medium ml-2">{successMessage}</span>}
                        </div>
                    )}

                    {/* 1. Side-by-Side Detailed Cards */}
                    <div className={`grid grid-cols-1 md:grid-cols-${Math.min(developersData.length, 3)} gap-6`}>
                        {developersData.map((dev, idx) => (
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

                    {/* 2. Bar Chart Visualization Section */}
                    <div className="bg-white dark:bg-[#1f2028] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-5 sm:p-8 space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Side-by-Side Profile Metrics Comparison</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Visualizing performance across key GitHub metrics</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
                                {developersData.map((dev, idx) => {
                                    const dotColors = ['bg-blue-500', 'bg-amber-400', 'bg-emerald-500', 'bg-purple-500'];
                                    return (
                                        <div key={idx} className="flex items-center gap-2">
                                            <span className={`w-3.5 h-3.5 rounded-md ${dotColors[idx % dotColors.length]} inline-block`}></span>
                                            <span className="font-bold text-gray-800 dark:text-gray-200">@{dev.username}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4">
                            {renderBarGroup("Total Stars", "total_stars")}
                            {renderBarGroup("Repositories", "public_repos")}
                            {renderBarGroup("Followers", "followers")}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}