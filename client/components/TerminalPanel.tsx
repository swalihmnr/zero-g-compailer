import React, { useRef, useEffect } from 'react';
import { TerminalEntry } from '../types';
import { Copy, Check, Trash2, ChevronUp, ChevronDown, Terminal as TerminalIcon, AlertTriangle } from 'lucide-react';

interface TerminalPanelProps {
    entries: TerminalEntry[];
    onClear: () => void;
    isRunning: boolean;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

/** Renders the actual output content — shared by both normal and split-screen output panels */
export const OutputContent: React.FC<{
    entries: TerminalEntry[];
    isRunning: boolean;
    scrollRef: React.RefObject<HTMLDivElement>;
}> = ({ entries, isRunning, scrollRef }) => {
    // Separate stdout lines and error block
    const stdoutEntries = entries.filter((e) => e.type === 'stdout');
    const stderrEntries = entries.filter((e) => e.type === 'stderr');
    const hasOutput     = stdoutEntries.length > 0;
    const hasError      = stderrEntries.length > 0;
    const isEmpty       = entries.length === 0 && !isRunning;

    return (
        <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto select-text"
            style={{
                fontFamily: "'JetBrains Mono', Consolas, monospace",
                backgroundColor: 'var(--bg-output)'
            }}
        >
            {/* Running indicator */}
            {isRunning && (
                <div
                    className="flex items-center gap-2 px-4 py-2.5 text-xs animate-pulse"
                    style={{
                        color: 'var(--accent-amber)',
                        borderBottom: '1px solid var(--border-strong)',
                        backgroundColor: 'var(--bg-panel-header)'
                    }}
                >
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent-amber)' }}></span>
                    <span style={{ fontWeight: 600 }}>Running code...</span>
                </div>
            )}

            {/* Empty state */}
            {isEmpty && (
                <div className="flex flex-col items-center justify-center h-full gap-3 select-none py-12" style={{ color: 'var(--text-faint)' }}>
                    <TerminalIcon className="w-9 h-9 opacity-30" />
                    <span className="text-xs font-mono">Run your code to see output here</span>
                </div>
            )}

            {/* Standard output */}
            {hasOutput && (
                <div className="px-4 py-3">
                    {stdoutEntries.map((entry) => (
                        <pre
                            key={entry.id}
                            className="text-[13px] leading-relaxed whitespace-pre-wrap break-words"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {entry.content}
                        </pre>
                    ))}
                </div>
            )}

            {/* Error block — Programiz style */}
            {hasError && (
                <div className="error-card">
                    {/* Error label bar */}
                    <div className="error-card-header">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Compilation / Runtime Error</span>
                    </div>
                    {/* Error content */}
                    {stderrEntries.map((entry) => (
                        <pre key={entry.id} className="error-card-body">
                            {entry.content}
                        </pre>
                    ))}
                </div>
            )}
        </div>
    );
};

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
    entries,
    onClear,
    isRunning,
    isCollapsed,
    onToggleCollapse
}) => {
    const [copied, setCopied] = React.useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll on new output
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [entries, isRunning]);

    const handleCopy = () => {
        const text = entries.map((e) => e.content).join('\n');
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <section
            className={`border-t flex flex-col flex-shrink-0 transition-all duration-200 ${
                isCollapsed ? 'h-9' : 'h-48 md:h-64'
            }`}
            style={{ backgroundColor: 'var(--bg-output)' }}
        >
            {/* Panel Header */}
            <div className="panel-header h-9 px-3 flex items-center justify-between flex-shrink-0 select-none">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onToggleCollapse}
                        className="btn-icon"
                        title={isCollapsed ? 'Expand Output' : 'Collapse Output'}
                    >
                        {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <TerminalIcon className="w-3.5 h-3.5" style={{ color: 'var(--accent-purple)' }} />
                    <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                        Terminal Output
                    </span>
                    {isRunning && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono animate-pulse" style={{ color: 'var(--accent-amber)' }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent-amber)' }}></span>
                            running
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={handleCopy}
                        disabled={entries.length === 0}
                        className="btn-icon"
                        title="Copy output"
                    >
                        {copied ? <Check className="w-3.5 h-3.5" style={{ color: 'var(--accent-green)' }} /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                        onClick={onClear}
                        className="btn-icon"
                        title="Clear output"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Panel Body */}
            {!isCollapsed && (
                <OutputContent entries={entries} isRunning={isRunning} scrollRef={scrollRef} />
            )}
        </section>
    );
};
