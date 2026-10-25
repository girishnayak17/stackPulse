import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-gray-50 dark:bg-[#16171d] text-gray-900 dark:text-gray-100">
                    <Navbar />
                    <main className="max-w-7xl mx-auto px-6 py-8">
                        <Routes>
                            <Route path="/" element={<div className="text-center py-20"><h1 className="text-3xl font-bold">Search & Analyze Page</h1><p className="text-gray-500 mt-2">Coming up next!</p></div>} />
                            <Route path="/compare" element={<div className="text-center py-20"><h1 className="text-3xl font-bold">Developer Comparison Page</h1><p className="text-gray-500 mt-2">Coming up next!</p></div>} />
                            <Route path="/saved" element={<div className="text-center py-20"><h1 className="text-3xl font-bold">Saved & Pinned Repositories</h1><p className="text-gray-500 mt-2">Coming up next!</p></div>} />
                            <Route path="/login" element={<div className="text-center py-20"><h1 className="text-3xl font-bold">Login Page</h1><p className="text-gray-500 mt-2">Coming up next!</p></div>} />
                            <Route path="/signup" element={<div className="text-center py-20"><h1 className="text-3xl font-bold">Sign Up Page</h1><p className="text-gray-500 mt-2">Coming up next!</p></div>} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}