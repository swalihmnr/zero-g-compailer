import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { EditorPanel } from './components/EditorPanel';
import { TerminalPanel, OutputContent } from './components/TerminalPanel';
import { Trash2 } from 'lucide-react';
import { SupportedLanguage, TaskItem, TerminalEntry, RunResult } from './types';
import { LANGUAGES, DEFAULT_TEMPLATES } from './constants';

export const App: React.FC = () => {
    const [language, setLanguage] = useState<SupportedLanguage>('javascript');
    const [code, setCode] = useState<string>('');
    const [autoRun, setAutoRun] = useState<boolean>(() => {
        try {
            const saved = localStorage.getItem('zerog_autorun');
            return saved !== null ? JSON.parse(saved) : false;
        } catch { return false; }
    });
    const [autoSuggest, setAutoSuggest] = useState<boolean>(() => {
        try {
            const saved = localStorage.getItem('zerog_autosuggest');
            return saved !== null ? JSON.parse(saved) : true;
        } catch { return true; }
    });
    const [isDark, setIsDark] = useState<boolean>(() => {
        try {
            const saved = localStorage.getItem('zerog_theme');
            return saved !== null ? saved === 'dark' : true;
        } catch { return true; }
    });
    const [tasks, setTasks] = useState<TaskItem[]>(() => {
        try {
            const saved = localStorage.getItem('zerog_compiler_tasks');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Failed to load tasks from localStorage:', e);
            return [];
        }
    });
    const [activeTaskId, setActiveTaskId] = useState<string | number | null>(() => {
        try {
            const saved = localStorage.getItem('zerog_active_task_id');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    });
    const [terminalEntries, setTerminalEntries] = useState<TerminalEntry[]>([]);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
    const [isTerminalCollapsed, setIsTerminalCollapsed] = useState<boolean>(false);
    const [isSplitScreen, setIsSplitScreen] = useState<boolean>(() => {
        try {
            const saved = localStorage.getItem('zerog_splitscreen');
            return saved !== null ? JSON.parse(saved) : false;
        } catch { return false; }
    });

    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const splitOutputRef   = useRef<HTMLDivElement>(null);

    // Keep live refs to avoid stale closure issues in async callbacks & timers
    const codeRef       = useRef<string>(code);
    codeRef.current     = code;
    const languageRef   = useRef<SupportedLanguage>(language);
    languageRef.current = language;
    const isRunningRef  = useRef<boolean>(isRunning);
    isRunningRef.current= isRunning;

    // Sync theme on <html> element + persist to localStorage
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        try { localStorage.setItem('zerog_theme', isDark ? 'dark' : 'light'); } catch {}
    }, [isDark]);

    // Persist settings
    useEffect(() => {
        try { localStorage.setItem('zerog_autorun', JSON.stringify(autoRun)); } catch {}
    }, [autoRun]);

    useEffect(() => {
        try { localStorage.setItem('zerog_autosuggest', JSON.stringify(autoSuggest)); } catch {}
    }, [autoSuggest]);

    useEffect(() => {
        try { localStorage.setItem('zerog_splitscreen', JSON.stringify(isSplitScreen)); } catch {}
    }, [isSplitScreen]);

    // Persist tasks in localStorage
    useEffect(() => {
        try {
            localStorage.setItem('zerog_compiler_tasks', JSON.stringify(tasks));
        } catch (e) {
            console.error('Failed to save tasks to localStorage:', e);
        }
    }, [tasks]);

    // Persist activeTaskId in localStorage
    useEffect(() => {
        try {
            if (activeTaskId !== null) {
                localStorage.setItem('zerog_active_task_id', JSON.stringify(activeTaskId));
            } else {
                localStorage.removeItem('zerog_active_task_id');
            }
        } catch (e) {
            console.error('Failed to save activeTaskId to localStorage:', e);
        }
    }, [activeTaskId]);

    // Run Code Implementation — reads fresh live values and replaces output cleanly
    const executeCode = useCallback(async (codeToRun?: string) => {
        if (isRunningRef.current) return;

        const currentCode = codeToRun !== undefined ? codeToRun : codeRef.current;
        const currentLang = languageRef.current;

        if (!currentCode || currentCode.trim() === '') {
            setTerminalEntries([]);
            return;
        }

        setIsRunning(true);
        isRunningRef.current = true;

        try {
            const res = await fetch('/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: currentCode, language: currentLang })
            });

            const data: RunResult = await res.json();
            const newEntries: TerminalEntry[] = [];

            if (data.output && data.output.trim() !== '') {
                newEntries.push({
                    id: Math.random().toString(36).substring(2, 9),
                    type: 'stdout',
                    content: data.output,
                    timestamp: new Date().toLocaleTimeString()
                });
            }

            if (data.error) {
                newEntries.push({
                    id: Math.random().toString(36).substring(2, 9),
                    type: 'stderr',
                    content: data.error,
                    timestamp: new Date().toLocaleTimeString()
                });
            }

            setTerminalEntries(newEntries);
        } catch (err: any) {
            let errorMsg = err.message || 'Execution failed';
            if (errorMsg === 'Failed to fetch') {
                errorMsg = 'Cannot connect to server at /run. Please verify the backend is active on port 3001.';
            }

            setTerminalEntries([
                {
                    id: Math.random().toString(36).substring(2, 9),
                    type: 'stderr',
                    content: errorMsg,
                    timestamp: new Date().toLocaleTimeString()
                }
            ]);
        } finally {
            setIsRunning(false);
            isRunningRef.current = false;
        }
    }, []);

    // Global keyboard shortcut (Ctrl+Enter / Cmd+Enter)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                executeCode();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [executeCode]);

    // Handle Code Change with robust live debounce
    const handleCodeChange = (newCode: string) => {
        setCode(newCode);
        codeRef.current = newCode;

        if (autoRun) {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = setTimeout(() => {
                executeCode(newCode);
            }, 900);
        }
    };

    // Toggle Auto Run
    const handleToggleAutoRun = (enabled: boolean) => {
        setAutoRun(enabled);
        if (enabled && codeRef.current && codeRef.current.trim() !== '') {
            executeCode(codeRef.current);
        }
    };

    // Language Change
    const handleLanguageChange = (newLang: SupportedLanguage) => {
        setLanguage(newLang);
        languageRef.current = newLang;
        if (autoRun && codeRef.current && codeRef.current.trim() !== '') {
            executeCode(codeRef.current);
        }
    };

    // Reset code
    const handleReset = () => {
        if (window.confirm('Clear code in the editor?')) {
            setCode('');
        }
    };

    // Save File
    const handleSave = async () => {
        const langConfig = LANGUAGES[language];
        try {
            if ('showSaveFilePicker' in window) {
                const handle = await (window as any).showSaveFilePicker({
                    suggestedName: langConfig.fileName
                });
                const writable = await handle.createWritable();
                await writable.write(code);
                await writable.close();
            } else {
                const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = langConfig.fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error('Save failed:', err);
            }
        }
    };

    // Task Selection
    const handleSelectTask = (task: TaskItem) => {
        setActiveTaskId(task.id);

        let commentSymbol = '//';
        if (language === 'python') commentSymbol = '#';

        let header = `${commentSymbol} ========================================================\n`;
        header += `${commentSymbol} TASK #${task.id}: ${task.title}\n`;
        header += `${commentSymbol} ========================================================\n`;
        header += `${commentSymbol} ${task.content.replace(/\n/g, `\n${commentSymbol} `)}\n`;

        if (task.examples && task.examples.length > 0) {
            header += `${commentSymbol}\n${commentSymbol} Examples:\n`;
            task.examples.forEach((ex, idx) => {
                header += `${commentSymbol}  ${idx + 1}. Input: ${ex.input} => Output: ${ex.output}\n`;
            });
        }
        header += `\n`;

        setCode(header);
    };

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden font-sans select-none" style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}>
            {/* Header */}
            <Header
                language={language}
                onLanguageChange={handleLanguageChange}
                autoRun={autoRun}
                onAutoRunToggle={handleToggleAutoRun}
                autoSuggest={autoSuggest}
                onAutoSuggestToggle={setAutoSuggest}
                onSave={handleSave}
                onReset={handleReset}
                onRun={executeCode}
                isRunning={isRunning}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
                isSplitScreen={isSplitScreen}
                onToggleSplitScreen={setIsSplitScreen}
                isDark={isDark}
                onToggleTheme={() => setIsDark((prev) => !prev)}
            />

            {/* Main Workspace Body */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
                {/* Left Tasks Sidebar */}
                <Sidebar
                    isOpen={isSidebarOpen}
                    tasks={tasks}
                    activeTaskId={activeTaskId}
                    onSelectTask={handleSelectTask}
                    onUpdateTasks={setTasks}
                />

                {/* Right Workspace */}
                <main className="flex-1 flex min-h-0 min-w-0" style={{ backgroundColor: 'var(--bg-app)' }}>
                    {isSplitScreen ? (
                        <>
                            {/* Split Left: Editor */}
                            <div className="flex-1 flex flex-col min-h-0 min-w-0 split-divider">
                                <EditorPanel
                                    code={code}
                                    language={language}
                                    autoSuggest={autoSuggest}
                                    onChange={handleCodeChange}
                                    onRun={executeCode}
                                    isDark={isDark}
                                />
                            </div>

                            {/* Split Right: Output Panel */}
                            <div className="flex-1 flex flex-col min-h-0 min-w-0 panel-output">
                                {/* Output Header */}
                                <div className="panel-header h-9 px-3 flex items-center justify-between flex-shrink-0 select-none">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                                            Output
                                        </span>
                                        {isRunning && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-mono animate-pulse" style={{ color: 'var(--accent-amber)' }}>
                                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent-amber)' }}></span>
                                                running
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setTerminalEntries([])}
                                        className="btn-icon"
                                        title="Clear output"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                {/* Output Body — reuses same component as bottom panel */}
                                <OutputContent
                                    entries={terminalEntries}
                                    isRunning={isRunning}
                                    scrollRef={splitOutputRef}
                                />
                            </div>
                        </>
                    ) : (
                        /* Normal layout: Editor stacked above Terminal */
                        <div className="flex-1 flex flex-col min-h-0 min-w-0">
                            <EditorPanel
                                code={code}
                                language={language}
                                autoSuggest={autoSuggest}
                                onChange={handleCodeChange}
                                onRun={executeCode}
                                isDark={isDark}
                            />

                            <TerminalPanel
                                entries={terminalEntries}
                                onClear={() => setTerminalEntries([])}
                                isRunning={isRunning}
                                isCollapsed={isTerminalCollapsed}
                                onToggleCollapse={() => setIsTerminalCollapsed((prev) => !prev)}
                            />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

