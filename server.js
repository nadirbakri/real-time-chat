const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
    
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    
    switch (extname) {
        case '.css': contentType = 'text/css'; break;
        case '.js': contentType = 'text/javascript'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg': contentType = 'image/jpeg'; break;
    }
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

const wss = new WebSocket.Server({ server });
let clients = new Map();

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        switch (data.type) {
            case 'join':
                clients.set(ws, { 
                    username: data.username,
                    avatar: data.avatar
                });
                broadcast({ type: 'userCount', count: clients.size });
                break;
                
            case 'message':
                const user = clients.get(ws);
                if (user && data.text.trim()) {
                    broadcast({
                        type: 'message',
                        sender: user.username,
                        text: data.text.trim(),
                        timestamp: Date.now(),
                        avatar: user.avatar
                    });
                }
                break;

            case 'getUserList':
                const userList = Array.from(clients.values()).map((client, index) => ({
                    id: index,
                    name: client.username,
                    avatar: client.avatar
                }));
                ws.send(JSON.stringify({
                    type: 'userList',
                    users: userList
                }));
                break;
                
            case 'typing':
                const typingUser = clients.get(ws);
                if (typingUser) {
                    broadcast({
                        type: 'typing',
                        username: typingUser.username
                    }, ws);
                }
                break;
        }
    });
    
    ws.on('close', () => {
        clients.delete(ws);
        broadcast({ type: 'userCount', count: clients.size });
    });
    
    ws.on('error', () => {
        clients.delete(ws);
    });
});

function broadcast(data, exclude = null) {
    const message = JSON.stringify(data);
    clients.forEach((client, ws) => {
        if (ws !== exclude && ws.readyState === WebSocket.OPEN) {
            try {
                ws.send(message);
            } catch (error) {
                clients.delete(ws);
            }
        }
    });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT);