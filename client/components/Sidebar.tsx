import React, { useState, useEffect } from 'react';
import { TaskItem } from '../types';
import { FileText, CheckCircle2, Circle, ArrowRight, Edit3, PlusCircle, AlertCircle, Trash2 } from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    tasks: TaskItem[];
    activeTaskId: string | number | null;
    onSelectTask: (task: TaskItem) => void;
    onUpdateTasks: (tasks: TaskItem[]) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    tasks,
    activeTaskId,
    onSelectTask,
    onUpdateTasks
}) => {
    const [tab] = useState<'paste'>('paste');
    const [pasteText, setPasteText] = useState<string>(() => {
        try {
            return localStorage.getItem('zerog_paste_text') || '';
        } catch (e) {
            return '';
        }
    });
    const [isEditingPaste, setIsEditingPaste] = useState<boolean>(tasks.length === 0);
    const [parseNotice, setParseNotice] = useState<string | null>(null);

    // Persist raw paste text to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('zerog_paste_text', pasteText);
        } catch (e) {
            console.error('Failed to save pasteText to localStorage:', e);
        }
    }, [pasteText]);

    if (!isOpen) return null;

    // Checks if a line is a comment in standard languages (//, #, /*, *, --)
    const isCommentLine = (line: string): boolean => {
        return /^\s*(\/\/|#|\/\*|\*|--)/.test(line);
    };

    // Parse questions while ignoring any commented questions
    const handleParse = () => {
        setParseNotice(null);
        if (!pasteText.trim()) return;

        const lines = pasteText.split('\n');

        // Regex matches question headers with optional comment marker:
        // Examples: "1. Two Sum", "// 1. Two Sum", "# 2. Reverse", "1) Valid"
        const headerRegex = /^\s*(\/\/|#|\/\*|\*|--)?\s*(\d+)[\.\)]\s*(.+)$/;

        const headerIndices: Array<{
            lineIndex: number;
            isCommented: boolean;
            id: string;
            title: string;
        }> = [];

        for (let i = 0; i < lines.length; i++) {
            const match = lines[i].match(headerRegex);
            if (match) {
                headerIndices.push({
                    lineIndex: i,
                    isCommented: Boolean(match[1]), // true if prefixed with //, #, /*, etc.
                    id: match[2],
                    title: match[3].replace(/\*\/$/, '').trim()
                });
            }
        }

        const validTasks: TaskItem[] = [];
        let skippedCommentedCount = 0;

        if (headerIndices.length > 0) {
            for (let i = 0; i < headerIndices.length; i++) {
                const current = headerIndices[i];
                const next = headerIndices[i + 1];
                const startLine = current.lineIndex;
                const endLine = next ? next.lineIndex : lines.length;

                const blockLines = lines.slice(startLine, endLine);
                const nonBlankLines = blockLines.filter((l) => l.trim().length > 0);

                // A question is considered commented if:
                // 1. Its header line starts with a comment token (//, #, /*, *), OR
                // 2. All non-empty lines in the block start with comment tokens
                const isEntirelyCommented =
                    nonBlankLines.length > 0 && nonBlankLines.every((l) => isCommentLine(l));

                if (current.isCommented || isEntirelyCommented) {
                    skippedCommentedCount++;
                    continue; // SKIP commented question!
                }

                // Clean the content of any incidental inline comments at boundaries if needed
                const content = blockLines.join('\n').trim();

                validTasks.push({
                    id: current.id,
                    title: current.title,
                    content,
                    difficulty: 'Manual',
                    isCompleted: false
                });
            }
        } else {
            // Fallback for non-numbered questions separated by blank lines
            const blocks = pasteText.split(/\n\s*\n/);
            let count = 1;

            for (const block of blocks) {
                const trimmed = block.trim();
                if (!trimmed) continue;

                const blockLines = trimmed.split('\n');
                const nonBlankLines = blockLines.filter((l) => l.trim().length > 0);
                const firstLine = nonBlankLines[0] || '';

                const isCommented =
                    isCommentLine(firstLine) ||
                    (nonBlankLines.length > 0 && nonBlankLines.every((l) => isCommentLine(l)));

                if (isCommented) {
                    skippedCommentedCount++;
                    continue; // SKIP commented question!
                }

                validTasks.push({
                    id: count++,
                    title: firstLine.substring(0, 40).trim(),
                    content: trimmed,
                    difficulty: 'Manual',
                    isCompleted: false
                });
            }
        }

        if (validTasks.length === 0) {
            if (skippedCommentedCount > 0) {
                setParseNotice(
                    `All ${skippedCommentedCount} question(s) were commented out and ignored. Uncomment questions to add them.`
                );
            } else {
                setParseNotice('No valid questions found. Try numbering them like: 1. Question Title');
            }
            return;
        }

        if (skippedCommentedCount > 0) {
            setParseNotice(
                `Created ${validTasks.length} task(s). Skipped ${skippedCommentedCount} commented question(s).`
            );
        } else {
            setParseNotice(null);
        }

        onUpdateTasks(validTasks);
        setIsEditingPaste(false);
    };

    const handleToggleComplete = (taskId: string | number, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = tasks.map((t) =>
            t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
        );
        onUpdateTasks(updated);
    };

    const handleClearTasks = () => {
        if (window.confirm('Clear all parsed questions?')) {
            onUpdateTasks([]);
            setIsEditingPaste(true);
            setParseNotice(null);
            try {
                localStorage.removeItem('zerog_compiler_tasks');
                localStorage.removeItem('zerog_active_task_id');
            } catch (e) {
                console.error(e);
            }
        }
    };

    return (
        <aside className="panel-sidebar w-full md:w-80 lg:w-96 h-64 md:h-full flex flex-col flex-shrink-0 z-10 overflow-hidden">
            {/* Header */}
            <div className="panel-header h-12 flex items-center px-4 justify-between flex-shrink-0">
                <div className="flex items-center gap-1 h-full">
                    <div
                        className="text-xs font-semibold px-2 h-full flex items-center gap-1.5"
                        style={{ color: 'var(--text-primary)', borderBottom: '2px solid var(--accent-purple)' }}
                    >
                        <FileText className="w-3.5 h-3.5" style={{ color: 'var(--accent-purple)' }} />
                        <span>Tasks ({tasks.length})</span>
                    </div>
                </div>

                {tasks.length > 0 && !isEditingPaste && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsEditingPaste(true)}
                            className="text-[11px] flex items-center gap-1 transition-colors"
                            style={{ color: 'var(--accent-blue)', fontWeight: 500 }}
                            title="Edit raw text"
                        >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                        </button>
                        <button
                            onClick={handleClearTasks}
                            className="text-[11px] flex items-center gap-1 transition-colors"
                            style={{ color: 'var(--accent-red)', fontWeight: 500 }}
                            title="Clear all saved questions"
                        >
                            <Trash2 className="w-3 h-3" />
                            <span>Clear</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col" style={{ backgroundColor: 'var(--bg-sidebar)' }}>
                {isEditingPaste || tasks.length === 0 ? (
                    <div className="flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-2 px-1">
                            <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                                Paste Questions
                            </span>
                            <span className="text-[10px] font-mono" style={{ color: 'var(--text-faint)' }}>
                                Commented lines (//, #) are ignored
                            </span>
                        </div>

                        {parseNotice && (
                            <div
                                className="mb-2 p-2 rounded text-xs flex items-start gap-1.5"
                                style={{
                                    backgroundColor: 'var(--accent-amber)',
                                    opacity: 0.9,
                                    color: '#ffffff',
                                    borderRadius: '0.375rem'
                                }}
                            >
                                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                <span>{parseNotice}</span>
                            </div>
                        )}

                        <textarea
                            value={pasteText}
                            onChange={(e) => setPasteText(e.target.value)}
                            placeholder="// Paste your list of questions here...&#10;&#10;// Example:&#10;1. Two Sum&#10;Given an array of integers nums and an integer target...&#10;Input: nums = [2,7,11,15], target = 9 => Output: [0,1]&#10;&#10;2. Reverse a String&#10;Reverse the characters of a string in-place."
                            className="textarea-input flex-1 min-h-[160px]"
                        />

                        <div className="pt-3 flex items-center justify-between">
                            {tasks.length > 0 && (
                                <button
                                    onClick={() => {
                                        setParseNotice(null);
                                        setIsEditingPaste(false);
                                    }}
                                    className="text-xs px-2 py-1"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                onClick={handleParse}
                                className="btn-run ml-auto"
                                style={{ backgroundColor: 'var(--accent-blue)' }}
                            >
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>Generate Tasks</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        {parseNotice && (
                            <div
                                className="mb-2 p-2 rounded text-xs flex items-center justify-between"
                                style={{
                                    backgroundColor: 'var(--bg-card-active)',
                                    border: '1px solid var(--accent-purple)',
                                    color: 'var(--text-primary)'
                                }}
                            >
                                <span>{parseNotice}</span>
                                <button
                                    onClick={() => setParseNotice(null)}
                                    className="text-xs px-1"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {tasks.map((task) => {
                            const isActive = activeTaskId === task.id;
                            return (
                                <div
                                    key={task.id}
                                    onClick={() => onSelectTask(task)}
                                    className={`task-card ${isActive ? 'active' : ''}`}
                                >
                                    <button
                                        onClick={(e) => handleToggleComplete(task.id, e)}
                                        className="mt-0.5 transition-colors"
                                        style={{ color: task.isCompleted ? 'var(--accent-green)' : 'var(--text-muted)' }}
                                        title={task.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                                    >
                                        {task.isCompleted ? (
                                            <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                                        ) : (
                                            <Circle className="w-4 h-4" />
                                        )}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span
                                                className="text-[11px] font-mono font-bold"
                                                style={{ color: 'var(--accent-purple)' }}
                                            >
                                                #{task.id}
                                            </span>
                                            <span
                                                className={`text-xs font-medium truncate ${
                                                    task.isCompleted ? 'line-through' : ''
                                                }`}
                                                style={{
                                                    color: task.isCompleted
                                                        ? 'var(--text-faint)'
                                                        : isActive
                                                        ? 'var(--text-primary)'
                                                        : 'var(--text-secondary)'
                                                }}
                                            >
                                                {task.title}
                                            </span>
                                        </div>
                                    </div>

                                    <ArrowRight
                                        className="w-3.5 h-3.5 mt-0.5 transition-all"
                                        style={{ color: isActive ? 'var(--accent-purple)' : 'var(--text-faint)' }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Sidebar Footer */}
            <div className="panel-footer h-10 px-4 flex items-center justify-between text-[11px] font-mono flex-shrink-0">
                <span>Completed: {tasks.filter((t) => t.isCompleted).length}/{tasks.length}</span>
                <span style={{ color: 'var(--text-faint)' }}>Zero-G Core</span>
            </div>
        </aside>
    );
};
