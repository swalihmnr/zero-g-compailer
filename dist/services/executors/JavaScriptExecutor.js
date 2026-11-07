"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaScriptExecutor = void 0;
const vm2_1 = require("vm2");
class JavaScriptExecutor {
    async execute(code) {
        return new Promise((resolve) => {
            let output = '';
            let errorOutput = '';
            try {
                const vm = new vm2_1.VM({
                    timeout: 5000,
                    sandbox: {
                        console: {
                            log: (...args) => {
                                output += args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ') + '\n';
                            },
                            error: (...args) => {
                                errorOutput += args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ') + '\n';
                            },
                            warn: (...args) => {
                                output += '[WARN] ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ') + '\n';
                            }
                        }
                    }
                });
                vm.run(code);
                resolve({
                    output: output || '',
                    error: errorOutput || undefined
                });
            }
            catch (err) {
                resolve({
                    output: output,
                    error: errorOutput || err.message || 'Runtime Error'
                });
            }
        });
    }
}
exports.JavaScriptExecutor = JavaScriptExecutor;
