import React, { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { SupportedLanguage } from '../types';
import { LANGUAGES } from '../constants';

interface EditorPanelProps {
    code: string;
    language: SupportedLanguage;
    autoSuggest: boolean;
    isDark: boolean;
    onChange: (value: string) => void;
    onRun: () => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
    code,
    language,
    autoSuggest,
    isDark,
    onChange,
    onRun
}) => {
    const editorRef = useRef<any>(null);
    const langInfo = LANGUAGES[language];
    const monacoTheme = isDark ? 'vs-dark' : 'vs';

    const getSuggestionOptions = (enabled: boolean) => ({
        quickSuggestions: enabled ? { other: true, comments: false, strings: false } : false,
        suggestOnTriggerCharacters: enabled,
        wordBasedSuggestions: enabled ? ('allDocuments' as const) : ('off' as const),
        parameterHints: { enabled },
        snippetSuggestions: enabled ? ('inline' as const) : ('none' as const),
        tabCompletion: enabled ? ('on' as const) : ('off' as const),
        suggest: {
            showWords: enabled,
            showSnippets: enabled,
            showClasses: enabled,
            showFunctions: enabled,
            showVariables: enabled,
            showKeywords: enabled,
            showModules: enabled,
            showProperties: enabled,
            showFields: enabled
        }
    });

    // Update suggestions dynamically
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.updateOptions(getSuggestionOptions(autoSuggest));
        }
    }, [autoSuggest]);

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
        editor.updateOptions(getSuggestionOptions(autoSuggest));
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            onRun();
        });
    };

    return (
        <div className="flex-1 min-h-0 relative flex flex-col bg-[#0a0a0c]">
            <Editor
                height="100%"
                language={langInfo.monacoLang}
                theme={monacoTheme}
                value={code}
                onChange={(value) => onChange(value || '')}
                onMount={handleEditorDidMount}
                loading={
                    <div className="flex items-center justify-center h-full bg-[#0a0a0c] text-gray-500 font-mono text-xs gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                        Loading Editor...
                    </div>
                }
                options={{
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 4,
                    padding: { top: 12 },
                    lineNumbers: 'on',
                    renderWhitespace: 'selection',
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    ...getSuggestionOptions(autoSuggest)
                }}
            />
        </div>
    );
};
