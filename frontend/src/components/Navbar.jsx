import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GitBranch, LogOut, User, Menu, X } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        navigate('/login');
    };

    const closeMenu = () => setIsOpen(false);

    return (
        <nav className="w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16171d] px-4 sm:px-6 py-4 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link to="/" onClick={closeMenu} className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                    <GitBranch className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    <span>Stack<span className="text-purple-600 dark:text-purple-400">Pulse</span></span>
                </Link>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-6">
                    <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition">
                        Search & Analyze
                    </Link>
                    <Link to="/compare" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition">
                        Compare
                    </Link>
                    {user && (
                        <Link to="/saved" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition">
                            Saved & Pins
                        </Link>
                    )}
                </div>

                {/* Desktop Auth Actions */}
                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                                <User className="w-4 h-4" /> {user.email}
                            </span>
                            <button 
                                onClick={handleLogout}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                            >
                                <LogOut className="w-4 h-4" /> Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link 
                                to="/login"
                                className="px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 transition"
                            >
                                Login
                            </Link>
                            <Link 
                                to="/signup"
                                className="px-4 py-1.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Hamburger Button */}
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 focus:outline-none"
                    aria-label="Toggle Menu"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Dropdown Menu */}
            {isOpen && (
                <div className="md:hidden mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col space-y-3 pb-2 animate-fadeIn">
                    <Link 
                        to="/" 
                        onClick={closeMenu}
                        className="text-gray-600 dark:text-gray-300 hover:text-purple-600 font-medium py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                        Search & Analyze
                    </Link>
                    <Link 
                        to="/compare" 
                        onClick={closeMenu}
                        className="text-gray-600 dark:text-gray-300 hover:text-purple-600 font-medium py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                        Compare
                    </Link>
                    {user && (
                        <Link 
                            to="/saved" 
                            onClick={closeMenu}
                            className="text-gray-600 dark:text-gray-300 hover:text-purple-600 font-medium py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                        >
                            Saved & Pins
                        </Link>
                    )}
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2">
                        {user ? (
                            <>
                                <span className="text-xs text-gray-500 dark:text-gray-400 px-3 flex items-center gap-1 truncate">
                                    <User className="w-3.5 h-3.5 shrink-0" /> {user.email}
                                </span>
                                <button 
                                    onClick={handleLogout}
                                    className="flex items-center justify-center gap-1 w-full py-2.5 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-950/30 rounded-lg transition"
                                >
                                    <LogOut className="w-4 h-4" /> Logout
                                </button>
                            </>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <Link 
                                    to="/login"
                                    onClick={closeMenu}
                                    className="text-center py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg"
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/signup"
                                    onClick={closeMenu}
                                    className="text-center py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg shadow-sm"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}