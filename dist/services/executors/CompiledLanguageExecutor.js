"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompiledLanguageExecutor = void 0;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const os_1 = require("os");
const path_1 = require("path");
class CompiledLanguageExecutor {
    languageConfigs = new Map([
        ['python', {
                extension: 'py',
                fileName: 'main.py',
                getCommand: (filePath) => `python3 "${filePath}"`
            }],
        ['java', {
                extension: 'java',
                fileName: 'Main.java',
                getCommand: (filePath, tempDir) => `cd "${tempDir}" && javac Main.java && java Main`
            }],
        ['cpp', {
                extension: 'cpp',
                fileName: 'main.cpp',
                getCommand: (filePath, tempDir) => `g++ "${filePath}" -o "${(0, path_1.join)(tempDir, 'main')}" && "${(0, path_1.join)(tempDir, 'main')}"`
            }],
        ['c', {
                extension: 'c',
                fileName: 'main.c',
                getCommand: (filePath, tempDir) => `gcc "${filePath}" -o "${(0, path_1.join)(tempDir, 'main')}" && "${(0, path_1.join)(tempDir, 'main')}"`
            }],
        ['go', {
                extension: 'go',
                fileName: 'main.go',
                getCommand: (filePath) => `go run "${filePath}"`
            }],
        ['rust', {
                extension: 'rs',
                fileName: 'main.rs',
                getCommand: (filePath, tempDir) => `rustc "${filePath}" -o "${(0, path_1.join)(tempDir, 'main')}" && "${(0, path_1.join)(tempDir, 'main')}"`
            }]
    ]);
    async execute(code, language) {
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
                    // Cleanup
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
    cleanup(tempDir) {
        try {
            (0, child_process_1.exec)(`rm -rf "${tempDir}"`);
        }
        catch (e) {
            // Ignore cleanup errors
        }
    }
}
exports.CompiledLanguageExecutor = CompiledLanguageExecutor;
