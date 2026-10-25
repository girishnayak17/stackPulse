import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bookmark, GitCompare, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SavedPins() {
    const [pins, setPins] = useState([]);
    const [comparisons, setComparisons] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
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

        fetchData();
    }, [token]);

    if (!token) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold">Please log in to view your saved pins and comparisons.</h2>
            </div>
        );
    }

    if (loading) {
        return <div className="text-center py-20 text-gray-500">Loading your saved items...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            <div className="text-center py-4">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Your Saved Curation Data</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your pinned repositories and saved developer comparison groups.</p>
            </div>

            {/* Saved Comparisons Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <GitCompare className="w-5 h-5 text-purple-600" /> Saved Comparisons ({comparisons.length})
                </h2>
                {comparisons.length === 0 ? (
                    <p className="text-sm text-gray-500 bg-white dark:bg-[#1f2028] p-6 rounded-xl border border-gray-200 dark:border-gray-800">No saved comparisons yet. Go to the Compare page to save some!</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {comparisons.map((comp) => (
                            <div key={comp.id} className="bg-white dark:bg-[#1f2028] border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm space-y-2">
                                <h3 className="font-bold text-gray-900 dark:text-white">{comp.name}</h3>
                                <p className="text-xs text-gray-500">Created on: {new Date(comp.created_at).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pinned Repositories Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-purple-600" /> Pinned Repositories ({pins.length})
                </h2>
                {pins.length === 0 ? (
                    <p className="text-sm text-gray-500 bg-white dark:bg-[#1f2028] p-6 rounded-xl border border-gray-200 dark:border-gray-800">No pinned repositories yet. Browse profiles and click Pin on any repository!</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pins.map((pin) => (
                            <div key={pin.id} className="bg-white dark:bg-[#1f2028] border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-semibold px-2.5 py-1 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 rounded-md">
                                            @{pin.github_username}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-amber-500">
                                            <Star className="w-4 h-4 fill-amber-500" /> {pin.stars}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mt-2">{pin.repo_name}</h4>
                                    <p className="text-xs text-gray-500 mt-1 italic">Note: "{pin.note}"</p>
                                </div>
                                <div className="text-xs text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                                    Primary Language: <span className="font-medium text-gray-700 dark:text-gray-300">{pin.primary_language || 'N/A'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}