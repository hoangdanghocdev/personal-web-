import React, { useState } from 'react';
import { 
  LayoutTemplate, 
  Sparkles, 
  Gem, 
  CalendarClock, 
  LogOut, 
  LogIn, 
  X, 
  Menu 
} from 'lucide-react';
import { Tab } from '../types';

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, isLoggedIn, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { 
      id: 'PORTFOLIO', 
      label: 'Portfolio', 
      icon: <LayoutTemplate size={18} strokeWidth={2} />, 
      activeClass: 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200' 
    },
    { 
      id: 'DIARY', 
      label: 'Dump', 
      icon: <Sparkles size={18} strokeWidth={2} />, 
      activeClass: 'bg-white text-pink-600 shadow-sm ring-1 ring-slate-200' 
    },
    { 
      id: 'FAV', 
      label: 'Gems', 
      icon: <Gem size={18} strokeWidth={2} />, 
      activeClass: 'bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200' 
    },
    { 
      id: 'CYS', 
      label: 'CYS', 
      icon: <CalendarClock size={18} strokeWidth={2} />, 
      activeClass: 'bg-white text-orange-600 shadow-sm ring-1 ring-slate-200' 
    },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo / Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setActiveTab('PORTFOLIO')}
          >
            <div className="w-10 h-10 bg-gradient-to-tr from-brand-600 to-brand-400 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-brand-200 group-hover:shadow-brand-300 transition-all duration-300 transform group-hover:scale-105">
              HN
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-slate-800 tracking-tight leading-none group-hover:text-brand-700 transition-colors">HOANG NGUYEN</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mt-0.5">Portfolio</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-200/50 backdrop-blur-sm">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`
                    relative flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300
                    ${isActive 
                      ? item.activeClass
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                    }
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Side: Auth Buttons */}
          <div className="hidden md:flex items-center">
            {isLoggedIn ? (
              <button 
                onClick={onLogout} 
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 font-medium text-sm transition-all border border-red-100 group"
              >
                <LogOut size={16} strokeWidth={2} className="group-hover:-translate-x-0.5 transition-transform"/>
                <span>Sign Out</span>
              </button>
            ) : (
              <button 
                onClick={() => setActiveTab('SIGNIN')}
                className={`
                  flex items-center gap-2 px-5 py-2 rounded-full font-medium text-sm transition-all border shadow-sm hover:shadow-md transform hover:-translate-y-0.5
                  ${activeTab === 'SIGNIN' 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' 
                    : 'bg-slate-900 text-white hover:bg-slate-800 border-transparent'
                  }
                `}
              >
                <LogIn size={16} strokeWidth={2} />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              {isOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-xl animate-fade-in-down">
          <div className="p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as Tab); setIsOpen(false); }}
                className={`flex items-center w-full gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                   activeTab === item.id ? item.activeClass : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
            <div className="h-px bg-slate-100 my-2"></div>
             {isLoggedIn ? (
                <button onClick={() => { onLogout(); setIsOpen(false); }} className="flex items-center w-full gap-3 px-4 py-3 text-red-600 font-medium hover:bg-red-50 rounded-xl">
                  <LogOut size={20} strokeWidth={1.5} />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button onClick={() => { setActiveTab('SIGNIN'); setIsOpen(false); }} className="flex items-center w-full gap-3 px-4 py-3 text-slate-700 font-medium hover:bg-slate-50 rounded-xl">
                  <LogIn size={20} strokeWidth={1.5} />
                  <span>Sign In</span>
                </button>
              )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;