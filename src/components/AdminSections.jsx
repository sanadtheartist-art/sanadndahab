import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const SECTION_TYPES = [
  { id: 'hero', name: 'Hero Area' },
  { id: 'works', name: 'Featured Works' },
  { id: 'about', name: 'About Summary' },
  { id: 'contact', name: 'Contact Block' },
  { id: 'custom', name: 'Custom Block' }
];

const AdminSections = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'site'));
        if (snap.exists()) {
          const data = snap.data();
          if (data.pageSections && data.pageSections.length > 0) {
            setSections(data.pageSections);
          } else {
            // Default sections if none exist
            setSections([
              { id: 'sec-hero', type: 'hero', enabled: true, showInNav: false },
              { id: 'sec-works', type: 'works', enabled: true, showInNav: true },
              { id: 'sec-about', type: 'about', enabled: true, showInNav: true },
              { id: 'sec-contact', type: 'contact', enabled: true, showInNav: true }
            ]);
          }
        }
      } catch (err) {
        console.error(err);
        setMsg({ text: 'Failed to load sections', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMsg({ text: '', type: '' });
    try {
      await setDoc(doc(db, 'settings', 'site'), { pageSections: sections }, { merge: true });
      setMsg({ text: 'Page sections saved successfully!', type: 'success' });
      setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    } catch (err) {
      console.error(err);
      setMsg({ text: 'Failed to save sections', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const newSecs = [...sections];
    [newSecs[index - 1], newSecs[index]] = [newSecs[index], newSecs[index - 1]];
    setSections(newSecs);
  };

  const moveDown = (index) => {
    if (index === sections.length - 1) return;
    const newSecs = [...sections];
    [newSecs[index + 1], newSecs[index]] = [newSecs[index], newSecs[index + 1]];
    setSections(newSecs);
  };

  const removeSection = (index) => {
    if (window.confirm('Remove this section from the page?')) {
      const newSecs = [...sections];
      newSecs.splice(index, 1);
      setSections(newSecs);
    }
  };

  const addSection = (e) => {
    const type = e.target.value;
    if (!type) return;
    e.target.value = ""; // reset dropdown
    
    const newSec = {
      id: `sec-${Date.now().toString(36)}`,
      type: type,
      enabled: true,
      showInNav: type !== 'hero',
    };

    if (type === 'custom') {
      newSec.customTitle = 'New Section';
      newSec.customLabel = '';
      newSec.customSubtitle = '';
      newSec.customBody = '';
      newSec.customImage = '';
      newSec.customUseCode = false;
      newSec.customLayout = 'split';
      newSec.customHtml = '';
    }

    setSections([...sections, newSec]);
  };

  const updateSection = (index, field, value) => {
    const newSecs = [...sections];
    newSecs[index] = { ...newSecs[index], [field]: value };
    setSections(newSecs);
  };

  if (loading) return <p className="text-dim animate-pulse">Loading sections...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <p className="panel-desc">Control which sections appear on your site, their order, and add custom content blocks.</p>
      
      <div className="card">
        <div className="card-title">Sections order & visibility</div>
        
        {sections.length === 0 ? (
          <p className="hint">No sections yet. Add one below.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sections.map((sec, i) => (
              <div key={sec.id} className="section-editor-card" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', background: 'var(--bg)' }}>
                <div className="section-editor-head" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: sec.type === 'custom' ? '12px' : '0' }}>
                  <button type="button" className="btn-icon" onClick={() => moveUp(i)} disabled={i === 0} style={{ width: '32px', height: '32px', fontSize: '1rem' }}>↑</button>
                  <button type="button" className="btn-icon" onClick={() => moveDown(i)} disabled={i === sections.length - 1} style={{ width: '32px', height: '32px', fontSize: '1rem' }}>↓</button>
                  
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="section-type-badge" style={{ fontSize: '0.7rem', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '999px', background: 'rgba(196, 165, 116, 0.15)', color: 'var(--accent)', fontWeight: 600 }}>
                      {SECTION_TYPES.find(t => t.id === sec.type)?.name || sec.type}
                    </span>
                    {sec.type === 'custom' && (
                      <strong style={{ fontSize: '0.9rem' }}>{sec.customTitle || sec.customLabel || 'Custom Block'}</strong>
                    )}
                    <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={sec.enabled !== false} onChange={(e) => updateSection(i, 'enabled', e.target.checked)} />
                        Enabled
                      </label>
                      {sec.type !== 'hero' && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--dim)' }}>
                          <input type="checkbox" checked={sec.showInNav !== false} onChange={(e) => updateSection(i, 'showInNav', e.target.checked)} />
                          Show in Nav
                        </label>
                      )}
                    </strong>
                  </div>
                  <button type="button" className="btn-icon" onClick={() => removeSection(i)} style={{ width: '32px', height: '32px', fontSize: '1rem', color: 'var(--danger)' }}>×</button>
                </div>

                {sec.type === 'custom' ? (
                  <div className="section-custom-fields" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '12px' }}>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 500 }}>Block Mode:</label>
                      <select 
                        value={sec.customUseCode ? 'code' : 'visual'} 
                        onChange={(e) => updateSection(i, 'customUseCode', e.target.value === 'code')}
                        style={{ maxWidth: '240px', padding: '8px 12px' }}
                      >
                        <option value="visual">Visual Layout (Image + Text)</option>
                        <option value="code">Embedded Code / HTML</option>
                      </select>
                    </div>

                    {sec.customUseCode ? (
                      <div className="custom-mode-panel sec-code-panel" style={{ border: '1px dashed var(--border)', padding: '16px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }}>
                        <p className="hint" style={{ marginBottom: '12px' }}>Paste your embedded code (iframe, script, or custom HTML).</p>
                        <div className="field">
                          <label>Embedded Code</label>
                          <textarea 
                            className="code-editor html" 
                            style={{ fontFamily: 'monospace', minHeight: '140px' }} 
                            rows={6}
                            value={sec.customHtml || ''} 
                            onChange={(e) => updateSection(i, 'customHtml', e.target.value)}
                            placeholder="<iframe>...</iframe>"
                          />
                        </div>
                        <div className="field" style={{ marginTop: '12px' }}>
                          <label>Container Layout</label>
                          <select value={sec.customLayout || 'contained'} onChange={(e) => updateSection(i, 'customLayout', e.target.value)}>
                            <option value="contained">Contained (max width)</option>
                            <option value="full">Full width</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="section-custom-fields sec-visual-panel" style={{ display: 'grid', gap: '16px' }}>
                        <div className="row-2">
                          <div className="field">
                            <label>Small label</label>
                            <input type="text" value={sec.customLabel || ''} onChange={(e) => updateSection(i, 'customLabel', e.target.value)} />
                          </div>
                          <div className="field">
                            <label>Title</label>
                            <input type="text" value={sec.customTitle || ''} onChange={(e) => updateSection(i, 'customTitle', e.target.value)} />
                          </div>
                        </div>
                        <div className="field">
                          <label>Subtitle</label>
                          <input type="text" value={sec.customSubtitle || ''} onChange={(e) => updateSection(i, 'customSubtitle', e.target.value)} />
                        </div>
                        <div className="field">
                          <label>Body text</label>
                          <textarea value={sec.customBody || ''} onChange={(e) => updateSection(i, 'customBody', e.target.value)} rows={4} />
                        </div>
                        <div className="field">
                          <label>Image URL</label>
                          <input type="url" value={sec.customImage || ''} onChange={(e) => updateSection(i, 'customImage', e.target.value)} />
                        </div>
                        <div className="field">
                          <label>Visual Layout</label>
                          <select value={sec.customLayout || 'split'} onChange={(e) => updateSection(i, 'customLayout', e.target.value)}>
                            <option value="split">Image + text (side by side)</option>
                            <option value="center">Centered text</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="hint" style={{ marginTop: '12px', fontSize: '0.8rem' }}>
                    Edit {SECTION_TYPES.find(t => t.id === sec.type)?.name || sec.type} content in the 
                    <strong>
                      {sec.type === 'works' ? ' Manage Projects ' : sec.type === 'hero' ? ' Site Identity ' : ' About Page '}
                    </strong>
                    admin tab.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div style={{ marginTop: '20px' }}>
          <select className="btn-add" onChange={addSection} value="">
            <option value="" disabled>+ Add a new section</option>
            {SECTION_TYPES.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="sticky-save" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--surface)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
        {msg.text && <span style={{ margin: 'auto 16px', color: msg.type === 'error' ? 'var(--danger)' : 'var(--success)' }}>{msg.text}</span>}
        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ width: 'auto' }}>
          {saving ? 'Saving...' : 'Save Page Sections'}
        </button>
      </div>
    </div>
  );
};

export default AdminSections;
