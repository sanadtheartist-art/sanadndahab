import React, { useState } from 'react';
import { useSiteSettings } from '../lib/SiteContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useIsMobile } from '../lib/useIsMobile';
import { CoralBranch, Bubbles, Fish } from './Decorations';

const ContactSection = ({ sectionId = 'contact' }) => {
  const { settings, loading } = useSiteSettings();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');
  const isMobile = useIsMobile();

  if (loading || !settings) return null;

  const contactTitle = settings.contactTitle || "Let's Create Together";
  const contactText  = settings.contactText  || '';
  const email        = settings.emailLink    || '';
  const socials = settings.socialLinks?.length
    ? settings.socialLinks
    : (settings.igLink ? [{ label: 'Instagram', url: settings.igLink }] : []);

  const whatsapp = socials.find(s => s.label?.toLowerCase().includes('whatsapp'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setStatus('submitting');
    try {
      await addDoc(collection(db, 'messages'), {
        ...formData, createdAt: serverTimestamp(), read: false
      });
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch {
      setStatus('error');
    }
  };

  const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const inputStyle = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.12)',
    padding: '0.75rem 0',
    color: 'var(--text)',
    fontFamily: 'var(--font-body)',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.3s',
    borderRadius: 0,
  };

  return (
    <section
      id={sectionId}
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(5rem, 10vw, 8rem) 1.5rem',
        borderTop: '1px solid var(--border)',
      }}
    >
      {/* Decorative elements */}
      <CoralBranch style={{ top: '5%', left: '2%', color: 'var(--accent)', width: '120px', transform: 'rotate(15deg)', opacity: 0.03 }} />
      <Bubbles style={{ top: '20%', right: '5%', color: 'var(--accent)', width: '70px', opacity: 0.03 }} />
      <Fish style={{ bottom: '10%', left: '8%', color: 'var(--accent)', width: '45px', opacity: 0.025 }} />

      {/* Background decorative text */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(5rem, 18vw, 14rem)',
        fontWeight: 300,
        color: 'transparent',
        WebkitTextStroke: '1px rgba(196,165,116,0.06)',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        userSelect: 'none',
        letterSpacing: '-0.02em',
      }}>
        Let's Talk
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '2rem', height: '1px', background: 'var(--accent)' }} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.62rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
            }}>Contact</span>
            <div style={{ width: '2rem', height: '1px', background: 'var(--accent)' }} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 300,
            color: 'var(--text)',
            lineHeight: 1.1,
            marginBottom: '1rem',
          }}>{contactTitle}</h2>
          {contactText && (
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              color: 'var(--dim)',
              lineHeight: 1.75,
              maxWidth: '480px',
              margin: '0 auto',
            }}>{contactText}</p>
          )}
        </div>

        {/* Commission CTA */}
        {whatsapp && (
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <a
              href={whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ fontSize: '0.88rem', padding: '0.8rem 2rem' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Commission a Mural
            </a>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.58rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--dim)',
                display: 'block',
                marginBottom: '0.5rem',
              }} htmlFor="name">Name</label>
              <input
                type="text" id="name" name="name"
                value={formData.name} onChange={handleChange}
                required disabled={status !== 'idle'}
                style={inputStyle}
                onFocus={e => e.target.style.borderBottomColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.12)'}
              />
            </div>
            <div>
              <label style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.58rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--dim)',
                display: 'block',
                marginBottom: '0.5rem',
              }} htmlFor="email">Email</label>
              <input
                type="email" id="email" name="email"
                value={formData.email} onChange={handleChange}
                required disabled={status !== 'idle'}
                style={inputStyle}
                onFocus={e => e.target.style.borderBottomColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.12)'}
              />
            </div>
          </div>
          <div>
            <label style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.58rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--dim)',
              display: 'block',
              marginBottom: '0.5rem',
            }} htmlFor="message">Message</label>
            <textarea
              id="message" name="message"
              value={formData.message} onChange={handleChange}
              rows="5" required disabled={status !== 'idle'}
              style={{ ...inputStyle, resize: 'none', lineHeight: 1.7 }}
              onFocus={e => e.target.style.borderBottomColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderBottomColor = 'rgba(255,255,255,0.12)'}
            />
          </div>
          <button
            type="submit"
            disabled={status !== 'idle'}
            className="btn-primary"
            style={{ alignSelf: 'flex-start', opacity: status !== 'idle' ? 0.5 : 1, cursor: status !== 'idle' ? 'not-allowed' : 'pointer' }}
          >
            {status === 'submitting' ? 'Sending…' : status === 'success' ? '✓ Message Sent' : 'Send Message'}
          </button>
          {status === 'error' && (
            <p style={{ color: 'var(--danger)', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}>
              Failed to send. Try reaching out directly via email.
            </p>
          )}
        </form>

        {/* Direct email */}
        {email && (
          <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.58rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--dim)',
              display: 'block',
              marginBottom: '0.75rem',
            }}>Or reach out directly</span>
            <a
              href={`mailto:${email}`}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.1rem, 3vw, 1.6rem)',
                color: 'var(--text)',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.15)',
                paddingBottom: '2px',
                transition: 'color 0.2s, border-color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            >
              {email}
            </a>
          </div>
        )}

        {/* Social links */}
        {socials.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem', marginTop: '2.5rem' }}>
            {socials.filter(s => s.url).map((s, idx) => (
              <a
                key={idx}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--dim)',
                  textDecoration: 'none',
                  border: '1px solid var(--border)',
                  padding: '0.5rem 1.1rem',
                  borderRadius: '2px',
                  transition: 'color 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--dim)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                {s.label || 'Link'}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ContactSection;
