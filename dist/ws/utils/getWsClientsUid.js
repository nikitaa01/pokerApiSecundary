"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getWsClientsUids = (wsClients) => wsClients.map(({ uid }) => uid);
exports.default = getWsClientsUids;
