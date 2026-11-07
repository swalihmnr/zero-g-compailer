import { LanguageInfo, SupportedLanguage, TaskItem } from './types';

export const LANGUAGES: Record<SupportedLanguage, LanguageInfo> = {
    javascript: {
        id: 'javascript',
        name: 'JavaScript',
        extension: 'js',
        fileName: 'main.js',
        command: 'node main.js',
        monacoLang: 'javascript',
        color: '#f7df1e'   // JS yellow
    },
    typescript: {
        id: 'typescript',
        name: 'TypeScript',
        extension: 'ts',
        fileName: 'main.ts',
        command: 'tsx main.ts',
        monacoLang: 'typescript',
        color: '#3178c6'   // TS blue
    },
    python: {
        id: 'python',
        name: 'Python',
        extension: 'py',
        fileName: 'main.py',
        command: 'python3 main.py',
        monacoLang: 'python',
        color: '#3b81d6'   // Python blue
    },
    java: {
        id: 'java',
        name: 'Java',
        extension: 'java',
        fileName: 'Main.java',
        command: 'javac Main.java && java Main',
        monacoLang: 'java',
        color: '#ed8b00'   // Java orange
    },
    cpp: {
        id: 'cpp',
        name: 'C++',
        extension: 'cpp',
        fileName: 'main.cpp',
        command: 'g++ main.cpp -o main && ./main',
        monacoLang: 'cpp',
        color: '#00599c'   // C++ dark blue
    },
    c: {
        id: 'c',
        name: 'C',
        extension: 'c',
        fileName: 'main.c',
        command: 'gcc main.c -o main && ./main',
        monacoLang: 'c',
        color: '#5c6bc0'   // C indigo
    },
    go: {
        id: 'go',
        name: 'Go',
        extension: 'go',
        fileName: 'main.go',
        command: 'go run main.go',
        monacoLang: 'go',
        color: '#00acd7'   // Go cyan
    },
    rust: {
        id: 'rust',
        name: 'Rust',
        extension: 'rs',
        fileName: 'main.rs',
        command: 'rustc main.rs && ./main',
        monacoLang: 'rust',
        color: '#ce4a0e'
    },
    ruby: {
        id: 'ruby',
        name: 'Ruby',
        extension: 'rb',
        fileName: 'main.rb',
        command: 'ruby main.rb',
        monacoLang: 'ruby',
        color: '#cc342d'
    },
    perl: {
        id: 'perl',
        name: 'Perl',
        extension: 'pl',
        fileName: 'main.pl',
        command: 'perl main.pl',
        monacoLang: 'perl',
        color: '#39457e'
    },
    bash: {
        id: 'bash',
        name: 'Bash',
        extension: 'sh',
        fileName: 'main.sh',
        command: 'bash main.sh',
        monacoLang: 'shell',
        color: '#4eaa25'
    },
    php: {
        id: 'php',
        name: 'PHP',
        extension: 'php',
        fileName: 'main.php',
        command: 'php main.php',
        monacoLang: 'php',
        color: '#777bb4'
    },
    kotlin: {
        id: 'kotlin',
        name: 'Kotlin',
        extension: 'kt',
        fileName: 'main.kt',
        command: 'kotlinc main.kt && java -jar main.jar',
        monacoLang: 'kotlin',
        color: '#7f52ff'
    },
    swift: {
        id: 'swift',
        name: 'Swift',
        extension: 'swift',
        fileName: 'main.swift',
        command: 'swift main.swift',
        monacoLang: 'swift',
        color: '#f05138'
    },
    csharp: {
        id: 'csharp',
        name: 'C#',
        extension: 'cs',
        fileName: 'Program.cs',
        command: 'dotnet run',
        monacoLang: 'csharp',
        color: '#239120'
    },
    r: {
        id: 'r',
        name: 'R',
        extension: 'r',
        fileName: 'main.R',
        command: 'Rscript main.R',
        monacoLang: 'r',
        color: '#276dc3'
    },
    scala: {
        id: 'scala',
        name: 'Scala',
        extension: 'scala',
        fileName: 'Main.scala',
        command: 'scala Main.scala',
        monacoLang: 'scala',
        color: '#dc322f'
    },
    lua: {
        id: 'lua',
        name: 'Lua',
        extension: 'lua',
        fileName: 'main.lua',
        command: 'lua main.lua',
        monacoLang: 'lua',
        color: '#000080'
    },
    dart: {
        id: 'dart',
        name: 'Dart',
        extension: 'dart',
        fileName: 'main.dart',
        command: 'dart main.dart',
        monacoLang: 'dart',
        color: '#0175c2'
    },
    haskell: {
        id: 'haskell',
        name: 'Haskell',
        extension: 'hs',
        fileName: 'main.hs',
        command: 'runghc main.hs',
        monacoLang: 'haskell',
        color: '#5e5086'
    },
    elixir: {
        id: 'elixir',
        name: 'Elixir',
        extension: 'exs',
        fileName: 'main.exs',
        command: 'elixir main.exs',
        monacoLang: 'elixir',
        color: '#4e2a8e'
    },
    sql: {
        id: 'sql',
        name: 'SQL',
        extension: 'sql',
        fileName: 'main.sql',
        command: 'sqlite3 :memory: < main.sql',
        monacoLang: 'sql',
        color: '#e38c00'
    }
};

