import React, { useState } from 'react';
import axios from 'axios';
import { Search as SearchIcon, Star, BookOpen, ExternalLink, Bookmark, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Search() {
    const [username, setUsername] = useState('');
    const [developerData, setDeveloperData] = useState(null);
    const [repositories, setRepositories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pinnedRepos, setPinnedRepos] = useState({});
    const { token } = useAuth();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!username.trim()) return;

        setLoading(true);
        setError('');
        setDeveloperData(null);
        setRepositories([]);

        try {
            const response = await axios.get(`http://localhost:5000/api/github/profile/${username.trim()}`);
            setDeveloperData(response.data.developer);
            setRepositories(response.data.repositories);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch developer data from GitHub');
        } finally {
            setLoading(false);
        }
    };

    const handlePinRepo = async (repoId) => {
        if (!token) {
            alert('Please login to pin repositories.');
            return;
        }

        try {
            await axios.post(
                'http://localhost:5000/api/curation/pins',
                { repo_id: repoId, note: 'Saved from search', tags: ['frontend/backend'] },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPinnedRepos((prev) => ({ ...prev, [repoId]: true }));
        } catch (err) {
            alert('Failed to pin repository');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 px-2 sm:px-0">
            {/* Hero Search Section */}
            <div className="text-center py-6 sm:py-8 space-y-4">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    Explore & Analyze GitHub Developers
                </h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm sm:text-base px-2">
                    Search any GitHub handle to inspect statistics, primary language distributions, repository stars, and insights.
                </p>

                {/* Mobile-friendly stacking search form */}
                <form onSubmit={handleSearch} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3 mt-6 px-2 sm:px-0">
                    <div className="relative flex-1">
                        <SearchIcon className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                        <input 
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter GitHub username..."
                            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#1f2028] border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:outline-none dark:text-white text-sm"
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl shadow-lg shadow-purple-600/20 transition flex items-center justify-center shrink-0"
                    >
                        {loading ? 'Analyzing...' : 'Search'}
                    </button>
                </form>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400 text-sm max-w-xl mx-auto mx-2 sm:mx-auto">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Developer Profile Card */}
            {developerData && (
                <div className="bg-white dark:bg-[#1f2028] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-5 sm:p-8 space-y-6 mx-2 sm:mx-0">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <img 
                            src={developerData.avatar_url} 
                            alt={developerData.username} 
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-purple-500/20 shadow-md"
                        />
                        <div className="text-center sm:text-left flex-1 w-full">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center sm:justify-start gap-2 break-all">
                                {developerData.username}
                                <a 
                                    href={`https://github.com/${developerData.username}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-gray-400 hover:text-purple-600 transition shrink-0"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </a>
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4">
                                <div className="bg-gray-50 dark:bg-[#16171d] p-3 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Followers</p>
                                    <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-1">{developerData.followers}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-[#16171d] p-3 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Public Repos</p>
                                    <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-1">{developerData.public_repos}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-[#16171d] p-3 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Stars</p>
                                    <p className="text-base sm:text-lg font-bold text-purple-600 dark:text-purple-400 mt-1">{developerData.total_stars}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-[#16171d] p-3 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Top Language</p>
                                    <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-1 truncate">
                                        {Object.keys(developerData.languages)[0] || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Repositories Section */}
            {repositories.length > 0 && (
                <div className="space-y-4 px-2 sm:px-0">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-purple-600" /> Repositories ({repositories.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {repositories.map((repo) => (
                            <div 
                                key={repo.id}
                                className="bg-white dark:bg-[#1f2028] border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start gap-2">
                                        <a 
                                            href={`https://github.com/${developerData.username}/${repo.name}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1.5 break-all text-sm sm:text-base"
                                        >
                                            {repo.name}
                                            <ExternalLink className="w-4 h-4 shrink-0" />
                                        </a>
                                        <button 
                                            onClick={() => handlePinRepo(repo.id)}
                                            className={`p-2 rounded-lg border transition flex items-center gap-1 text-xs font-medium shrink-0 ${
                                                pinnedRepos[repo.id]
                                                    ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 text-purple-600 dark:text-purple-300'
                                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            {pinnedRepos[repo.id] ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                                            <span className="hidden sm:inline">{pinnedRepos[repo.id] ? 'Pinned' : 'Pin'}</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mt-6 text-xs text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
                                        {repo.primary_language}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-amber-500" /> {repo.stars} stars
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}