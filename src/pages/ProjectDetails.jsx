import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useSiteSettings } from '../lib/SiteContext';
import { useIsMobile } from '../lib/useIsMobile';

const upgradeImageUrl = (url) => {
  if (!url) return '';
  let u = url.trim();
  if (u.startsWith('data:')) return u;
  if (u.includes('cloudinary.com')) {
    return u.replace(/\/upload\/(?:f_[^/]+,q_[^/]+,w_\d+,c_limit\/)?/, '/upload/f_auto,q_65,w_1200,c_limit/');
  }
  if (/googleusercontent\.com|ggpht\.com/i.test(u)) {
    let out = u.replace(/=s\d+[^&]*/gi, '').replace(/=w\d+[^&]*/gi, '');
    return out.endsWith('=s0') ? out : out + '=s0';
  }
  return u;
};

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSiteSettings();
  const isMobile = useIsMobile();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allProjects, setAllProjects] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, 'projects', id));
        if (snap.exists()) {
          const p = snap.data();
          setProject({ id: snap.id, ...p });
          document.title = `${settings?.artistName || 'SANADNDAHAB'} | ${p.title}`;
          let meta = document.querySelector('meta[name="description"]');
          if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
          meta.content = p.description || `${p.title} — a mural by ${settings?.artistName || 'SANADNDAHAB'}.`;
        } else { navigate('/'); }

        const allSnap = await getDocs(collection(db, 'projects'));
        const items = [];
        allSnap.forEach(d => { const data = d.data(); if (data.status !== 'draft') items.push({ id: d.id, ...data }); });
        items.sort((a, b) => {
          const ao = a.sortOrder ?? 9999, bo = b.sortOrder ?? 9999;
          if (ao !== bo) return ao - bo;
          return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        });
        setAllProjects(items);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetch();
  }, [id, navigate, settings]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '1px solid var(--border)', borderTop: '1px solid var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--dim)', marginTop: '1.5rem' }}>Loading</p>
      </div>
    );
  }

  if (!project) return null;

  const currentIdx = allProjects.findIndex(p => p.id === id);
  const prevProject = currentIdx > 0 ? allProjects[currentIdx - 1] : null;
  const nextProject = currentIdx >= 0 && currentIdx < allProjects.length - 1 ? allProjects[currentIdx + 1] : null;

  const meta = [project.location, project.year, project.category].filter(Boolean).join(' · ');

  const renderBlock = (block, idx, isFirst) => {
    if (typeof block === 'string') {
      if (!block.trim()) return null;
      return (
        <img key={idx} src={upgradeImageUrl(block.trim())} alt={project.title}
          className="img-fade" onLoad={e => e.currentTarget.classList.add('loaded')}
          loading={isFirst ? 'eager' : 'lazy'} decoding="async"
          style={{ width: '100%', borderRadius: '2px', display: 'block', marginBottom: '1rem' }} />
      );
    }
    if (block?.type === 'media' && block.content?.trim()) {
      return (
        <img key={idx} src={upgradeImageUrl(block.content.trim())} alt={project.title}
          className="img-fade" onLoad={e => e.currentTarget.classList.add('loaded')}
          loading={isFirst ? 'eager' : 'lazy'} decoding="async"
          style={{ width: '100%', borderRadius: '2px', display: 'block', marginBottom: '1rem' }} />
      );
    }
    if (block?.type === 'text' && block.content?.trim()) {
      return (
        <div key={idx}
          style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', lineHeight: 1.8, color: 'var(--dim)', margin: '2rem 0' }}
          dangerouslySetInnerHTML={{ __html: block.content.replace(/\n/g, '<br>') }}
        />
      );
    }
    if (block?.type === 'embed' && block.content?.trim()) {
      let code = block.content;
      if (code.includes('youtube.com/embed/') || code.includes('youtu.be/')) {
        code = code.replace(/<iframe\s/i, '<iframe style="width:100%;aspect-ratio:16/9;display:block;" ');
      }
      return <div key={idx} style={{ margin: '2rem 0', overflow: 'hidden', borderRadius: '2px' }} dangerouslySetInnerHTML={{ __html: code }} />;
    }
    return null;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Top nav bar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: 'rgba(7,7,10,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 1.5rem',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto',
          height: '3.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, minWidth: 0 }}>
            <Link to="/" style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--dim)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              flexShrink: 0,
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--dim)'}
            >
              ← Back
            </Link>
            <div style={{ width: '1px', height: '16px', background: 'var(--border)', flexShrink: 0 }} />
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.05rem',
              fontWeight: 400,
              color: 'var(--text)',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}>{project.title}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            {[
              { p: prevProject, arrow: '←', label: 'Previous project' },
              { p: nextProject, arrow: '→', label: 'Next project' },
            ].map(({ p: proj, arrow, label }) => (
              proj ? (
                <Link key={arrow} to={`/project/${proj.id}`} aria-label={label}
                  style={{
                    width: '36px', height: '36px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%',
                    color: 'var(--dim)',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    transition: 'color 0.2s, background 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--dim)'; e.currentTarget.style.background = 'transparent'; }}
                >{arrow}</Link>
              ) : (
                <div key={arrow} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dim-2)', opacity: 0.3 }}>{arrow}</div>
              )
            ))}
          </div>
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
        {/* Sidebar */}
        <div style={{
          width: isMobile ? '100%' : 'min(320px, 33%)',
          borderRight: isMobile ? 'none' : '1px solid var(--border)',
          borderBottom: isMobile ? '1px solid var(--border)' : 'none',
          padding: isMobile ? '1.75rem 1.25rem' : '2.5rem',
          background: 'var(--surface)',
          flexShrink: 0,
        }}>
          <div style={{ position: isMobile ? 'relative' : 'sticky', top: '4rem' }}>
            {meta && (
              <span style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.58rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                marginBottom: '1rem',
              }}>{meta}</span>
            )}
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 300,
              color: 'var(--text)',
              lineHeight: 1.15,
              marginBottom: '1.25rem',
            }}>{project.title}</h2>
            {project.description && (
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.95rem',
                lineHeight: 1.8,
                color: 'var(--dim)',
                marginBottom: '2rem',
              }}>{project.description}</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                ['Client', project.client],
                ['Scale', project.dimensions],
                ['Location', project.location],
                ['Year', project.year],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label} style={{ borderTop: '1px solid var(--border)', padding: '0.85rem 0' }}>
                  <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '0.3rem' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--text)' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Media column */}
        <div style={{ flex: 1, minWidth: 0, padding: 'clamp(1.5rem, 4vw, 3rem)', background: 'var(--bg)' }}>
          <div style={{ maxWidth: '860px' }}>
            {project.thumbnailUrl && renderBlock(project.thumbnailUrl, 'thumb', true)}
            {(project.mediaUrls || []).map((block, idx) => renderBlock(block, idx, false))}
          </div>

          {/* Prev/Next navigation */}
          {(prevProject || nextProject) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--border)', maxWidth: '860px' }}>
              {prevProject ? (
                <Link to={`/project/${prevProject.id}`} style={{ textDecoration: 'none', padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--surface)', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(196,165,116,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '0.5rem' }}>← Previous</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text)' }}>{prevProject.title}</div>
                </Link>
              ) : <div />}
              {nextProject ? (
                <Link to={`/project/${nextProject.id}`} style={{ textDecoration: 'none', padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--surface)', transition: 'border-color 0.2s', textAlign: 'right' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(196,165,116,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '0.5rem' }}>Next →</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text)' }}>{nextProject.title}</div>
                </Link>
              ) : <div />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
