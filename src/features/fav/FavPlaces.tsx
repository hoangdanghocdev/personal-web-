import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MapPin, 
  Search, 
  Star 
} from 'lucide-react';
import { FavPlace } from './types';
import { UserAction } from '../../shared/types';
import { STORAGE_KEYS, getStorage, setStorage, generateId } from '../../shared/utils';

interface FavPlacesProps {
  isLoggedIn: boolean;
}

const FavPlaces: React.FC<FavPlacesProps> = ({ isLoggedIn }) => {
  const [favs, setFavs] = useState<FavPlace[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [userAction, setUserAction] = useState<UserAction>(getStorage(STORAGE_KEYS.USER_ACTION, { likedItems: [], lastRequestTime: 0 }));
  const [newFav, setNewFav] = useState<Partial<FavPlace>>({ rate: 5, tags: [] });

  useEffect(() => { setFavs(getStorage(STORAGE_KEYS.FAVS, [])); }, []);

  const handleAddFav = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFav.name || !newFav.review) return;
    const place: FavPlace = {
      id: generateId(),
      name: newFav.name,
      review: newFav.review,
      rate: newFav.rate || 5,
      image: newFav.image || 'https://picsum.photos/400/300', 
      tags: [],
      likes: 0
    };
    const updated = [place, ...favs];
    setFavs(updated);
    setStorage(STORAGE_KEYS.FAVS, updated);
    setShowAddForm(false);
    setNewFav({ rate: 5, tags: [] });
  };

  const handleLike = (id: string) => {
    if (userAction.likedItems.includes(id)) return;
    const updated = favs.map(f => f.id === id ? { ...f, likes: f.likes + 1 } : f);
    setFavs(updated);
    setStorage(STORAGE_KEYS.FAVS, updated);
    const newUA = { ...userAction, likedItems: [...userAction.likedItems, id] };
    setUserAction(newUA);
    setStorage(STORAGE_KEYS.USER_ACTION, newUA);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><MapPin className="text-brand-600"/> My Favorite Places</h2>
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" placeholder="Search places..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-brand-500 focus:outline-none"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isLoggedIn && (
            <button onClick={() => setShowAddForm(!showAddForm)} className="bg-brand-600 text-white px-4 py-2 rounded-full hover:bg-brand-700 transition shadow-lg shadow-brand-200/50">
              {showAddForm ? 'Close' : 'Add Place'}
            </button>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-brand-100 mb-8 animate-fade-in">
          <h3 className="font-bold text-lg mb-4">Add New Review</h3>
          <form onSubmit={handleAddFav} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required placeholder="Place Name" className="border p-2 rounded" value={newFav.name || ''} onChange={e => setNewFav({...newFav, name: e.target.value})} />
              <input placeholder="Image URL (optional)" className="border p-2 rounded" value={newFav.image || ''} onChange={e => setNewFav({...newFav, image: e.target.value})} />
            </div>
            <textarea required placeholder="Review content..." className="border p-2 rounded w-full" rows={3} value={newFav.review || ''} onChange={e => setNewFav({...newFav, review: e.target.value})} />
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">Rating:</span>
              <select className="border p-1 rounded" value={newFav.rate} onChange={e => setNewFav({...newFav, rate: Number(e.target.value)})}>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Stars</option>)}
              </select>
            </div>
            <button type="submit" className="bg-brand-600 text-white px-6 py-2 rounded hover:bg-brand-700">Submit</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favs.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map(fav => (
          <div key={fav.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
            <div className="h-48 overflow-hidden bg-gray-200 relative">
               <img src={fav.image} alt={fav.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
               <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-sm">
                 <Star size={12} className="text-yellow-500" fill="currentColor"/> {fav.rate}
               </div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="font-bold text-lg text-slate-900 mb-2">{fav.name}</h3>
              <p className="text-slate-600 text-sm mb-4 flex-grow line-clamp-3">{fav.review}</p>
              <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-auto">
                 <button 
                  onClick={() => handleLike(fav.id)}
                  disabled={userAction.likedItems.includes(fav.id)}
                  className={`flex items-center gap-1 text-sm transition-colors ${userAction.likedItems.includes(fav.id) ? 'text-brand-600' : 'text-slate-400 hover:text-brand-600'}`}
                 >
                   <Heart size={16} fill={userAction.likedItems.includes(fav.id) ? "currentColor" : "none"} />
                   {fav.likes}
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavPlaces;