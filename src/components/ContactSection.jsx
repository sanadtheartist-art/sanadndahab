import React, { useState } from 'react';
import { useSiteSettings } from '../lib/SiteContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const ContactSection = ({ sectionId = 'contact' }) => {
  const { settings, loading } = useSiteSettings();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error

  if (loading || !settings) return null;

  const contactTitle = settings.contactTitle || "Let's Create Together";
  const contactText = settings.contactText || '';
  const email = settings.emailLink || '';
  
  const socials = settings.socialLinks?.length 
    ? settings.socialLinks 
    : (settings.igLink ? [{ label: 'Instagram', url: settings.igLink }] : []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    setStatus('submitting');
    try {
      await addDoc(collection(db, 'messages'), {
        ...formData,
        createdAt: serverTimestamp(),
        read: false
      });
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      console.error('Error sending message:', err);
      setStatus('error');
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <section id={sectionId} className="max-w-4xl mx-auto px-4 md:px-10 py-32 text-center animate-fade-up">
      <p className="text-sm font-semibold tracking-[0.2em] uppercase text-accent mb-4">Contact</p>
      <h2 className="font-display text-4xl md:text-6xl mb-6">{contactTitle}</h2>
      
      {contactText && (
        <p className="text-lg md:text-xl text-dim max-w-2xl mx-auto mb-10">
          {contactText}
        </p>
      )}

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-surface/50 p-6 md:p-8 rounded-2xl border border-white/5 mb-12 text-left backdrop-blur-sm shadow-xl">
        <div className="mb-4">
          <label className="block text-sm font-medium text-dim mb-2" htmlFor="name">Name</label>
          <input 
            type="text" 
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-accent transition-colors"
            required
            disabled={status === 'submitting' || status === 'success'}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-dim mb-2" htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-accent transition-colors"
            required
            disabled={status === 'submitting' || status === 'success'}
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-dim mb-2" htmlFor="message">Message</label>
          <textarea 
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="5"
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-accent transition-colors resize-none"
            required
            disabled={status === 'submitting' || status === 'success'}
          />
        </div>
        <button 
          type="submit" 
          disabled={status === 'submitting' || status === 'success'}
          className="w-full bg-accent text-black font-semibold rounded-lg px-4 py-4 hover:bg-accent-hover transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'submitting' ? 'Sending...' : status === 'success' ? 'Message Sent!' : 'Send Message'}
        </button>
        {status === 'error' && (
          <p className="text-danger text-sm mt-4 text-center">Failed to send message. Please try again or use the email link below.</p>
        )}
      </form>

      {email && (
        <div className="mb-12">
          <span className="text-dim text-sm tracking-widest uppercase mb-4 block">Or reach out directly</span>
          <a 
            href={`mailto:${email}`} 
            className="text-xl md:text-3xl font-display text-white hover:text-accent transition-colors underline decoration-white/20 underline-offset-8"
          >
            {email}
          </a>
        </div>
      )}

      {socials.length > 0 && (
        <div className="flex flex-wrap justify-center gap-6">
          {socials.filter(s => s.url).map((s, idx) => (
            <a 
              key={idx}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium uppercase tracking-widest text-dim hover:text-white transition-colors border border-white/10 rounded-full px-6 py-3 hover:bg-white/5 hover:border-white/30"
            >
              {s.label || 'Link'}
            </a>
          ))}
        </div>
      )}
    </section>
  );
};

export default ContactSection;
