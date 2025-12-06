import React, { useState } from 'react';
import { Linkedin, Globe, Mail } from 'lucide-react';

// Shared
import { Tab } from './src/shared/types';
import Header from './src/shared/components/Header';

// Features
import Portfolio from './src/features/portfolio/Portfolio';
import Diary from './src/features/diary/Diary';
import FavPlaces from './src/features/fav/FavPlaces';
import CysContainer from './src/features/cys/CysContainer';
import SignIn from './src/features/auth/SignIn';

const App = () => {
  const [activeTab, setActiveTab] = useState<Tab>('PORTFOLIO');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setActiveTab('PORTFOLIO');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('PORTFOLIO');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'PORTFOLIO': return <Portfolio />;
      case 'DIARY': return <Diary isLoggedIn={isLoggedIn} />;
      case 'FAV': return <FavPlaces isLoggedIn={isLoggedIn} />;
      case 'CYS': return <CysContainer isLoggedIn={isLoggedIn} />;
      case 'SIGNIN': return <SignIn onLogin={handleLogin} />;
      default: return <Portfolio />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 font-sans text-slate-800">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      {/* Added pt-24 to compensate for the fixed header (h-20) */}
      <main className="flex-grow w-full pt-24">
        {renderContent()}
      </main>
      <footer className="bg-white border-t border-gray-200 py-8 text-center text-slate-400 text-sm mt-12">
        <div className="flex justify-center gap-6 mb-4">
           <a href="#" className="hover:text-brand-600 transition-colors"><Linkedin size={20}/></a>
           <a href="#" className="hover:text-brand-600 transition-colors"><Globe size={20}/></a>
           <a href="#" className="hover:text-brand-600 transition-colors"><Mail size={20}/></a>
        </div>
        <p>© 2025 Hoang Nang Nguyen. All rights reserved.</p>
      </footer>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        .animate-fade-in-up { animation: fadeIn 0.6s ease-out forwards; }
        .animate-fade-in-down { animation: fadeInDown 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;