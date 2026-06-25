import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';

import { appNetworkRouter } from './routes/apiRoutes.js';
import chatRouter from "./routes/chat.js";
import { getEmails, getEvents, getScenarioDescriptionDetails } from './data/backendDb.js';
// Make sure your backendDb is imported here if you use Approach 2
// import { backendDb } from './backendDb.js'; 

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startUnifiedServer() {
  const app = express();
  const server = http.createServer(app);

  // 1. Tie Socket.io directly to the shared HTTP pipeline layer
  const io = new Server(server, {
    cors: { origin: "*" }
  });

  // 2. Initialize Vite in Programmatic Middleware Mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom' 
  });

  app.use(express.json());


// 4. Global Interceptor Middleware for automated Socket broadcast flags
  app.use((req, res, next) => {
    const originalJson = res.json;

    res.json = function (body) {
      originalJson.call(this, body);

      console.log(req.url)

      const isMutationRoute = req.url.startsWith('/scenarios/seed') || 
                              req.url.startsWith('/calendar') || 
                              req.url.startsWith('/emails');
                              
      const isWriteMethod = ['POST', 'PUT', 'DELETE'].includes(req.method);

      if (isMutationRoute && isWriteMethod && res.statusCode < 400) {
        // Safe check to verify your io engine is active before broadcasting
        if (io) {
          io.emit('db_sync_update', {
            // If backendDb isn't imported yet, this falls back to payload data safely
            emails:  getEmails(),
            calendarEvents: getEvents(),
            scenarioDescriptionDetails: getScenarioDescriptionDetails()
          });
          console.log('📢 Auto-broadcasted database mutations safely!');
        }
      }
    };

    next();
  });

  // 3. Mount Vite's core compilation/HMR engines into Express
  app.use(vite.middlewares);

  // FIXED: Removed the dots from path prefixes
  app.use('/api', appNetworkRouter);
  app.use('/Chat', chatRouter);

  


  // // 5. Catch-All Interceptor (Fixed to comply with Express 5 / path-to-regexp v8)
  // app.get('/.*', async (req, res, next) => {
  //   const url = req.originalUrl;

  //   try {
  //     let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');

  //     // Apply Vite HTML transformations (injects Vite HMR client scripts)
  //     template = await vite.transformIndexHtml(url, template);

  //     // Send the transformed single-page-app container shell down
  //     res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
  //   } catch (e) {
  //     vite.ssrFixStacktrace(e);
  //     next(e);
  //   }
  // });


  const PORT = 3006;
  server.listen(PORT, () => {
    console.log(`🚀 Programmatic Vite Server active at http://localhost:${PORT}`);
  });
}

startUnifiedServer();
