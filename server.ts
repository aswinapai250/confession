import express from "express";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // WebSocket Server
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  const wss = new WebSocketServer({ server });

  const broadcast = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  // API Routes (Empty/Mocked for stabilization)
  app.get("/api/confessions", (req, res) => {
    res.json([]);
  });

  app.post("/api/confessions", (req, res) => {
    res.json({ error: "Database not available" });
  });

  app.get("/api/confessions/:id", (req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  app.post("/api/confessions/:id/reactions", (req, res) => {
    res.json({ success: true, reactions: [] });
  });

  app.post("/api/confessions/:id/reactions/undo", (req, res) => {
    res.json({ success: true, reactions: [] });
  });

  app.delete("/api/confessions/:id", (req, res) => {
    res.json({ success: true });
  });

  app.post("/api/confessions/:id/replies", (req, res) => {
    res.json({ error: "Database not available" });
  });

  app.delete("/api/replies/:id", (req, res) => {
    res.json({ success: true });
  });

  app.get("/api/users/:userId/confessions", (req, res) => {
    res.json([]);
  });

  app.get("/api/notifications", (req, res) => {
    res.json([]);
  });

  app.get("/api/active-confessions", (req, res) => {
    res.json([]);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }
}

startServer();
