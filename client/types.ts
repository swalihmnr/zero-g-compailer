export type SupportedLanguage =
    | 'javascript' | 'typescript'
    | 'python'
    | 'java'
    | 'cpp' | 'c'
    | 'go'
    | 'rust'
    | 'ruby'
    | 'perl'
    | 'bash'
    | 'php'
    | 'kotlin'
    | 'swift'
    | 'csharp'
    | 'r'
    | 'scala'
    | 'lua'
    | 'dart'
    | 'haskell'
    | 'elixir'
    | 'sql';

export interface LanguageInfo {
    id: SupportedLanguage;
    name: string;
    extension: string;
    fileName: string;
    command: string;
    monacoLang: string;
    color: string;   // hex color for the language badge dot
}

export interface TaskItem {
    id: string | number;
    title: string;
    content: string;
    difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Manual';
    examples?: Array<{ input: string; output: string }>;
    isCompleted?: boolean;
}

export interface TerminalEntry {
    id: string;
    type: 'command' | 'stdout' | 'stderr' | 'info';
    content: string;
    timestamp: string;
}

export interface RunResult {
    output?: string;
    error?: string;
}

