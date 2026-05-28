import React, { useState, useEffect } from 'react';
import { doc, addDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { uploadToCloudinary } from '../lib/cloudinary';

const AdminProjectModal = ({ project, onClose, onSave }) => {
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    location: '',
    year: '',
    client: '',
    dimensions: '',
    description: '',
    status: 'published',
    featured: false,
    thumbnailUrl: '',
    mediaUrls: []
  });

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        category: project.category || '',
        location: project.location || '',
        year: project.year || '',
        client: project.client || '',
        dimensions: project.dimensions || '',
        description: project.description || '',
        status: project.status || 'published',
        featured: !!project.featured,
        thumbnailUrl: project.thumbnailUrl || '',
        mediaUrls: project.mediaUrls || []
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMediaChange = (index, field, value) => {
    const newMedia = [...formData.mediaUrls];
    newMedia[index] = { ...newMedia[index], [field]: value };
    setFormData(prev => ({ ...prev, mediaUrls: newMedia }));
  };

  const addMediaBlock = () => {
    setFormData(prev => ({
      ...prev,
      mediaUrls: [...prev.mediaUrls, { type: 'media', content: '' }]
    }));
  };

  const removeMediaBlock = (index) => {
    setFormData(prev => ({
      ...prev,
      mediaUrls: prev.mediaUrls.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (e, field, index = null) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);

      if (index !== null) {
        handleMediaChange(index, field, url);
      } else {
        setFormData(prev => ({ ...prev, [field]: url }));
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlUpload = async (field, index = null) => {
    const url = prompt('Enter image URL to fetch and upload to Cloudinary:');
    if (!url) return;

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      alert('Please add YouTube links as "Embed Code" or "Text" blocks, they cannot be uploaded to Cloudinary as images.');
      return;
    }

    setUploading(true);
    try {
      const cloudinaryUrl = await uploadToCloudinary(url);
      
      if (index !== null) {
        handleMediaChange(index, field, cloudinaryUrl);
      } else {
        setFormData(prev => ({ ...prev, [field]: cloudinaryUrl }));
      }
    } catch (err) {
      console.error(err);
      alert('URL Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (project?.id) {
        await updateDoc(doc(db, "projects", project.id), formData);
      } else {
        await addDoc(collection(db, "projects"), {
          ...formData,
          createdAt: new Date()
        });
      }
      onSave();
    } catch (err) {
      console.error("Error saving project:", err);
      alert("Failed to save project. See console.");
    }
  };

  return (
    <div className="overlay active">
      <div className="modal">
        <div className="modal-header">
          <h3>{project ? 'Edit Project' : 'New Project'}</h3>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'20px'}}>
          <div className="row-2">
            <div className="field">
              <label>Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Category</label>
              <input type="text" name="category" value={formData.category} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Year</label>
              <input type="text" name="year" value={formData.year} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Client</label>
              <input type="text" name="client" value={formData.client} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Dimensions (Scale)</label>
              <input type="text" name="dimensions" value={formData.dimensions} onChange={handleChange} />
            </div>
          </div>

          <div className="field">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="4"></textarea>
          </div>

          <div className="field">
            <label>Thumbnail URL</label>
            <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
              <input type="url" name="thumbnailUrl" value={formData.thumbnailUrl} onChange={handleChange} style={{flex:1}} />
              <label className={`btn btn-ghost ${uploading ? 'disabled' : ''}`} style={{cursor: uploading ? 'not-allowed' : 'pointer'}}>
                {uploading ? '...' : 'Upload File'}
                <input type="file" style={{display:'none'}} accept="image/*" onChange={(e) => handleFileUpload(e, 'thumbnailUrl')} />
              </label>
              <button type="button" className="btn btn-outline" onClick={() => handleUrlUpload('thumbnailUrl')} disabled={uploading}>Upload URL</button>
            </div>
          </div>

          <div className="row-2">
            <div className="field">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            
            <div className="field" style={{display:'flex', flexDirection:'column', justifyContent:'center'}}>
              <label style={{display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', marginTop:'24px'}}>
                <input 
                  type="checkbox" 
                  name="featured" 
                  checked={formData.featured} 
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))} 
                />
                Featured Project
              </label>
            </div>
          </div>

          <div style={{borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:'24px', marginTop:'8px'}}>
            <h3 style={{fontFamily:'var(--font-display)', fontSize:'1.2rem', marginBottom:'16px'}}>Media Blocks</h3>
            <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
              {formData.mediaUrls.map((block, idx) => (
                <div key={idx} className="repeater-item" style={{background:'rgba(255,255,255,0.02)', padding:'12px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.05)', display:'flex', gap:'12px', alignItems:'flex-start'}}>
                  <select 
                    value={block.type} 
                    onChange={(e) => handleMediaChange(idx, 'type', e.target.value)}
                    style={{width:'180px', flexShrink:0}}
                  >
                    <option value="media">Image/Video URL</option>
                    <option value="text">Text Block</option>
                    <option value="embed">Embed Code</option>
                  </select>
                  
                  {block.type === 'media' ? (
                    <div style={{flex:1, display:'flex', gap:'8px'}}>
                      <input 
                        type="url"
                        value={block.content} 
                        onChange={(e) => handleMediaChange(idx, 'content', e.target.value)}
                        placeholder="https://..."
                        style={{flex:1}}
                      />
                      <label className={`btn btn-ghost ${uploading ? 'disabled' : ''}`} style={{cursor: uploading ? 'not-allowed' : 'pointer', padding:'12px 14px'}}>
                        {uploading ? '...' : 'Upload File'}
                        <input type="file" style={{display:'none'}} accept="image/*,video/*" onChange={(e) => handleFileUpload(e, 'content', idx)} />
                      </label>
                      <button type="button" className="btn btn-outline" onClick={() => handleUrlUpload('content', idx)} disabled={uploading} style={{padding:'12px 14px'}}>Upload URL</button>
                    </div>
                  ) : (
                    <textarea 
                      value={block.content} 
                      onChange={(e) => handleMediaChange(idx, 'content', e.target.value)}
                      placeholder="Enter content..."
                      style={{flex:1, minHeight:'42px'}}
                      rows={3}
                    />
                  )}
                  <button type="button" onClick={() => removeMediaBlock(idx)} className="btn-icon" style={{alignSelf:'flex-start'}}>✕</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addMediaBlock} className="btn-add">+ Add Media Block</button>
          </div>

          <div style={{display:'flex', justifyContent:'flex-end', gap:'12px', marginTop:'24px', paddingTop:'24px', borderTop:'1px solid rgba(255,255,255,0.08)'}}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Project</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProjectModal;
