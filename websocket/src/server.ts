import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

const app = express();

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

app.get('/home', function(req, res){
    console.log('GET /home');
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('I am healthy\n');
});

wss.on('connection', (ws: WebSocket) => {

    //connection is up, let's add a simple simple event
    ws.on('message', (message: string) => {

        //log the received message and send it back to the client
        console.log((new Date()) + ' - received: %s', message);

        const broadcastRegex = /^broadcast\:/;

        if (broadcastRegex.test(message)) {
            message = message.replace(broadcastRegex, '');

            //send back the message to the other clients
            wss.clients.forEach(client => {
                    client.send((new Date()) + ` - Broadcast message -> ${message}`);
                });

        } else {
            ws.send((new Date()) + ` - You sent -> ${message}`);
        }
    });

    //send immediatly a feedback to the incoming connection
    ws.send('Hi there, I am a WebSocket server');
});

//start our server
server.listen(process.env.PORT || 8080, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});