"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gidGenerator = (num = 5) => Array.from(Array(num), () => Math.floor(Math.random() * 36).toString(36)).join('').toUpperCase();
exports.default = gidGenerator;
