import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bookmark, GitCompare, Star, Trash2, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SavedPins() {
    const [pins, setPins] = useState([]);
    const [comparisons, setComparisons] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) return;
        fetchSavedData();
    }, [token]);

    const fetchSavedData = async () => {
        try {
            const [pinsRes, compsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/curation/pins', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:5000/api/curation/comparisons', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setPins(pinsRes.data.pins || []);
            setComparisons(compsRes.data.comparisons || []);
        } catch (err) {
            console.error('Failed to fetch saved data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteComparison = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this comparison?')) return;

        try {
            await axios.delete(`http://localhost:5000/api/curation/comparisons/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComparisons(comparisons.filter(c => c.id !== id));
        } catch (err) {
            alert('Failed to delete comparison');
        }
    };

    const handleDeletePin = async (repoId, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to remove this pin?')) return;

        try {
            await axios.delete(`http://localhost:5000/api/curation/pins/${repoId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPins(pins.filter(p => p.repo_id !== repoId));
        } catch (err) {
            alert('Failed to remove pin');
        }
    };

    const handleOpenComparison = (usernames) => {
        navigate('/compare', { state: { usernames } });
    };

    const handleOpenRepo = (username, repoName) => {
        window.open(`https://github.com/${username}/${repoName}`, '_blank');
    };

    if (!token) {
        return (
            <div className="text-center py-20 px-4">
                <h2 className="text-xl sm:text-2xl font-bold">Please log in to view your saved pins and comparisons.</h2>
            </div>
        );
    }

    if (loading) {
        return <div className="text-center py-20 text-gray-500">Loading your saved items...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 px-2 sm:px-0">
            <div className="text-center py-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Your Saved Curation Data</h1>
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1 px-2">Manage your pinned repositories and saved developer comparison groups.</p>
            </div>

            {/* Saved Comparisons Section */}
            <div className="space-y-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <GitCompare className="w-5 h-5 text-purple-600" /> Saved Comparisons ({comparisons.length})
                </h2>
                {comparisons.length === 0 ? (
                    <p className="text-sm text-gray-500 bg-white dark:bg-[#1f2028] p-6 rounded-xl border border-gray-200 dark:border-gray-800">No saved comparisons yet. Go to the Compare page to save some!</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {comparisons.map((comp) => (
                            <div 
                                key={comp.id} 
                                onClick={() => handleOpenComparison(comp.usernames)}
                                className="bg-white dark:bg-[#1f2028] border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-5 shadow-sm hover:border-purple-500 cursor-pointer transition flex flex-col justify-between space-y-4"
                            >
                                <div>
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-base truncate">{comp.name}</h3>
                                        <button 
                                            onClick={(e) => handleDeleteComparison(comp.id, e)}
                                            className="text-gray-400 hover:text-red-600 p-1.5 transition shrink-0"
                                            title="Delete comparison"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {comp.usernames?.map((u, i) => (
                                            <span key={i} className="text-xs px-2 py-1 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 rounded-md">
                                                @{u}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400 flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800">
                                    <span>Created: {new Date(comp.created_at).toLocaleDateString()}</span>
                                    <span className="text-purple-600 dark:text-purple-400 font-medium">Click to open &rarr;</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pinned Repositories Section */}
            <div className="space-y-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-purple-600" /> Pinned Repositories ({pins.length})
                </h2>
                {pins.length === 0 ? (
                    <p className="text-sm text-gray-500 bg-white dark:bg-[#1f2028] p-6 rounded-xl border border-gray-200 dark:border-gray-800">No pinned repositories yet. Browse profiles and click Pin on any repository!</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pins.map((pin) => (
                            <div 
                                key={pin.id} 
                                onClick={() => handleOpenRepo(pin.github_username, pin.repo_name)}
                                className="bg-white dark:bg-[#1f2028] border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-5 shadow-sm hover:border-purple-500 cursor-pointer transition flex flex-col justify-between space-y-4"
                            >
                                <div>
                                    <div className="flex justify-between items-start gap-2">
                                        <span className="text-xs font-semibold px-2.5 py-1 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 rounded-md truncate max-w-[150px]">
                                            @{pin.github_username}
                                        </span>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="flex items-center gap-1 text-xs text-amber-500">
                                                <Star className="w-4 h-4 fill-amber-500" /> {pin.stars}
                                            </span>
                                            <button 
                                                onClick={(e) => handleDeletePin(pin.repo_id, e)}
                                                className="text-gray-400 hover:text-red-600 p-1.5 transition"
                                                title="Remove pin"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mt-2 flex items-center gap-1.5 hover:text-purple-600 transition break-all text-sm sm:text-base">
                                        {pin.repo_name} <ExternalLink className="w-4 h-4 shrink-0" />
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1 italic break-words">Note: "{pin.note}"</p>
                                </div>
                                <div className="text-xs text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                                    <span>Primary Language: <span className="font-medium text-gray-700 dark:text-gray-300">{pin.primary_language || 'N/A'}</span></span>
                                    <span className="text-purple-600 dark:text-purple-400 font-medium self-end sm:self-auto">View on GitHub &rarr;</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}