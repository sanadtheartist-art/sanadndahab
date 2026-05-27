import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const FONT_OPTIONS = [
  { label: 'System Default', value: 'system-ui' },
  { label: 'Inter', value: 'Inter' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Playfair Display', value: 'Playfair Display' },
  { label: 'Instrument Serif', value: 'Instrument Serif' },
  { label: 'DM Sans', value: 'DM Sans' },
  { label: 'Outfit', value: 'Outfit' },
  { label: 'Space Grotesk', value: 'Space Grotesk' },
  { label: 'Lora', value: 'Lora' },
];

const PRESET_PALETTES = [
  {
    name: 'Dark Elegance',
    theme: { bg: '#09090b', surface: '#131316', surface2: '#1a1a1f', text: '#fafafa', dim: '#71717a', accent: '#c4a574' }
  },
  {
    name: 'Midnight Blue',
    theme: { bg: '#020617', surface: '#0f172a', surface2: '#1e293b', text: '#f8fafc', dim: '#94a3b8', accent: '#38bdf8' }
  },
  {
    name: 'Forest Minimal',
    theme: { bg: '#052e16', surface: '#064e3b', surface2: '#065f46', text: '#ecfdf5', dim: '#a7f3d0', accent: '#10b981' }
  },
  {
    name: 'Clean Light',
    theme: { bg: '#ffffff', surface: '#f8fafc', surface2: '#f1f5f9', text: '#0f172a', dim: '#64748b', accent: '#2563eb' }
  },
  {
    name: 'Sunset Glow',
    theme: { bg: '#2c1e16', surface: '#3a271d', surface2: '#4a3326', text: '#fff3e0', dim: '#ffccbc', accent: '#ff7043' }
  }
];

const AdminSettings = ({ currentTab }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    artistName: '',
    heroEyebrow: '',
    heroTitle: '',
    heroSubtitle: '',
    heroImage: '',
    aboutLabel: '',
    aboutTitle: '',
    aboutLead: '',
    aboutText: '',
    aboutImage: '',
    contactTitle: '',
    contactText: '',
    emailLink: '',
    igLink: '',
    seoTitle: '',
    seoDescription: '',
    faviconUrl: '',
    ogImage: '',
    footerText: '',
    footerTagline: '',
    theme: {},
    customBlocks: []
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'site'));
        if (snap.exists()) {
          const data = snap.data();
          setFormData(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error(err);
        setMsg({ text: 'Failed to load settings', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setMsg({ text: `Uploading ${fieldName}...`, type: 'success' });
    try {
      const fileRef = ref(storage, `settings/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      setFormData(prev => ({ ...prev, [fieldName]: url }));
      setMsg({ text: 'Upload successful!', type: 'success' });
      setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    } catch (err) {
      console.error(err);
      setMsg({ text: 'Upload failed', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMsg({ text: '', type: '' });
    try {
      await setDoc(doc(db, 'settings', 'site'), formData, { merge: true });
      setMsg({ text: 'Settings saved successfully!', type: 'success' });

      // Clear message after 4 seconds
      setTimeout(() => setMsg({ text: '', type: '' }), 4000);
    } catch (err) {
      console.error(err);
      setMsg({ text: 'Failed to save settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-dim animate-pulse">Loading site settings...</p>;
  }

  const InputRow = ({ label, name, type = 'text', as = 'input', hint, allowUpload = false }) => (
    <div className="field">
      <label>{label}</label>
      {as === 'textarea' ? (
        <textarea
          name={name}
          value={formData[name] || ''}
          onChange={handleChange}
        />
      ) : (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type={type}
            name={name}
            value={formData[name] || ''}
            onChange={handleChange}
            style={{ flex: 1 }}
          />
          {allowUpload && (
            <label className={`btn btn-ghost ${uploading ? 'disabled' : ''}`} style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}>
              {uploading ? '...' : 'Upload'}
              <input
                type="file"
                className="hidden"
                style={{ display: 'none' }}
                accept="image/*"
                onChange={(e) => handleFileUpload(e, name)}
              />
            </label>
          )}
        </div>
      )}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );

  // Theme inputs helper
  const ThemeRow = ({ label, name, hint, type = 'text' }) => (
    <div className="field">
      <label>{label}</label>
      <input
        type={type}
        name={name}
        value={(formData.theme && formData.theme[name]) || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, theme: { ...(prev.theme || {}), [name]: e.target.value } }))}
      />
      {hint && <p className="hint">{hint}</p>}
    </div>
  );

  const ColorRow = ({ label, name, hint }) => (
    <div className="field">
      <label>{label}</label>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="color"
          name={name}
          value={(formData.theme && formData.theme[name]) || '#000000'}
          onChange={(e) => setFormData(prev => ({ ...prev, theme: { ...(prev.theme || {}), [name]: e.target.value } }))}
          style={{ width: '44px', padding: '4px', cursor: 'pointer', border: 'none', background: 'transparent' }}
        />
        <input
          type="text"
          name={name}
          value={(formData.theme && formData.theme[name]) || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, theme: { ...(prev.theme || {}), [name]: e.target.value } }))}
          placeholder="#000000"
          style={{ fontFamily: 'monospace' }}
        />
      </div>
      {hint && <p className="hint">{hint}</p>}
    </div>
  );

  const FontRow = ({ label, name, hint }) => (
    <div className="field">
      <label>{label}</label>
      <select
        name={name}
        value={(formData.theme && formData.theme[name]) || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, theme: { ...(prev.theme || {}), [name]: e.target.value } }))}
      >
        <option value="">-- Choose Font --</option>
        {FONT_OPTIONS.map(f => (
          <option key={f.value} value={f.value}>{f.label}</option>
        ))}
      </select>
      {hint && <p className="hint">{hint}</p>}
    </div>
  );

  const applyPalette = (paletteTheme) => {
    setFormData(prev => ({ ...prev, theme: { ...(prev.theme || {}), ...paletteTheme } }));
  };

  // Custom Blocks editor
  const addBlock = () => {
    setFormData(prev => ({ ...prev, customBlocks: [...(prev.customBlocks || []), { id: Date.now().toString(), key: '', title: '', content: '' }] }));
  };
  const updateBlock = (idx, field, value) => {
    setFormData(prev => {
      const blocks = [...(prev.customBlocks || [])];
      blocks[idx] = { ...blocks[idx], [field]: value };
      return { ...prev, customBlocks: blocks };
    });
  };
  const removeBlock = (idx) => {
    setFormData(prev => ({ ...prev, customBlocks: (prev.customBlocks || []).filter((_, i) => i !== idx) }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {currentTab === 'identity' && (
        <>
          <div className="card">
            <div className="card-title">Identity & Hero</div>
            <div className="row-2">
              <InputRow label="Artist / Brand Name" name="artistName" />
              <InputRow label="Hero Eyebrow (e.g. Mural Artist)" name="heroEyebrow" />
              <InputRow label="Hero Title" name="heroTitle" as="textarea" hint="Supports HTML like <br> for line breaks" />
              <InputRow label="Hero Subtitle" name="heroSubtitle" as="textarea" />
              <InputRow label="Hero Background Image URL" name="heroImage" hint="A direct link to an image file" allowUpload={true} />
            </div>
          </div>
        </>
      )}

      {currentTab === 'about' && (
        <div className="card">
          <div className="card-title">About Section</div>
          <div className="row-2">
            <InputRow label="About Label" name="aboutLabel" />
            <InputRow label="About Title" name="aboutTitle" />
            <InputRow label="About Lead Text" name="aboutLead" as="textarea" />
            <InputRow label="About Body Text" name="aboutText" as="textarea" hint="Supports HTML tags" />
            <InputRow label="About Image URL" name="aboutImage" allowUpload={true} />
          </div>
        </div>
      )}

      {currentTab === 'gallery-settings' && (
        <div className="card">
          <div className="card-title">Works Section</div>
          <p className="hint">Configure how your portfolio works appear.</p>
          <div className="row-2">
            <div className="field">
              <label>Gallery Layout (Coming soon)</label>
              <select disabled>
                <option>Masonry (Pinterest-style)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {currentTab === 'social' && (
        <div className="card">
          <div className="card-title">Contact & Social Links</div>
          <div className="row-2">
            <InputRow label="Contact Title" name="contactTitle" />
            <InputRow label="Contact Subtext" name="contactText" as="textarea" />
            <InputRow label="Contact Email" name="emailLink" type="email" />
            <InputRow label="Instagram Link" name="igLink" type="url" />
          </div>
        </div>
      )}

      {currentTab === 'seo' && (
        <div className="card">
          <div className="card-title">SEO & Footer</div>
          <div className="row-2">
            <InputRow label="SEO Meta Title" name="seoTitle" />
            <InputRow label="SEO Meta Description" name="seoDescription" as="textarea" />
            <InputRow label="Favicon URL" name="faviconUrl" allowUpload={true} />
            <InputRow label="Open Graph (OG) Image URL" name="ogImage" hint="Used when sharing the site on social media" allowUpload={true} />
            <InputRow label="Footer Text" name="footerText" />
            <InputRow label="Footer Tagline" name="footerTagline" />
          </div>
        </div>
      )}

      {currentTab === 'theme' && (
        <>
          <div className="card">
            <div className="card-title">Theme & Typography</div>
            
            <div className="field" style={{ marginBottom: '24px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <label>Quick Palettes</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
                {PRESET_PALETTES.map(p => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPalette(p.theme)}
                    className="btn btn-ghost"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: p.theme.bg }} />
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: p.theme.surface }} />
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: p.theme.accent }} />
                    </div>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="row-2">
              <ColorRow label="Accent Color" name="accent" hint="Primary highlight color" />
              <ColorRow label="Background Color" name="bg" hint="Main site background" />
              <ColorRow label="Surface Color" name="surface" hint="Cards and sections background" />
              <ColorRow label="Surface 2 Color" name="surface2" hint="Secondary containers (like forms)" />
              <ColorRow label="Text Color" name="text" hint="Primary text color" />
              <ColorRow label="Dim Text Color" name="dim" hint="Secondary text color" />
              
              <FontRow label="Font - Display" name="fontDisplay" hint="Used for headings and titles" />
              <FontRow label="Font - Body" name="fontBody" hint="Used for paragraph text" />
              
              <ThemeRow label="Base Font Size (px)" name="baseSize" type="number" />
              <ThemeRow label="Card Radius (px)" name="radius" type="number" />
              <ColorRow label="Hero Tint" name="heroTint" hint="Gradient overlay for hero image" />
            </div>
          </div>
        </>
      )}

      {currentTab === 'about' && (
        <div className="card">
          <div className="card-title">About Section</div>
          <div className="row-2">
            <InputRow label="About Label" name="aboutLabel" />
            <InputRow label="About Title" name="aboutTitle" />
            <InputRow label="About Lead Text" name="aboutLead" as="textarea" />
            <InputRow label="About Body Text" name="aboutText" as="textarea" hint="Supports HTML tags" />
            <InputRow label="About Image URL" name="aboutImage" allowUpload={true} />
          </div>
        </div>
      )}

      <div className="sticky-save" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--surface)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
        {msg.text && <span style={{ margin: 'auto 16px', color: msg.type === 'error' ? 'var(--danger)' : 'var(--success)' }}>{msg.text}</span>}
        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ width: 'auto' }}>
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

    </div>
  );
};

export default AdminSettings;
