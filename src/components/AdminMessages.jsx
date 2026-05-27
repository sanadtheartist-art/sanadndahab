import React, { useState } from 'react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const AdminMessages = ({ messages, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const [expandedId, setExpandedId] = useState(null);

  // Stats calculation
  const totalCount = messages.length;
  const unreadCount = messages.filter(m => !m.read).length;
  const readCount = totalCount - unreadCount;

  // Search & Filter Logic
  const filteredMessages = messages.filter(msg => {
    // Filter status
    if (filter === 'unread' && msg.read) return false;
    if (filter === 'read' && !msg.read) return false;

    // Search query
    if (searchTerm.trim() === '') return true;
    const query = searchTerm.toLowerCase();
    const name = msg.name?.toLowerCase() || '';
    const email = msg.email?.toLowerCase() || '';
    const text = msg.message?.toLowerCase() || '';
    return name.includes(query) || email.includes(query) || text.includes(query);
  });

  const toggleReadStatus = async (id, currentReadStatus, e) => {
    e.stopPropagation(); // Avoid triggering card expansion
    try {
      await updateDoc(doc(db, 'messages', id), {
        read: !currentReadStatus
      });
    } catch (err) {
      console.error('Failed to update message status:', err);
      alert('Failed to update status');
    }
  };

  const deleteMessage = async (id, e) => {
    e.stopPropagation(); // Avoid triggering card expansion
    if (!window.confirm('Are you sure you want to delete this message? This action is permanent.')) return;
    try {
      await deleteDoc(doc(db, 'messages', id));
    } catch (err) {
      console.error('Failed to delete message:', err);
      alert('Failed to delete message');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Messages Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface2/50 border border-white/5 rounded-xl p-5 backdrop-blur-sm">
          <p className="text-xs text-dim uppercase tracking-wider font-semibold mb-1">Total Received</p>
          <p className="text-3xl font-display text-white">{totalCount}</p>
        </div>
        <div className="bg-surface2/50 border border-white/5 rounded-xl p-5 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors duration-500"></div>
          <p className="text-xs text-dim uppercase tracking-wider font-semibold mb-1">Unread Inbox</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-display text-accent">{unreadCount}</p>
            {unreadCount > 0 && (
              <span className="flex h-2 w-2 relative top-[-10px]">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
            )}
          </div>
        </div>
        <div className="bg-surface2/50 border border-white/5 rounded-xl p-5 backdrop-blur-sm">
          <p className="text-xs text-dim uppercase tracking-wider font-semibold mb-1">Reviewed Messages</p>
          <p className="text-3xl font-display text-white">{readCount}</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface border border-white/5 p-4 rounded-xl">
        {/* Pills */}
        <div className="flex bg-black/30 p-1 rounded-lg border border-white/5 w-full md:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 md:flex-initial px-4 py-2 text-xs font-semibold rounded-md transition-all ${filter === 'all' ? 'bg-surface2 text-accent border border-white/5' : 'text-dim hover:text-white'
              }`}
          >
            All <span className="ml-1 px-1.5 py-0.5 rounded-full bg-black/40 text-[10px] text-dim">{totalCount}</span>
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 md:flex-initial px-4 py-2 text-xs font-semibold rounded-md transition-all ${filter === 'unread' ? 'bg-surface2 text-accent border border-white/5' : 'text-dim hover:text-white'
              }`}
          >
            Unread <span className="ml-1 px-1.5 py-0.5 rounded-full bg-black/40 text-[10px] text-accent">{unreadCount}</span>
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`flex-1 md:flex-initial px-4 py-2 text-xs font-semibold rounded-md transition-all ${filter === 'read' ? 'bg-surface2 text-accent border border-white/5' : 'text-dim hover:text-white'
              }`}
          >
            Read <span className="ml-1 px-1.5 py-0.5 rounded-full bg-black/40 text-[10px] text-dim">{readCount}</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search name, email, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/25 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-dim outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-dim animate-pulse">Synchronizing with mailbox...</p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="bg-surface border border-white/5 rounded-xl p-12 text-center flex flex-col items-center justify-center">
          <svg className="h-12 w-12 text-dim mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
          </svg>
          <h4 className="text-lg text-white font-display mb-1">Inbox Empty</h4>
          <p className="text-sm text-dim max-w-sm">No messages fit your current filter criteria. New messages submitted via the site contact form will show up here instantly.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((msg) => {
            const isExpanded = expandedId === msg.id;
            return (
              <div
                key={msg.id}
                onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                className={`group border rounded-xl transition-all duration-300 cursor-pointer ${!msg.read
                  ? 'bg-surface border-accent/20 hover:border-accent/40 shadow-[0_0_15px_rgba(var(--color-accent-rgb),0.02)]'
                  : 'bg-surface2/30 border-white/5 hover:border-white/10'
                  }`}
              >
                {/* Header Information */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
                  <div className="flex items-start gap-4">
                    {/* Status Dot */}
                    <div className="mt-1.5 flex-shrink-0">
                      {!msg.read ? (
                        <span className="flex h-2.5 w-2.5 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
                        </span>
                      ) : (
                        <svg className="h-4 w-4 text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    {/* Sender Details */}
                    <div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-semibold text-white group-hover:text-accent transition-colors">
                          {msg.name || 'Anonymous'}
                        </span>
                        <span className="text-xs text-dim">•</span>
                        <a
                          href={`mailto:${msg.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-dim hover:text-white underline decoration-white/15 underline-offset-2 transition-all"
                        >
                          {msg.email}
                        </a>
                      </div>

                      {/* Short Preview */}
                      {!isExpanded && (
                        <p className="text-sm text-dim line-clamp-1 mt-1 font-sans">
                          {msg.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Meta */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 ml-8 sm:ml-0">
                    <span className="text-xs text-dim font-medium whitespace-nowrap">
                      {formatDate(msg.createdAt)}
                    </span>

                    {/* Small Quick-Action Buttons */}
                    <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => toggleReadStatus(msg.id, msg.read, e)}
                        title={msg.read ? 'Mark as Unread' : 'Mark as Read'}
                        className="p-1.5 hover:bg-white/5 rounded text-dim hover:text-white transition-colors"
                      >
                        {msg.read ? (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      <button
                        onClick={(e) => deleteMessage(msg.id, e)}
                        title="Delete permanently"
                        className="p-1.5 hover:bg-danger/10 rounded text-dim hover:text-danger transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 border-t border-white/5 ml-8 animate-fade-down select-text">
                    <div className="bg-black/25 rounded-lg p-4 border border-white/5 mb-4 text-white text-sm whitespace-pre-wrap leading-relaxed font-sans select-all">
                      {msg.message}
                    </div>

                    {/* Big Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={`mailto:${msg.email}?subject=Re: Portfolio Contact&body=Hi ${msg.name},%0A%0A`}
                          onClick={(e) => e.stopPropagation()}
                          className="px-4 py-2 bg-accent text-black font-semibold text-xs rounded hover:bg-accent-hover transition-colors flex items-center gap-1.5"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                          Reply to Sender
                        </a>
                        <button
                          onClick={(e) => toggleReadStatus(msg.id, msg.read, e)}
                          className="px-4 py-2 border border-white/10 hover:border-white/20 text-white font-semibold text-xs rounded hover:bg-white/5 transition-colors"
                        >
                          {msg.read ? 'Mark as Unread' : 'Mark as Read'}
                        </button>
                      </div>

                      <button
                        onClick={(e) => deleteMessage(msg.id, e)}
                        className="px-4 py-2 text-xs font-semibold text-danger border border-danger/10 hover:border-danger/20 rounded hover:bg-danger/5 transition-colors flex items-center gap-1.5"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Message
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
