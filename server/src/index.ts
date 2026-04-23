import cors from "cors";
import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cloudinary from "./config/cloudinary.config";
import adoptionRoutes from "./routes/adoption.routes";
import authRoutes from "./routes/auth.routes";
import petRoutes from "./routes/pet.routes";
import uploadRoutes from "./routes/upload.route";

const app = express();
const PORT = Number(process.env.PORT ?? 5000);

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (curl, Postman, mobile apps in dev)
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/test-cloudinary", async (req, res) => {
  try {
    const result = await cloudinary.api.ping();
    res.json({ success: true, result });
  } catch (error) {
    console.error("Cloudinary error:", error);
    res.status(500).json({ success: false, error });
  }
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth",      authRoutes);
app.use("/api/pets",      petRoutes);
app.use("/api/adoptions", adoptionRoutes);
app.use("/api/media", uploadRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(
  (err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error:", err);

    if (err.message?.startsWith("CORS:")) {
      res.status(403).json({ success: false, message: err.message });
      return;
    }

    res.status(err.status ?? 500).json({
      success: false,
      message:
        process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
    });
  }
);

// ── Start — with graceful EADDRINUSE handling ─────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Environment : ${process.env.NODE_ENV ?? "development"}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health\n`);
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.error(`   Run this to free it (Windows):`);
    console.error(`   netstat -ano | findstr :${PORT}`);
    console.error(`   taskkill /PID <PID from above> /F\n`);
    process.exit(1);
  }
  throw err;
});

export default app;