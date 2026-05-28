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

  // Scroll to top when project changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
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
    fetchData();
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

  const metaLine = [project.location, project.year, project.category].filter(Boolean).join(' · ');
  const detailRows = [
    ['Client', project.client],
    ['Scale', project.dimensions],
    ['Location', project.location],
    ['Year', project.year],
  ].filter(([, v]) => v);

  const renderBlock = (block, idx, isFirst) => {
    if (typeof block === 'string') {
      if (!block.trim()) return null;
      return (
        <img key={idx} src={upgradeImageUrl(block.trim())} alt={project.title}
          className="img-fade" onLoad={e => e.currentTarget.classList.add('loaded')}
          loading={isFirst ? 'eager' : 'lazy'} decoding="async"
          style={{ width: '100%', height: 'auto', borderRadius: isMobile ? '4px' : '4px', display: 'block', marginBottom: isMobile ? '0.5rem' : '0.75rem' }} />
      );
    }
    if (block?.type === 'media' && block.content?.trim()) {
      return (
        <img key={idx} src={upgradeImageUrl(block.content.trim())} alt={project.title}
          className="img-fade" onLoad={e => e.currentTarget.classList.add('loaded')}
          loading={isFirst ? 'eager' : 'lazy'} decoding="async"
          style={{ width: '100%', height: 'auto', borderRadius: '4px', display: 'block', marginBottom: isMobile ? '0.5rem' : '0.75rem' }} />
      );
    }
    if (block?.type === 'text' && block.content?.trim()) {
      return (
        <div key={idx}
          style={{ fontFamily: 'var(--font-body)', fontSize: isMobile ? '0.9rem' : '1rem', lineHeight: 1.8, color: 'var(--dim)', margin: isMobile ? '1.25rem 0' : '1.5rem 0' }}
          dangerouslySetInnerHTML={{ __html: block.content.replace(/\n/g, '<br>') }}
        />
      );
    }
    if (block?.type === 'embed' && block.content?.trim()) {
      let code = block.content;
      if (code.includes('youtube.com/embed/') || code.includes('youtu.be/')) {
        code = code.replace(/<iframe\s/i, '<iframe style="width:100%;aspect-ratio:16/9;display:block;" ');
      }
      return <div key={idx} style={{ margin: '1.25rem 0', overflow: 'hidden', borderRadius: '4px' }} dangerouslySetInnerHTML={{ __html: code }} />;
    }
    return null;
  };

  /* ────────────── MOBILE LAYOUT ────────────── */
  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        {/* Compact sticky header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 200,
          background: 'rgba(7,7,10,0.95)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--border)',
          padding: '0 0.75rem',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            height: '3rem',
          }}>
            <Link to="/" style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--dim)', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '0.3rem',
            }}>
              ← Back
            </Link>
            <div style={{ display: 'flex', gap: '2px' }}>
              {prevProject ? (
                <Link to={`/project/${prevProject.id}`} aria-label="Previous"
                  style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dim)', textDecoration: 'none', fontSize: '1rem' }}>←</Link>
              ) : <div style={{ width: 34 }} />}
              {nextProject ? (
                <Link to={`/project/${nextProject.id}`} aria-label="Next"
                  style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dim)', textDecoration: 'none', fontSize: '1rem' }}>→</Link>
              ) : <div style={{ width: 34 }} />}
            </div>
          </div>
        </header>

        {/* Hero image — full bleed */}
        {project.thumbnailUrl && (
          <div style={{ width: '100%' }}>
            <img
              src={upgradeImageUrl(project.thumbnailUrl)}
              alt={project.title}
              style={{ width: '100%', height: 'auto', display: 'block' }}
              loading="eager"
            />
          </div>
        )}

        {/* Project info */}
        <div style={{ padding: '1.5rem 1rem' }}>
          {metaLine && (
            <span style={{
              display: 'block',
              fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--accent)', marginBottom: '0.75rem',
            }}>{metaLine}</span>
          )}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem', fontWeight: 300,
            color: 'var(--text)', lineHeight: 1.15,
            marginBottom: '0.85rem',
          }}>{project.title}</h1>
          {project.description && (
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '0.9rem',
              lineHeight: 1.75, color: 'var(--dim)',
            }}>{project.description}</p>
          )}

          {/* Detail chips */}
          {detailRows.length > 0 && (
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
              marginTop: '1.25rem', paddingTop: '1rem',
              borderTop: '1px solid var(--border)',
            }}>
              {detailRows.map(([label, value]) => (
                <div key={label} style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  padding: '0.5rem 0.85rem',
                  flex: '1 1 auto',
                  minWidth: '120px',
                }}>
                  <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '0.2rem' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--text)' }}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Media gallery */}
        <div style={{ padding: '0 0.75rem 2rem' }}>
          {(project.mediaUrls || []).map((block, idx) => renderBlock(block, idx, false))}
        </div>

        {/* Prev / Next nav */}
        {(prevProject || nextProject) && (
          <div style={{
            display: 'flex', gap: '0.5rem',
            padding: '0 0.75rem 2rem',
          }}>
            {prevProject ? (
              <Link to={`/project/${prevProject.id}`} style={{
                flex: 1, textDecoration: 'none',
                padding: '1rem', borderRadius: '4px',
                border: '1px solid var(--border)', background: 'var(--surface)',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '0.35rem' }}>← Prev</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{prevProject.title}</div>
              </Link>
            ) : <div style={{ flex: 1 }} />}
            {nextProject ? (
              <Link to={`/project/${nextProject.id}`} style={{
                flex: 1, textDecoration: 'none',
                padding: '1rem', borderRadius: '4px',
                border: '1px solid var(--border)', background: 'var(--surface)',
                textAlign: 'right',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '0.35rem' }}>Next →</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{nextProject.title}</div>
              </Link>
            ) : <div style={{ flex: 1 }} />}
          </div>
        )}
      </div>
    );
  }

  /* ────────────── DESKTOP LAYOUT ────────────── */
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
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          maxWidth: '1200px', margin: '0 auto', height: '3.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, minWidth: 0 }}>
            <Link to="/" style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: 'var(--dim)', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0,
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--dim)'}
            >
              ← Back
            </Link>
            <div style={{ width: '1px', height: '16px', background: 'var(--border)', flexShrink: 0 }} />
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 400,
              color: 'var(--text)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
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
                    borderRadius: '50%', color: 'var(--dim)', textDecoration: 'none',
                    fontSize: '1rem', transition: 'color 0.2s, background 0.2s',
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

      {/* Body: sidebar + media */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'row' }}>
        {/* Sidebar */}
        <div style={{
          width: 'min(320px, 33%)',
          borderRight: '1px solid var(--border)',
          padding: '2.5rem',
          background: 'var(--surface)',
          flexShrink: 0,
        }}>
          <div style={{ position: 'sticky', top: '4rem' }}>
            {metaLine && (
              <span style={{
                display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: 'var(--accent)', marginBottom: '1rem',
              }}>{metaLine}</span>
            )}
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 300,
              color: 'var(--text)', lineHeight: 1.15, marginBottom: '1.25rem',
            }}>{project.title}</h2>
            {project.description && (
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '0.95rem',
                lineHeight: 1.8, color: 'var(--dim)', marginBottom: '2rem',
              }}>{project.description}</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {detailRows.map(([label, value]) => (
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
