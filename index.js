// /frontend/index.js

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mainRoutes from './routes/mainRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
    '/public',
    express.static(path.resolve(__dirname, 'public')),
); // css & images
app.use(
    '/src',
    express.static(path.resolve(__dirname, 'src')),
); // js & views
app.use(
    '/utils',
    express.static(path.resolve(__dirname, 'utils')),
); // utils

app.use(
    '/config.js', 
    express.static(path.resolve(__dirname, 'config.js')));

app.use('/', mainRoutes);

// Frontend server init
const port = 3000; // frontend server address
app.listen(port, () => {
    console.log(`[💥 Frontend server start]: http://localhost:${port}`);
  });
