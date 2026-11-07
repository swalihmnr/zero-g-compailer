import React, { useEffect } from 'react';
import { X, ExternalLink, Sparkles, Terminal, Code2, WifiOff, CheckCircle2 } from 'lucide-react';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(6px)',
                padding: '1rem'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '560px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: '0.75rem',
                    boxShadow: 'var(--shadow-lg)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div
                    style={{
                        padding: '1.25rem 1.5rem',
                        borderBottom: '1px solid var(--border-strong)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: 'var(--bg-panel-header)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                            style={{
                                width: '2rem',
                                height: '2rem',
                                borderRadius: '0.5rem',
                                background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                boxShadow: '0 2px 8px rgba(168, 85, 247, 0.3)'
                            }}
                        >
                            <Code2 className="w-4 h-4" />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.02em', color: 'var(--text-primary)' }}>
                                Zero-G Compiler
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontWeight: 500 }}>
                                Developer Story & Details
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="btn-icon"
                        title="Close (Esc)"
                        aria-label="Close"
                        style={{ padding: '0.35rem', borderRadius: '0.375rem' }}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Modal Content Body */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.875rem', lineHeight: '1.6' }}>
                    
                    {/* The Origin Story Banner */}
                    <div
                        style={{
                            padding: '1rem 1.25rem',
                            borderRadius: '0.5rem',
                            backgroundColor: 'var(--bg-control)',
                            border: '1px solid var(--border-strong)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.625rem'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-purple)', fontWeight: 700, fontSize: '0.85rem' }}>
                            <Sparkles className="w-4 h-4 flex-shrink-0" />
                            <span>The Story Behind Zero-G Compiler</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: 0, lineHeight: '1.65' }}>
                            "When practicing problem-solving, I used to copy questions from ChatGPT and found myself constantly switching back and forth between tabs and apps just to re-read the problem while writing code. On top of that, whenever I lost internet connection, existing online compilers became completely unusable and broke my workflow."
                        </p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', margin: 0, lineHeight: '1.65' }}>
                            "That frustration sparked this project: I built <strong style={{ color: 'var(--text-primary)' }}>Zero-G Compiler</strong> to solve that exact problem — paste your question sets once into the sidebar, track tasks seamlessly, write and test code offline with zero distractions and no app switching."
                        </p>
                    </div>

                    {/* Offline & Architecture Highlights */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-faint)' }}>
                            Key Capabilities
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.625rem' }}>
                            <div
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    backgroundColor: 'var(--bg-panel-header)',
                                    border: '1px solid var(--border-strong)',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '0.625rem'
                                }}
                            >
                                <WifiOff className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-green)' }} />
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>100% Offline Ready</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Self-contained runtime without third-party CDN or cloud judge lock-in.</div>
                                </div>
                            </div>

                            <div
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    backgroundColor: 'var(--bg-panel-header)',
                                    border: '1px solid var(--border-strong)',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '0.625rem'
                                }}
                            >
                                <Terminal className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-blue)' }} />
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>Smart Question Parser</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Paste raw AI question lists — parses and tracks completed tasks automatically.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Developer Info & Portfolio Link */}
                    <div
                        style={{
                            padding: '1rem 1.25rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--border-strong)',
                            backgroundColor: 'var(--bg-panel-header)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '0.75rem'
                        }}
                    >
                        <div>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-faint)', fontWeight: 700 }}>
                                Developed By
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                Swalimnr
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Full-Stack & Systems Developer
                            </div>
                        </div>

                        <a
                            href="https://personal-portfolio-tau-ashy.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-run"
                            style={{
                                textDecoration: 'none',
                                backgroundColor: 'var(--accent-purple)',
                                padding: '0.45rem 0.9rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                fontSize: '0.75rem',
                                color: '#ffffff',
                                borderRadius: '0.375rem',
                                fontWeight: 600
                            }}
                        >
                            <span>View Portfolio</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </div>

                {/* Modal Footer */}
                <div
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderTop: '1px solid var(--border-strong)',
                        backgroundColor: 'var(--bg-panel-header)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                        color: 'var(--text-faint)'
                    }}
                >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-green)' }} />
                        Local Storage Persistent
                    </span>
                    <button
                        onClick={onClose}
                        className="btn-save"
                        style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

