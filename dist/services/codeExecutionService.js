"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeExecutionService = void 0;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const os_1 = require("os");
const path_1 = require("path");
const esbuild_1 = require("esbuild");
// ============================================================================
// MAIN SERVICE
// ============================================================================
class CodeExecutionService {
    languageConfigs;
    constructor() {
        const isWin = process.platform === 'win32';
        this.languageConfigs = new Map([
            ['python', {
                    extension: 'py',
                    fileName: 'main.py',
                    getCommand: (filePath) => (isWin ? 'python' : 'python3') + ` "${filePath}"`
                }],
            ['java', {
                    extension: 'java',
                    fileName: 'Main.java',
                    getCommand: (filePath, tempDir) => `${isWin ? 'cd /d' : 'cd'} "${tempDir}" && javac Main.java && java Main`
                }],
            ['cpp', {
                    extension: 'cpp',
                    fileName: 'main.cpp',
                    getCommand: (filePath, tempDir) => {
                        const outPath = (0, path_1.join)(tempDir, isWin ? 'main.exe' : 'main');
                        return `g++ "${filePath}" -o "${outPath}" && "${outPath}"`;
                    }
                }],
            ['c', {
                    extension: 'c',
                    fileName: 'main.c',
                    getCommand: (filePath, tempDir) => {
                        const outPath = (0, path_1.join)(tempDir, isWin ? 'main.exe' : 'main');
                        return `gcc "${filePath}" -o "${outPath}" && "${outPath}"`;
                    }
                }],
            ['go', {
                    extension: 'go',
                    fileName: 'main.go',
                    getCommand: (filePath) => `go run "${filePath}"`
                }],
            ['rust', {
                    extension: 'rs',
                    fileName: 'main.rs',
                    getCommand: (filePath, tempDir) => {
                        const outPath = (0, path_1.join)(tempDir, isWin ? 'main.exe' : 'main');
                        return `rustc "${filePath}" -o "${outPath}" && "${outPath}"`;
                    }
                }],
            ['ruby', {
                    extension: 'rb',
                    fileName: 'main.rb',
                    getCommand: (filePath) => `ruby "${filePath}"`
                }],
            ['perl', {
                    extension: 'pl',
                    fileName: 'main.pl',
                    getCommand: (filePath) => `perl "${filePath}"`
                }],
            ['bash', {
                    extension: 'sh',
                    fileName: 'main.sh',
                    getCommand: (filePath) => `bash "${filePath}"`
                }],
            ['php', {
                    extension: 'php',
                    fileName: 'main.php',
                    getCommand: (filePath) => `php "${filePath}"`
                }],
            ['lua', {
                    extension: 'lua',
                    fileName: 'main.lua',
                    getCommand: (filePath) => `lua "${filePath}"`
                }],
            ['r', {
                    extension: 'r',
                    fileName: 'main.R',
                    getCommand: (filePath) => `Rscript "${filePath}"`
                }],
            ['dart', {
                    extension: 'dart',
                    fileName: 'main.dart',
                    getCommand: (filePath) => `dart "${filePath}"`
                }],
            ['kotlin', {
                    extension: 'kt',
                    fileName: 'main.kt',
                    getCommand: (filePath, tempDir) => {
                        const jarPath = (0, path_1.join)(tempDir, 'main.jar');
                        return `kotlinc "${filePath}" -include-runtime -d "${jarPath}" && java -jar "${jarPath}"`;
                    }
                }],
            ['swift', {
                    extension: 'swift',
                    fileName: 'main.swift',
                    getCommand: (filePath) => `swift "${filePath}"`
                }],
            ['csharp', {
                    extension: 'cs',
                    fileName: 'Program.cs',
                    getCommand: (filePath, tempDir) => {
                        const outPath = (0, path_1.join)(tempDir, isWin ? 'main.exe' : 'main');
                        return `csc -out:"${outPath}" "${filePath}" && "${outPath}"`;
                    }
                }],
            ['scala', {
                    extension: 'scala',
                    fileName: 'Main.scala',
                    getCommand: (filePath) => `scala "${filePath}"`
                }],
            ['haskell', {
                    extension: 'hs',
                    fileName: 'main.hs',
                    getCommand: (filePath, tempDir) => {
                        const outPath = (0, path_1.join)(tempDir, isWin ? 'main.exe' : 'main');
                        return `ghc -o "${outPath}" "${filePath}" && "${outPath}"`;
                    }
                }],
            ['elixir', {
                    extension: 'exs',
                    fileName: 'main.exs',
                    getCommand: (filePath) => `elixir "${filePath}"`
                }],
            ['sql', {
                    extension: 'sql',
                    fileName: 'main.sql',
                    getCommand: (filePath) => `sqlite3 :memory: < "${filePath}"`
                }]
        ]);
    }
    // ========================================================================
    // PUBLIC API
    // ========================================================================
    /**
     * Executes code in the specified language.
     * @param code - The source code to execute
     * @param language - The programming language (javascript, typescript, python, java, cpp, c, go, rust)
     * @returns ExecutionResult containing output and optional error
     */
    async runCode(code, language = 'javascript') {
        if (language === 'javascript') {
            return await this.executeJavaScript(code);
        }
        else if (language === 'typescript') {
            return await this.executeTypeScript(code);
        }
        else {
            return await this.executeCompiledLanguage(code, language);
        }
    }
    // ========================================================================
    // TYPESCRIPT EXECUTION (esbuild → Node subprocess)
    // ========================================================================
    async executeTypeScript(code) {
        try {
            const transpiled = (0, esbuild_1.transformSync)(code, {
                loader: 'ts',
                target: 'es2022',
                format: 'esm'
            });
            return new Promise((resolve) => {
                try {
                    const tempDir = (0, fs_1.mkdtempSync)((0, path_1.join)((0, os_1.tmpdir)(), 'zerog-'));
                    const filePath = (0, path_1.join)(tempDir, 'main.mjs');
                    (0, fs_1.writeFileSync)(filePath, transpiled.code);
                    (0, child_process_1.exec)(`node "${filePath}"`, { timeout: 10000 }, (error, stdout, stderr) => {
                        this.cleanup(tempDir);
                        if (error) {
                            resolve({ output: stdout || '', error: stderr || error.message });
                        }
                        else {
                            resolve({ output: stdout || '', error: stderr || undefined });
                        }
                    });
                }
                catch (err) {
                    resolve({ output: '', error: `Execution Error: ${err.message}` });
                }
            });
        }
        catch (err) {
            return {
                output: '',
                error: `TypeScript Compilation Error:\n${err.message}`
            };
        }
    }
    // ========================================================================
    // JAVASCRIPT EXECUTION (Node subprocess — supports async/Promises/timers)
    // ========================================================================
    async executeJavaScript(code) {
        return new Promise((resolve) => {
            try {
                const tempDir = (0, fs_1.mkdtempSync)((0, path_1.join)((0, os_1.tmpdir)(), 'zerog-'));
                const filePath = (0, path_1.join)(tempDir, 'main.js');
                (0, fs_1.writeFileSync)(filePath, code);
                (0, child_process_1.exec)(`node "${filePath}"`, { timeout: 10000 }, (error, stdout, stderr) => {
                    this.cleanup(tempDir);
                    if (error) {
                        resolve({ output: stdout || '', error: stderr || error.message });
                    }
                    else {
                        resolve({ output: stdout || '', error: stderr || undefined });
                    }
                });
            }
            catch (err) {
                resolve({ output: '', error: `Execution Error: ${err.message}` });
            }
        });
    }
    // ========================================================================
    // COMPILED LANGUAGE EXECUTION (System Compilers)
    // ========================================================================
    async executeCompiledLanguage(code, language) {
        const config = this.languageConfigs.get(language);
        if (!config) {
            return {
                output: '',
                error: `Language '${language}' is not supported.`
            };
        }
        return new Promise((resolve) => {
            try {
                const tempDir = (0, fs_1.mkdtempSync)((0, path_1.join)((0, os_1.tmpdir)(), 'zerog-'));
                const filePath = (0, path_1.join)(tempDir, config.fileName);
                (0, fs_1.writeFileSync)(filePath, code);
                const command = config.getCommand(filePath, tempDir);
                (0, child_process_1.exec)(command, { timeout: 10000 }, (error, stdout, stderr) => {
                    // Cleanup temporary directory
                    this.cleanup(tempDir);
                    if (error) {
                        resolve({
                            output: stdout || '',
                            error: stderr || error.message
                        });
                    }
                    else {
                        resolve({
                            output: stdout || '',
                            error: stderr || undefined
                        });
                    }
                });
            }
            catch (err) {
                resolve({
                    output: '',
                    error: `Execution Error: ${err.message}`
                });
            }
        });
    }
    // ========================================================================
    // UTILITY METHODS
    // ========================================================================
    cleanup(tempDir) {
        try {
            (0, fs_1.rmSync)(tempDir, { recursive: true, force: true });
        }
        catch (e) {
            // Ignore cleanup errors
        }
    }
}
exports.CodeExecutionService = CodeExecutionService;