export const DEFAULT_TEMPLATES: Record<SupportedLanguage, string> = {
    javascript: '',
    typescript: '',
    python: '',
    java: '',
    cpp: '',
    c: '',
    go: '',
    rust: '',
    ruby: '',
    perl: '',
    bash: '',
    php: '',
    kotlin: '',
    swift: '',
    csharp: '',
    r: '',
    scala: '',
    lua: '',
    dart: '',
    haskell: '',
    elixir: '',
    sql: ''
};

export const PRESET_TASKS: TaskItem[] = [
    {
        id: 1,
        title: 'Two Sum Problem',
        difficulty: 'Easy',
        content: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
Assume each input has exactly one solution, and you may not use the same element twice.

Input: nums = [2,7,11,15], target = 9
Output: [0,1] (because nums[0] + nums[1] == 9)

Input: nums = [3,2,4], target = 6
Output: [1,2]`,
        examples: [
            { input: 'nums = [2,7,11,15], target = 9', output: '[0, 1]' },
            { input: 'nums = [3,2,4], target = 6', output: '[1, 2]' }
        ]
    },
    {
        id: 2,
        title: 'Palindrome Number Check',
        difficulty: 'Easy',
        content: `Given an integer x, return true if x is a palindrome, and false otherwise.
An integer is a palindrome when it reads the same forward and backward.

Input: x = 121
Output: true

Input: x = -121
Output: false (From left to right: -121. From right to left: 121-. Not a palindrome)`,
        examples: [
            { input: 'x = 121', output: 'true' },
            { input: 'x = -121', output: 'false' }
        ]
    },
    {
        id: 3,
        title: 'Reverse String In-Place',
        difficulty: 'Easy',
        content: `Write a function that reverses an array of characters in-place with O(1) extra memory.

Input: s = ["h","e","l","l","o"]
Output: ["o","l","l","e","h"]

Input: s = ["H","a","n","n","a","h"]
Output: ["h","a","n","n","a","H"]`,
        examples: [
            { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' }
        ]
    },
    {
        id: 4,
        title: 'Valid Parentheses',
        difficulty: 'Easy',
        content: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.
Open brackets must be closed by the same type of brackets in the correct order.

Input: s = "()[]{}"
Output: true

Input: s = "(]"
Output: false`,
        examples: [
            { input: 's = "()[]{}"', output: 'true' },
            { input: 's = "(]"', output: 'false' }
        ]
    }
];

