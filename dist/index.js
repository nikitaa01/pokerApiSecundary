"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const ws_1 = __importDefault(require("ws"));
const dotenv_1 = require("dotenv");
const ws_router_1 = __importDefault(require("./ws/router/ws.router"));
if (!Array.prototype.at) {
    Array.prototype.at = function (index) {
        const value = index < 0 ? this.length + index : index;
        return this[value];
    };
}
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(express_1.default);
const wss = new ws_1.default.Server({ server });
(0, dotenv_1.config)();
wss.on('connection', ws_router_1.default);
/* TODO: al cerrarse el servidor, avisar a todas las lobbies */
app.get('/api', (_req, res) => res.send('hola'));
app.listen(process.env.PORT_REST, () => console.log(`api rest running on port ${process.env.PORT_REST}`));
server.listen(process.env.PORT, () => console.log(`api ws running on port ${process.env.PORT}`));
