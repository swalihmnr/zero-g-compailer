import React, { useState, useRef, useEffect } from 'react';
import { SupportedLanguage } from '../types';
import { LANGUAGES } from '../constants';
import {
    Play, Save, RotateCcw, PanelLeftClose, PanelLeft,
    Zap, Sparkles, Columns, Sun, Moon, Code2, ChevronDown
} from 'lucide-react';

interface HeaderProps {
    language: SupportedLanguage;
    onLanguageChange: (lang: SupportedLanguage) => void;
    autoRun: boolean;
    onAutoRunToggle: (enabled: boolean) => void;
    autoSuggest: boolean;
    onAutoSuggestToggle: (enabled: boolean) => void;
    onSave: () => void;
    onReset: () => void;
    onRun: () => void;
    isRunning: boolean;
    isSidebarOpen: boolean;
    onToggleSidebar: () => void;
    isSplitScreen: boolean;
    onToggleSplitScreen: (enabled: boolean) => void;
    isDark: boolean;
    onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    language,
    onLanguageChange,
    autoRun,
    onAutoRunToggle,
    autoSuggest,
    onAutoSuggestToggle,
    onSave,
    onReset,
    onRun,
    isRunning,
    isSidebarOpen,
    onToggleSidebar,
    isSplitScreen,
    onToggleSplitScreen,
    isDark,
    onToggleTheme
}) => {
    const activeLang = LANGUAGES[language] || LANGUAGES['javascript'];
    const [langOpen, setLangOpen] = useState(false);
    const langRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (langRef.current && !langRef.current.contains(e.target as Node)) {
                setLangOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <header className="header-bar h-14 px-4 flex items-center justify-between flex-shrink-0 z-20">
            {/* Left: Sidebar Toggle & Branding */}
            <div className="flex items-center gap-3">
                {/* Sidebar Toggle */}
                <button
                    onClick={onToggleSidebar}
                    className="btn-icon"
                    title={isSidebarOpen ? 'Collapse Tasks Panel' : 'Expand Tasks Panel'}
                >
                    {isSidebarOpen
                        ? <PanelLeftClose className="w-4 h-4" />
                        : <PanelLeft className="w-4 h-4" />}
                </button>

                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr flex items-center justify-center shadow-sm">
                        <Code2 className="w-4 h-4" style={{ color: '#ffffff' }} />
                    </div>
                    <div>
                        <div className="text-sm font-bold font-mono tracking-wider" style={{ color: 'var(--accent-purple)' }}>
                            ZERO-G
                        </div>
                        <div className="text-[9px] font-mono leading-none" style={{ color: 'var(--text-faint)' }}>COMPILER</div>
                    </div>
                </div>

                <div className="h-4 w-px hidden sm:block" style={{ backgroundColor: 'var(--border-strong)' }}></div>

                {/* Active File Tab with colored dot */}
                <div className="hidden sm:flex file-tab">
                    <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                            backgroundColor: activeLang.color,
                            boxShadow: `0 0 6px ${activeLang.color}90`
                        }}
                    ></span>
                    <span>{activeLang.fileName}</span>
                </div>
            </div>

            {/* Right: Controls & Actions */}
            <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Language Selector Dropdown */}
                <div ref={langRef} style={{ position: 'relative' }}>
                    <button
                        onClick={() => setLangOpen((v) => !v)}
                        className="btn-control"
                        aria-label="Programming Language"
                        title="Select Programming Language"
                    >
                        <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{
                                backgroundColor: activeLang.color,
                                boxShadow: `0 0 6px ${activeLang.color}80`
                            }}
                        ></span>
                        <span style={{ fontWeight: 600 }}>{activeLang.name}</span>
                        <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                    </button>

                    {langOpen && (
                        <div
                            style={{
                                position: 'absolute',
                                top: 'calc(100% + 6px)',
                                right: 0,
                                zIndex: 100,
                                width: '180px',
                                maxHeight: '360px',
                                overflowY: 'auto',
                                backgroundColor: 'var(--bg-card)',
                                border: '1px solid var(--border-strong)',
                                borderRadius: '0.5rem',
                                boxShadow: 'var(--shadow-lg)',
                                padding: '4px'
                            }}
                        >
                            <div style={{
                                padding: '6px 8px 4px',
                                fontSize: '10px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                color: 'var(--text-faint)'
                            }}>
                                Languages ({Object.keys(LANGUAGES).length})
                            </div>
                            {Object.values(LANGUAGES).map((lang) => {
                                const isSelected = lang.id === language;
                                return (
                                    <button
                                        key={lang.id}
                                        onClick={() => { onLanguageChange(lang.id); setLangOpen(false); }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            width: '100%',
                                            padding: '7px 10px',
                                            borderRadius: '0.375rem',
                                            fontSize: '12px',
                                            fontWeight: isSelected ? 600 : 400,
                                            color: isSelected ? 'var(--accent-purple)' : 'var(--text-primary)',
                                            backgroundColor: isSelected ? 'var(--bg-card-active)' : 'transparent',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'background 0.12s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected) {
                                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-card-hover)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) {
                                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                                            }
                                        }}
                                    >
                                        <span
                                            style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                backgroundColor: lang.color,
                                                flexShrink: 0,
                                                boxShadow: `0 0 6px ${lang.color}70`
                                            }}
                                        ></span>
                                        <span style={{ flex: 1 }}>{lang.name}</span>
                                        {isSelected && (
                                            <span style={{ fontSize: '11px', color: 'var(--accent-purple)' }}>✓</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Auto Suggest Toggle */}
                <label
                    className="toggle-badge"
                    title={autoSuggest ? 'Auto Suggestions: ON (Click to disable)' : 'Auto Suggestions: OFF (Click to enable)'}
                >
                    <input
                        type="checkbox"
                        checked={autoSuggest}
                        onChange={(e) => onAutoSuggestToggle(e.target.checked)}
                    />
                    <Sparkles className="w-3.5 h-3.5" style={{ color: autoSuggest ? 'var(--accent-purple)' : 'var(--text-muted)' }} />
                    <span className="hidden xl:inline">Auto Suggest</span>
                    <span className="xl:hidden hidden sm:inline">Suggest</span>
                </label>

                {/* Auto Run Toggle */}
                <label
                    className="toggle-badge"
                    title={autoRun ? 'Auto Run: ON (Runs automatically on typing)' : 'Auto Run: OFF'}
                >
                    <input
                        type="checkbox"
                        checked={autoRun}
                        onChange={(e) => onAutoRunToggle(e.target.checked)}
                    />
                    <Zap className="w-3.5 h-3.5" style={{ color: autoRun ? 'var(--accent-amber)' : 'var(--text-muted)' }} />
                    <span className="hidden md:inline">Auto Run</span>
                </label>

                {/* Split Screen Toggle */}
                <label
                    className="toggle-badge"
                    title={isSplitScreen ? 'Split Screen: ON (Side-by-side mode)' : 'Split Screen: OFF'}
                >
                    <input
                        type="checkbox"
                        checked={isSplitScreen}
                        onChange={(e) => onToggleSplitScreen(e.target.checked)}
                    />
                    <Columns className="w-3.5 h-3.5" style={{ color: isSplitScreen ? 'var(--accent-blue)' : 'var(--text-muted)' }} />
                    <span className="hidden md:inline">Split</span>
                </label>

                {/* Divider */}
                <div className="h-5 w-px" style={{ backgroundColor: 'var(--border-strong)' }}></div>

                {/* Theme Toggle (Sun / Moon) */}
                <button
                    onClick={onToggleTheme}
                    className="btn-icon"
                    title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    aria-label="Toggle theme"
                >
                    {isDark
                        ? <Sun className="w-4 h-4" style={{ color: 'var(--accent-amber)' }} />
                        : <Moon className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />}
                </button>

                {/* Reset Boilerplate */}
                <button
                    onClick={onReset}
                    className="btn-icon"
                    title="Clear editor code"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>

                {/* Save Button */}
                <button
                    onClick={onSave}
                    className="btn-save"
                    title="Save Code to Local File"
                >
                    <Save className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Save</span>
                </button>

                {/* Run Code Button */}
                <button
                    onClick={onRun}
                    disabled={isRunning}
                    className="btn-run"
                    title="Run Code (Ctrl + Enter)"
                >
                    {isRunning ? (
                        <>
                            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Running...</span>
                        </>
                    ) : (
                        <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Run</span>
                            <span className="hidden lg:inline text-[10px] opacity-80 font-mono">(Ctrl+Enter)</span>
                        </>
                    )}
                </button>
            </div>
        </header>
    );
};
