import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Camera, 
  Send, 
  CheckCircle2,
  BookHeart
} from 'lucide-react';
import { DiaryEntry } from './types';
import { UserAction } from '../../shared/types';
import { STORAGE_KEYS, getStorage, setStorage, generateId, formatDate } from '../../shared/utils';

interface DiaryProps {
  isLoggedIn: boolean;
}

const Diary: React.FC<DiaryProps> = ({ isLoggedIn }) => {
  const [posts, setPosts] = useState<DiaryEntry[]>([]);
  const [newContent, setNewContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userAction, setUserAction] = useState<UserAction>(
    getStorage(STORAGE_KEYS.USER_ACTION, { likedItems: [], lastRequestTime: 0 })
  );

  useEffect(() => { setPosts(getStorage(STORAGE_KEYS.DIARY, [])); }, []);

  const handlePost = () => {
    if (!newContent && !file) return;
    
    let mediaUrl = '';
    let mediaType: 'image' | 'video' | 'none' = 'none';

    if (file) {
      mediaUrl = URL.createObjectURL(file);
      mediaType = file.type.startsWith('image') ? 'image' : 'video';
    }

    const newPost: DiaryEntry = {
      id: generateId(),
      content: newContent,
      mediaType,
      mediaUrl,
      likes: 0,
      date: new Date().toISOString()
    };

    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    setStorage(STORAGE_KEYS.DIARY, updatedPosts);
    
    setNewContent('');
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLike = (postId: string) => {
    if (userAction.likedItems.includes(postId)) return;
    const updated = posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p);
    setPosts(updated);
    setStorage(STORAGE_KEYS.DIARY, updated);

    const newUserAction = { ...userAction, likedItems: [...userAction.likedItems, postId] };
    setUserAction(newUserAction);
    setStorage(STORAGE_KEYS.USER_ACTION, newUserAction);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 animate-fade-in">
      {isLoggedIn && (
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
          <textarea
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
            rows={3}
            placeholder="What's on your mind, Hoang?"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          {file && (
            <div className="mt-2 relative inline-block">
               <span className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded flex items-center gap-1">
                 <CheckCircle2 size={12}/> {file.name}
                 <button onClick={() => { setFile(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} className="ml-1 text-red-500 font-bold">×</button>
               </span>
            </div>
          )}
          <div className="flex justify-between items-center mt-3">
            <div className="relative">
              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*,video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                <Camera size={18} />
                <span className="text-xs font-medium">Add Photo/Video</span>
              </label>
            </div>
            <button onClick={handlePost} className="bg-brand-600 text-white px-6 py-1.5 rounded-full hover:bg-brand-700 transition-colors font-medium text-sm flex items-center gap-2">
              <Send size={14}/> Post
            </button>
          </div>
        </div>
      )}

      {posts.length === 0 && (
          <div className="text-center py-10 text-slate-400">
              <BookHeart size={48} strokeWidth={1} className="mx-auto mb-3 opacity-50"/>
              <p>No diary entries yet.</p>
          </div>
      )}

      {posts.map(post => (
        <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up">
          <div className="p-4 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">HN</div>
             <div>
                <h4 className="font-bold text-slate-900 text-sm">Hoang Nang Nguyen</h4>
                <p className="text-xs text-slate-500">{formatDate(post.date)}</p>
             </div>
          </div>
          <div className="px-4 pb-2">
            <p className="text-slate-800 whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
          </div>
          {post.mediaType !== 'none' && (
            <div className="mt-2 bg-black w-full flex justify-center">
              {post.mediaType === 'image' ? (
                <img src={post.mediaUrl} alt="Post media" className="max-h-[500px] object-contain w-full" />
              ) : (
                <video src={post.mediaUrl} controls className="max-h-[500px] w-full" />
              )}
            </div>
          )}
          <div className="p-3 border-t border-gray-100 flex items-center justify-between">
             <button 
                onClick={() => handleLike(post.id)}
                disabled={userAction.likedItems.includes(post.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                  userAction.likedItems.includes(post.id) ? 'text-brand-600 bg-brand-50' : 'text-slate-500 hover:bg-gray-100'
                }`}
             >
               <Heart size={18} fill={userAction.likedItems.includes(post.id) ? "currentColor" : "none"} />
               <span className="font-medium">{post.likes}</span>
             </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Diary;