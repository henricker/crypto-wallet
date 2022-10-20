import 'dotenv/config';
import net from 'net'
import { onConsumerConnected } from './producer-cli.js';

const server = net.createServer(onConsumerConnected)

export { server };