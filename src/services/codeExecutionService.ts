import { VM } from 'vm2';
import { exec } from 'child_process';
import { writeFileSync, mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { transformSync } from 'esbuild';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ExecutionResult {
    output: string;
    error?: string;
}

interface LanguageConfig {
    extension: string;
    fileName: string;
    getCommand: (filePath: string, tempDir: string) => string;
}

// ============================================================================
// MAIN SERVICE
// ============================================================================

export class CodeExecutionService {
    private languageConfigs: Map<string, LanguageConfig>;

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
                    const outPath = join(tempDir, isWin ? 'main.exe' : 'main');
                    return `g++ "${filePath}" -o "${outPath}" && "${outPath}"`;
                }
            }],
            ['c', {
                extension: 'c',
                fileName: 'main.c',
                getCommand: (filePath, tempDir) => {
                    const outPath = join(tempDir, isWin ? 'main.exe' : 'main');
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
                    const outPath = join(tempDir, isWin ? 'main.exe' : 'main');
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
                    const jarPath = join(tempDir, 'main.jar');
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
                    const outPath = join(tempDir, isWin ? 'main.exe' : 'main');
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
                    const outPath = join(tempDir, isWin ? 'main.exe' : 'main');
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
    async runCode(code: string, language: string = 'javascript'): Promise<ExecutionResult> {
        if (language === 'javascript') {
            return await this.executeJavaScript(code);
        } else if (language === 'typescript') {
            return await this.executeTypeScript(code);
        } else {
            return await this.executeCompiledLanguage(code, language);
        }
    }

    // ========================================================================
    // TYPESCRIPT EXECUTION (esbuild + VM2)
    // ========================================================================

    private async executeTypeScript(code: string): Promise<ExecutionResult> {
        try {
            const transpiled = transformSync(code, {
                loader: 'ts',
                target: 'es2022'
            });

            return await this.executeJavaScript(transpiled.code);
        } catch (err: any) {
            return {
                output: '',
                error: `TypeScript Compilation Error:\n${err.message}`
            };
        }
    }

    // ========================================================================
    // JAVASCRIPT EXECUTION (VM2 Sandbox)
    // ========================================================================

    private async executeJavaScript(code: string): Promise<ExecutionResult> {
        return new Promise((resolve) => {
            let output = '';
            let errorOutput = '';

            try {
                const vm = new VM({
                    timeout: 5000,
                    sandbox: {
                        console: {
                            log: (...args: any[]) => {
                                output += args.map(arg =>
                                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                                ).join(' ') + '\n';
                            },
                            error: (...args: any[]) => {
                                errorOutput += args.map(arg =>
                                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                                ).join(' ') + '\n';
                            },
                            warn: (...args: any[]) => {
                                output += '[WARN] ' + args.map(arg =>
                                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                                ).join(' ') + '\n';
                            }
                        }
                    }
                });

                vm.run(code);

                resolve({
                    output: output || '',
                    error: errorOutput || undefined
                });

            } catch (err: any) {
                resolve({
                    output: output,
                    error: errorOutput || err.message || 'Runtime Error'
                });
            }
        });
    }

    // ========================================================================
    // COMPILED LANGUAGE EXECUTION (System Compilers)
    // ========================================================================

    private async executeCompiledLanguage(code: string, language: string): Promise<ExecutionResult> {
        const config = this.languageConfigs.get(language);

        if (!config) {
            return {
                output: '',
                error: `Language '${language}' is not supported.`
            };
        }

        return new Promise((resolve) => {
            try {
                const tempDir = mkdtempSync(join(tmpdir(), 'zerog-'));
                const filePath = join(tempDir, config.fileName);

                writeFileSync(filePath, code);
                const command = config.getCommand(filePath, tempDir);

                exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
                    // Cleanup temporary directory
                    this.cleanup(tempDir);

                    if (error) {
                        resolve({
                            output: stdout || '',
                            error: stderr || error.message
                        });
                    } else {
                        resolve({
                            output: stdout || '',
                            error: stderr || undefined
                        });
                    }
                });

            } catch (err: any) {
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

    private cleanup(tempDir: string): void {
        try {
            rmSync(tempDir, { recursive: true, force: true });
        } catch (e) {
            // Ignore cleanup errors
        }
    }
}
