import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, LucideIcon, Circle } from 'lucide-react';

export interface PurposeOption {
  id: string;
  label: string;
  icon?: LucideIcon;
  color?: string;
  bg?: string;
}

interface PurposeSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: PurposeOption[];
  placeholder?: string;
}

const PurposeSelect: React.FC<PurposeSelectProps> = ({ 
  value, 
  onChange, 
  options,
  placeholder = "Select purpose..." 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.id === value);

  return (
    <div className="relative w-full z-10" ref={containerRef}>
      {/* Trigger Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full p-3.5 flex items-center justify-between
          bg-white border rounded-xl cursor-pointer transition-all duration-200
          ${isOpen 
            ? 'border-brand-500 ring-4 ring-brand-500/10 shadow-lg' 
            : 'border-slate-200 hover:border-brand-300 hover:shadow-sm'
          }
        `}
      >
        <div className="flex items-center gap-3">
          {selectedOption ? (
            <>
              {selectedOption.icon ? (
                <div className={`p-2 rounded-lg ${selectedOption.bg || 'bg-slate-100'} ${selectedOption.color || 'text-slate-600'}`}>
                  <selectedOption.icon size={18} strokeWidth={2.5} />
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-slate-50 text-slate-400">
                    <Circle size={18} strokeWidth={2.5} />
                </div>
              )}
              <span className="font-bold text-slate-700">{selectedOption.label}</span>
            </>
          ) : (
            <span className="text-slate-400 font-medium ml-1">{placeholder}</span>
          )}
        </div>
        
        <ChevronDown 
          size={18} 
          className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[300px] overflow-y-auto z-50">
          <ul className="py-1">
            {options.map((option) => {
              const isSelected = option.id === value;
              const Icon = option.icon || Circle;
              
              return (
                <li 
                  key={option.id}
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                  className={`
                    px-4 py-3 flex items-center justify-between cursor-pointer transition-colors
                    ${isSelected ? 'bg-brand-50' : 'hover:bg-slate-50'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${option.bg || 'bg-slate-100'} ${option.color || 'text-slate-500'}`}>
                        <Icon size={16} strokeWidth={2.5} />
                    </div>
                    <span className={`text-sm ${isSelected ? 'font-bold text-brand-700' : 'font-medium text-slate-700'}`}>
                      {option.label}
                    </span>
                  </div>
                  
                  {isSelected && <Check size={18} className="text-brand-600" strokeWidth={3} />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PurposeSelect;