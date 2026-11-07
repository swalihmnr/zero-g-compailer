"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const compilerController_js_1 = require("./controllers/compilerController.js");
const router = (0, express_1.Router)();
const compilerController = new compilerController_js_1.CompilerController();
router.post('/run', (req, res) => compilerController.run(req, res));
exports.default = router;
