import express from 'express';
import * as http from "http";

import appPackage from '../package.json';
import expressConfig from './config/expressConfig'; 
import 'dotenv/config';
import { SocketServer } from './socket';
import { io} from 'socket.io-client';
import { attempt } from 'lodash';

// import './config/db_connection'; // uncomment for database connection


const port = process.env.PORT || 2000;
const app = express();

app.set('APP_PACKAGE', {
  name: appPackage.name,
  version: appPackage.version,
});

expressConfig(app);

const server = http.createServer(app);
// new SocketServer(server);
const socket = io('ws://localhost:3000');

const startListening = () => {
  // Reconnect event
  socket.on('reconnect', (attempt) => {
    logger.info(`Attempting to reconnect: ${attempt}`);
  });


  // Reconnection attempt event
  socket.on('reconnect_attempt', (attempt) => {
    logger.error(`Reconnection attempt: ${attempt}`);
  });

  // Reconnection error
  socket.on('reconnect_error', (error) => {
    logger.error(`Reconnection error: ${error}`);
  });

  // Reconnect failed
  socket.on('reconnect_failed', () => {
    logger.error(`Reconnection failure`);
  });
}

const sendHandshake = () => {
  logger.info('Sending handshake to server ...');

  socket.emit('handshake', (uid: string, borads: string[]) => {
    logger.info("Board handsake callback message revceived.");
    logger.info(`board_uid: ${uid}`);
    logger.info(`boards: ${borads}`);
  });

  socket.emit("draw", JSON.parse(`{"points": [{"dx": 575.6796875, "dy": 515.73046875}], "color": "#000000", "size": 10, "filled": false, "type": "scribble", "sides": 3}`))
}

socket.connect();

startListening();

sendHandshake();

server.listen(port, () => logger.info(`App listening on port ${port}...`));

export default app;
