import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import AdminProjectModal from './AdminProjectModal';
import AdminSections from '../components/AdminSections';
import AdminSettings from '../components/AdminSettings';
import AdminMessages from '../components/AdminMessages';
import MediaLibrary from '../components/MediaLibrary';
import '../admin.css';

const Admin = () => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [projects, setProjects] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const [currentTab, setCurrentTab] = useState('dashboard'); // 'dashboard' | 'portfolio' | 'settings' | 'messages'
  const [editingProject, setEditingProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let unsubscribeMessages = () => {};
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
      if (currentUser) {
        fetchData();
        
        // Listen to contact messages in real-time
        setLoadingMessages(true);
        const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
        unsubscribeMessages = onSnapshot(q, (snapshot) => {
          const items = [];
          snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
          setMessages(items);
          setLoadingMessages(false);
        }, (err) => {
          console.error("Failed to sync messages:", err);
          setLoadingMessages(false);
        });
      } else {
        setMessages([]);
        unsubscribeMessages();
      }
    });
    return () => {
      unsubscribe();
      unsubscribeMessages();
    };
  }, []);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const snapshot = await getDocs(collection(db, "projects"));
      const items = [];
      snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
      
      // Sort by sortOrder first, fallback to creation date
      items.sort((a, b) => {
        const orderA = a.sortOrder !== undefined ? a.sortOrder : 9999;
        const orderB = b.sortOrder !== undefined ? b.sortOrder : 9999;
        if (orderA !== orderB) return orderA - orderB;
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      });
      setProjects(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const moveProject = async (index, direction) => {
    if (direction === -1 && index === 0) return;
    if (direction === 1 && index === projects.length - 1) return;
    
    const newProjects = [...projects];
    const targetIndex = index + direction;
    
    // Swap in local array
    const temp = newProjects[index];
    newProjects[index] = newProjects[targetIndex];
    newProjects[targetIndex] = temp;
    
    setProjects(newProjects);
    
    try {
      // Update the sortOrder for all projects based on their new index
      await Promise.all(newProjects.map((p, i) => updateDoc(doc(db, "projects", p.id), { sortOrder: i })));
    } catch (err) {
      console.error(err);
      alert("Failed to reorder projects");
      fetchData(); // Revert on failure
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid email or password.');
    }
  };

  const handleLogout = () => signOut(auth);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "projects", id));
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete project");
    }
  };

  const openNewProject = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const openEditProject = (p) => {
    setEditingProject(p);
    setIsModalOpen(true);
  };

  const handleModalSave = () => {
    setIsModalOpen(false);
    fetchData(); // refresh list
  };

  if (loadingAuth) return <div className="admin-theme" style={{justifyContent: 'center', alignItems: 'center'}}>Loading...</div>;

  if (!user) {
    return (
      <div className="admin-theme">
        <div id="auth-screen">
          <form onSubmit={handleLogin} className="auth-box">
            <h1>Portfolio Studio</h1>
            <p>Sign in with your Firebase admin account to upload photos and edit the site.</p>
            {error && <p className="auth-error show">{error}</p>}
            <div className="field">
              <label>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" required />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-primary btn-block" style={{marginTop: '8px'}}>Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-theme">
      <div id="admin-app" className="visible">
        <aside className="sidebar">
          <div className="brand">
            <h1>Portfolio Studio</h1>
            <p>Control every detail of your site</p>
          </div>

          <div className="nav-group">
            <div className="nav-group-label">Overview</div>
            <button className={`nav-btn ${currentTab === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentTab('dashboard')}><span className="icon">◆</span> Dashboard</button>
            <button className={`nav-btn ${currentTab === 'messages' ? 'active' : ''}`} onClick={() => setCurrentTab('messages')}>
              <span className="icon">✉</span> Inbox Messages
              {messages.filter(m => !m.read).length > 0 && ` (${messages.filter(m => !m.read).length})`}
            </button>
          </div>

          <div className="nav-group">
            <div className="nav-group-label">Content</div>
            <button className={`nav-btn ${currentTab === 'media' ? 'active' : ''}`} onClick={() => setCurrentTab('media')}><span className="icon">▦</span> Media Library</button>
            <button className={`nav-btn ${currentTab === 'identity' ? 'active' : ''}`} onClick={() => setCurrentTab('identity')}><span className="icon">◎</span> Site Identity</button>
            <button className={`nav-btn ${currentTab === 'sections' ? 'active' : ''}`} onClick={() => setCurrentTab('sections')}><span className="icon">▤</span> Page Sections</button>
            <button className={`nav-btn ${currentTab === 'about' ? 'active' : ''}`} onClick={() => setCurrentTab('about')}><span className="icon">○</span> About Page</button>
            <button className={`nav-btn ${currentTab === 'gallery-settings' ? 'active' : ''}`} onClick={() => setCurrentTab('gallery-settings')}><span className="icon">◪</span> Gallery Layout</button>
            <button className={`nav-btn ${currentTab === 'social' ? 'active' : ''}`} onClick={() => setCurrentTab('social')}><span className="icon">◈</span> Social & Links</button>
          </div>

          <div className="nav-group">
            <div className="nav-group-label">Projects</div>
            <button className={`nav-btn ${currentTab === 'publish' ? 'active' : ''}`} onClick={() => { setCurrentTab('portfolio'); openNewProject(); }}><span className="icon">▲</span> Publish New</button>
            <button className={`nav-btn ${currentTab === 'portfolio' ? 'active' : ''}`} onClick={() => setCurrentTab('portfolio')}><span className="icon">☰</span> Manage Projects</button>
          </div>

          <div className="nav-group">
            <div className="nav-group-label">System</div>
            <button className={`nav-btn ${currentTab === 'theme' ? 'active' : ''}`} onClick={() => setCurrentTab('theme')}><span className="icon">◐</span> Theme & Colors</button>
            <button className={`nav-btn ${currentTab === 'seo' ? 'active' : ''}`} onClick={() => setCurrentTab('seo')}><span className="icon">⚲</span> SEO & Meta</button>
          </div>

          <div className="sidebar-footer">
            <button className="preview-link" onClick={handleLogout} style={{background: 'rgba(255,255,255,0.05)', color: 'var(--dim)', boxShadow: 'none'}}>Sign Out</button>
          </div>
        </aside>

        <div className="main">
          <header className="topbar">
            <h2>
              {currentTab === 'dashboard' && 'Dashboard'}
              {currentTab === 'media' && 'Media Library'}
              {currentTab === 'portfolio' && 'Manage Projects'}
              {currentTab === 'messages' && 'Inbox Messages'}
              {currentTab === 'identity' && 'Site Identity'}
              {currentTab === 'sections' && 'Page Sections'}
              {currentTab === 'about' && 'About Page'}
              {currentTab === 'gallery-settings' && 'Gallery Layout'}
              {currentTab === 'social' && 'Social & Links'}
              {currentTab === 'theme' && 'Theme & Colors'}
              {currentTab === 'seo' && 'SEO & Meta'}
            </h2>
            <div className="topbar-actions">
              <span className="badge live">Signed in</span>
              <button className="btn-logout" onClick={handleLogout}>Sign Out</button>
            </div>
          </header>

          <div className="workspace">
            {currentTab === 'dashboard' && (
              <div className="panel active" style={{maxWidth: '880px'}}>
                <p className="panel-desc">Welcome back. Here's a snapshot of your portfolio.</p>
                <div className="dash-grid">
                  <div className="dash-card">
                    <div className="num">{projects.filter(p => p.status !== 'draft').length}</div>
                    <div className="lbl">Published Projects</div>
                  </div>
                  <div className="dash-card">
                    <div className="num">{projects.filter(p => p.featured).length}</div>
                    <div className="lbl">Featured Works</div>
                  </div>
                  <div className="dash-card">
                    <div className="num">{projects.filter(p => p.status === 'draft').length}</div>
                    <div className="lbl">Drafts</div>
                  </div>
                  <div className="dash-card">
                    <div className="num">{messages.length}</div>
                    <div className="lbl">Total Messages</div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-title">Quick Actions</div>
                  <div style={{display:'flex', flexWrap:'wrap', gap:'10px'}}>
                    <button className="btn btn-primary" onClick={() => { setCurrentTab('portfolio'); openNewProject(); }}>+ New Project</button>
                    <button className="btn btn-ghost" onClick={() => setCurrentTab('messages')}>View Inbox</button>
                    <button className="btn btn-ghost" onClick={() => setCurrentTab('identity')}>Edit Settings</button>
                    <a className="btn btn-ghost" href="/" target="_blank" rel="noopener noreferrer">Open Live Site</a>
                  </div>
                </div>
              </div>
            )}

            {currentTab === 'portfolio' && (
              <div className="panel active" style={{maxWidth: '1000px'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
                  <p className="panel-desc" style={{margin:0}}>Manage your portfolio projects and case studies.</p>
                  <button className="btn btn-primary" onClick={openNewProject}>+ New Project</button>
                </div>
                
                {loadingData ? (
                  <p style={{color:'var(--dim)'}}>Loading projects...</p>
                ) : (
                  <div>
                    {projects.map((p, idx) => (
                      <div className="project-card" key={p.id}>
                        {p.thumbnailUrl ? (
                          <img src={p.thumbnailUrl} alt="" />
                        ) : (
                          <div style={{width:'100px', height:'72px', background:'var(--bg)', borderRadius:'6px', border:'1px solid rgba(255,255,255,0.08)'}}></div>
                        )}
                        <div>
                          <h4>{p.title || 'Untitled'}</h4>
                          <div className="meta">{p.location || ''} {p.year ? `· ${p.year}` : ''}</div>
                          <div className="tags">
                            {p.featured && <span className="tag featured">Featured</span>}
                            {p.status === 'draft' ? (
                              <span className="tag draft">Draft</span>
                            ) : (
                              <span className="tag">Published</span>
                            )}
                            {p.category && <span className="tag">{p.category}</span>}
                          </div>
                          <div className="sort-btns" style={{display:'flex', gap:'8px', marginTop:'8px'}}>
                            <button className="btn btn-ghost btn-sm" onClick={() => moveProject(idx, -1)} disabled={idx === 0}>↑ Up</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => moveProject(idx, 1)} disabled={idx === projects.length - 1}>↓ Down</button>
                          </div>
                        </div>
                        <div className="project-actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => openEditProject(p)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                    {projects.length === 0 && (
                      <div className="empty">No projects found.</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {currentTab === 'messages' && (
              <div className="panel active">
                <AdminMessages messages={messages} loading={loadingMessages} />
              </div>
            )}

            {currentTab === 'media' && (
              <div className="panel active" style={{maxWidth: '1200px'}}>
                <MediaLibrary />
              </div>
            )}

            {currentTab === 'sections' && (
              <div className="panel active" style={{maxWidth: '1000px'}}>
                <AdminSections />
              </div>
            )}

            {['identity', 'about', 'gallery-settings', 'social', 'theme', 'seo'].includes(currentTab) && (
              <div className="panel active" style={{maxWidth: '1000px'}}>
                <AdminSettings currentTab={currentTab} />
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <AdminProjectModal 
          project={editingProject} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleModalSave} 
        />
      )}
    </div>
  );
};

export default Admin;

