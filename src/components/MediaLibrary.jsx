import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';

const MediaLibrary = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'mediaLibrary'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mediaData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMedia(mediaData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    alert('URL copied to clipboard!');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this image from your Media Library? (This only removes the record here, not from Cloudinary/Firebase directly)')) return;
    try {
      await deleteDoc(doc(db, 'mediaLibrary', id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete');
    }
  };

  if (loading) return <div className="p-8 text-center text-dim">Loading library...</div>;

  return (
    <div className="card">
      <div className="card-title">Media Library</div>
      <p className="hint mb-6">All images you upload are stored here. Click to copy the URL.</p>
      
      {media.length === 0 ? (
        <div className="text-center py-12 text-dim bg-surface2 rounded-xl border border-white/5">
          No media uploaded yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <AnimatePresence>
            {media.map((item) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group bg-surface2 rounded-lg overflow-hidden border border-white/5 aspect-square flex items-center justify-center"
              >
                {item.type === 'video' ? (
                  <video src={item.url} className="w-full h-full object-cover opacity-80" />
                ) : (
                  <img src={item.url} alt="Media" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" />
                )}
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                  <button 
                    onClick={() => copyToClipboard(item.url)} 
                    className="btn btn-sm btn-primary w-24"
                  >
                    Copy URL
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)} 
                    className="btn btn-sm btn-outline text-danger border-danger/30 hover:bg-danger hover:text-white w-24"
                  >
                    Delete
                  </button>
                </div>
                
                {item.storage === 'cloudinary' && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg uppercase tracking-wider">
                    Cloudinary
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
