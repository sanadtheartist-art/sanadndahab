import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link } from 'react-router-dom';
import { useIsMobile } from '../lib/useIsMobile';

const getThumb = (url) => {
  if (!url) return '';
  let u = url.trim();
  if (u.includes('cloudinary.com')) {
    return u.replace(/\/upload\/(?:f_[^/]+,q_[^/]+,w_\d+,c_limit\/)?/, '/upload/f_auto,q_50,w_700,c_limit/');
  }
  if (/googleusercontent\.com|ggpht\.com/i.test(u)) {
    let out = u.replace(/=s\d+[^&]*/gi, '').replace(/=w\d+[^&]*/gi, '');
    return out.endsWith('=s700') ? out : out + '=s700';
  }
  return u;
};

// Responsive column count hook
function useColumns() {
  const [cols, setCols] = useState(2);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setCols(w < 540 ? 1 : w < 900 ? 2 : 3);
    };
    update();
    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  }, []);
  return cols;
}

// Distribute projects into N columns (top-to-bottom order)
function toColumns(items, n) {
  const cols = Array.from({ length: n }, () => []);
  items.forEach((item, i) => cols[i % n].push(item));
  return cols;
}

// A single gallery card
const ProjectCard = ({ project }) => {
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect(); } },
      { threshold: 0.06 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const meta = [project.location, project.year].filter(Boolean).join(' · ');

  return (
    <Link
      ref={cardRef}
      to={`/project/${project.id}`}
      className="reveal"
      style={{
        display: 'block',
        textDecoration: 'none',
        borderRadius: '6px',
        overflow: 'hidden',
        background: 'var(--surface)',
        marginBottom: '0.75rem',
        position: 'relative',
        transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(196,165,116,0.15)'
          : '0 2px 12px rgba(0,0,0,0.3)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div style={{ overflow: 'hidden', position: 'relative' }}>
        <img
          src={getThumb(project.thumbnailUrl)}
          alt={project.title}
          loading="lazy"
          decoding="async"
          className="img-fade"
          onLoad={e => e.currentTarget.classList.add('loaded')}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            transition: 'transform 0.7s cubic-bezier(0.16,1,0.3,1)',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
          }}
        />

        {/* Gradient overlay — always visible at bottom */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(7,7,10,0.85) 0%, rgba(7,7,10,0.2) 45%, transparent 75%)',
          transition: 'opacity 0.4s',
          opacity: hovered ? 1 : 0.7,
        }} />

        {/* Badges */}
        <div style={{
          position: 'absolute', top: '0.75rem', left: '0.75rem',
          display: 'flex', gap: '6px', flexWrap: 'wrap',
        }}>
          {project.featured && (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.55rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              background: 'var(--accent)',
              color: '#000',
              padding: '3px 7px',
              borderRadius: '2px',
              fontWeight: 700,
            }}>★ Featured</span>
          )}
          {project.category && (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.55rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text)',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '3px 7px',
              borderRadius: '2px',
              background: 'rgba(7,7,10,0.6)',
              backdropFilter: 'blur(6px)',
            }}>{project.category}</span>
          )}
        </div>

        {/* Title + meta at bottom of image */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '1rem',
          transform: hovered ? 'translateY(0)' : 'translateY(4px)',
          transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1rem, 2.5vw, 1.35rem)',
            fontWeight: 400,
            color: 'var(--text)',
            margin: 0,
            lineHeight: 1.2,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>{project.title}</h3>
          {meta && (
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.58rem',
              letterSpacing: '0.12em',
              color: 'rgba(245,240,232,0.5)',
              textTransform: 'uppercase',
              margin: '4px 0 0',
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.35s',
            }}>{meta}</p>
          )}
        </div>
      </div>
    </Link>
  );
};

const PortfolioGallery = ({ sectionId = 'works', settings = {} }) => {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const cols = useColumns();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'projects'), (snap) => {
      const items = [];
      const cats = new Set();
      snap.forEach(doc => {
        const data = doc.data();
        if (data.status !== 'draft') {
          items.push({ id: doc.id, ...data });
          if (data.category) cats.add(data.category);
        }
      });
      items.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        const ao = a.sortOrder ?? 99999, bo = b.sortOrder ?? 99999;
        if (ao !== bo) return ao - bo;
        return (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0);
      });
      setProjects(items);
      setCategories([...cats]);
      setLoading(false);
    }, err => { console.error(err); setLoading(false); });
    return () => unsub();
  }, []);

  const filtered = activeFilter === 'all' ? projects : projects.filter(p => p.category === activeFilter);
  const columns = toColumns(filtered, cols);

  const Skeleton = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: '0.75rem',
      marginTop: '2rem',
    }}>
      {Array.from({ length: cols * 3 }).map((_, i) => (
        <div key={i} className="shimmer" style={{
          aspectRatio: i % 3 === 0 ? '3/4' : i % 3 === 1 ? '4/5' : '1/1',
          borderRadius: '6px',
        }} />
      ))}
    </div>
  );

  return (
    <section
      id={sectionId}
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'clamp(4rem, 8vw, 7rem) 1rem',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ width: '2rem', height: '1px', background: 'var(--accent)' }} />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.62rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
          }}>{settings.worksLabel || 'Portfolio'}</span>
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.2rem, 6vw, 4.5rem)',
          fontWeight: 300,
          lineHeight: 1.1,
          color: 'var(--text)',
          maxWidth: '600px',
        }}>{settings.worksTitle || 'Selected Works'}</h2>
        {settings.worksSubtitle && (
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.95rem',
            color: 'var(--dim)',
            marginTop: '0.75rem',
            maxWidth: '480px',
          }}>{settings.worksSubtitle}</p>
        )}
      </div>

      {/* Filter pills */}
      {categories.length > 1 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
          {['all', ...categories].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                padding: '0.4rem 1rem',
                borderRadius: '2px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s',
                background: activeFilter === cat ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                color: activeFilter === cat ? '#000' : 'var(--dim)',
                fontWeight: activeFilter === cat ? 700 : 400,
              }}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      )}

      {loading ? <Skeleton /> : filtered.length === 0 ? (
        <p style={{ color: 'var(--dim)', fontFamily: 'var(--font-body)', textAlign: 'center', padding: '4rem 0' }}>
          No works found.
        </p>
      ) : (
        /* True masonry: N JS-driven columns, each a flex column */
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: '0.75rem',
          alignItems: 'start',
        }}>
          {columns.map((colItems, ci) => (
            <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {colItems.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default PortfolioGallery;
