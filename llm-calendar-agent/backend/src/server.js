import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { appNetworkRouter } from './routes/apiRoutes.js';
import chatRouter from "./routes/chat.js"
import cors from "cors";

async function startServer() {
  const app = express();
  const PORT = 3005;

   app.use(cors());

  // Global parse middleware for JSON body
  app.use(express.json());

  


  // Mount normal network routing endpoints
  app.use('/api', appNetworkRouter);

 
  
  app.use("/chat", chatRouter);


  // Vite development middleware vs. static build assets configuration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Full-stack server loaded and running on http://localhost:${PORT}`);
  });
}

startServer();
