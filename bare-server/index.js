import express from 'express';
import { createBareServer } from '@tomphttp/bare-server-node';
import { createServer } from 'node:http';

const bareServer = createBareServer('/bare/');
const app = express();

app.get('/', (req, res) => {
    res.send('Bare Server is running. Ready to handle proxy requests.');
});

const server = createServer();

server.on('request', (req, res) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeRequest(req, res);
    } else {
        app(req, res);
    }
});

server.on('upgrade', (req, socket, head) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeUpgrade(req, socket, head);
    } else {
        socket.end();
    }
});

const port = process.env.PORT || 3000;

server.listen({
    port: port,
}, () => {
    console.log(`Bare Server is running on port ${port}`);
});
