import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { uploadToCloudinary } from '../lib/cloudinary';
import { siteSettings as defaultSettings } from '../config/siteSettings';

const AdminSettings = () => {
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    heroImages: [],
    aboutImages: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "global");
        const docSnap = await getDoc(docRef);
        
        let currentSettings = { ...defaultSettings };
        if (docSnap.exists()) {
          currentSettings = { ...currentSettings, ...docSnap.data() };
        }
        
        setFormData({
          heroImages: currentSettings.heroImages || [],
          aboutImages: currentSettings.aboutImages || (currentSettings.aboutImage ? [currentSettings.aboutImage] : [])
        });
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleArrayChange = (field, index, value) => {
    const newArr = [...formData[field]];
    newArr[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArr }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (e, field, index) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      handleArrayChange(field, index, url);
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlUpload = async (field, index) => {
    const url = prompt('Enter image URL to fetch and upload to Cloudinary:');
    if (!url) return;

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      alert('Please add YouTube links as video features, not images.');
      return;
    }

    setUploading(true);
    try {
      const cloudinaryUrl = await uploadToCloudinary(url);
      handleArrayChange(field, index, cloudinaryUrl);
    } catch (err) {
      console.error(err);
      alert('URL Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSyncToCloudinary = async (field, index) => {
    const currentUrl = formData[field][index];

    if (!currentUrl) {
      alert("No URL to sync!");
      return;
    }

    if (currentUrl.includes('cloudinary.com') || currentUrl.includes('youtube.com') || currentUrl.includes('youtu.be')) {
      alert("This URL is already on Cloudinary or is invalid.");
      return;
    }

    setUploading(true);
    try {
      const cloudinaryUrl = await uploadToCloudinary(currentUrl);
      handleArrayChange(field, index, cloudinaryUrl);
      alert('Successfully synced to Cloudinary!');
    } catch (err) {
      console.error(err);
      alert('Sync failed. See console.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const docRef = doc(db, "settings", "global");
      // Merge with existing settings in Firestore so we don't overwrite everything
      await setDoc(docRef, formData, { merge: true });
      alert("Settings saved successfully!");
    } catch (err) {
      console.error("Error saving settings:", err);
      alert("Failed to save settings. See console.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <p style={{color:'var(--dim)'}}>Loading settings...</p>;

  const renderImageArray = (field, label) => (
    <div style={{borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:'24px', marginTop:'24px'}}>
      <h3 style={{fontFamily:'var(--font-display)', fontSize:'1.2rem', marginBottom:'16px'}}>{label}</h3>
      <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
        {formData[field].map((url, idx) => (
          <div key={idx} className="repeater-item" style={{background:'rgba(255,255,255,0.02)', padding:'12px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.05)', display:'flex', gap:'12px', alignItems:'center'}}>
            
            <div style={{width:'60px', height:'60px', background:'var(--bg)', borderRadius:'4px', overflow:'hidden', flexShrink:0}}>
              {url && <img src={url} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} />}
            </div>

            <div style={{flex:1, display:'flex', gap:'8px', alignItems:'center'}}>
              <input 
                type="url"
                value={url} 
                onChange={(e) => handleArrayChange(field, idx, e.target.value)}
                placeholder="https://..."
                style={{flex:1}}
              />
              <label className={`btn btn-ghost ${uploading ? 'disabled' : ''}`} style={{cursor: uploading ? 'not-allowed' : 'pointer', padding:'8px 12px'}}>
                {uploading ? '...' : 'Upload File'}
                <input type="file" style={{display:'none'}} accept="image/*" onChange={(e) => handleFileUpload(e, field, idx)} />
              </label>
              <button type="button" className="btn btn-outline" onClick={() => handleUrlUpload(field, idx)} disabled={uploading} style={{padding:'8px 12px'}}>Upload URL</button>
              <button type="button" className="btn btn-outline" onClick={() => handleSyncToCloudinary(field, idx)} disabled={uploading || !url} style={{padding:'8px 12px'}}>Sync</button>
            </div>
            
            <button type="button" onClick={() => removeArrayItem(field, idx)} className="btn-icon" style={{alignSelf:'center'}}>✕</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => addArrayItem(field)} className="btn-add" style={{marginTop:'12px'}}>+ Add Image</button>
    </div>
  );

  return (
    <div style={{maxWidth: '1000px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
        <p className="panel-desc" style={{margin:0}}>Manage your homepage and about section images here.</p>
      </div>
      
      <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'20px'}}>
        
        {renderImageArray('heroImages', 'Hero Images (Slideshow)')}
        {renderImageArray('aboutImages', 'About Images')}
        
        <div style={{display:'flex', justifyContent:'flex-end', gap:'12px', marginTop:'24px', paddingTop:'24px', borderTop:'1px solid rgba(255,255,255,0.08)'}}>
          <button type="submit" className="btn btn-primary" disabled={uploading}>
            {uploading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
