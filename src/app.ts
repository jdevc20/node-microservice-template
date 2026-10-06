import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { env, corsOrigins } from "./configurations/env.js";
import { requestId } from "./middlewares/request-id.js";
import { notFoundHandler } from "./middlewares/not-found.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { getHealth } from "./services/health.service.js";
import { exampleRouter } from "./modules/example/example.routes.js";

export const app = express();

app.disable("x-powered-by");

app.use(helmet());
app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(requestId);
app.use(
  pinoHttp({
    level: env.LOG_LEVEL,
    customProps: (req) => ({
      requestId: req.requestId,
      service: env.SERVICE_NAME,
    }),
  }),
);

app.get("/health", async (_req, res, next) => {
  try {
    const health = await getHealth();
    const healthy = health.database === "up";

    res.status(healthy ? 200 : 503).json({
      success: healthy,
      message: healthy ? "Node Microservice is running." : "Node Microservice is unhealthy.",
      service: env.SERVICE_NAME,
      environment: env.NODE_ENV,
      ...health,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api", (_req, res) => {
  res.json({
    success: true,
    message: "API is running.",
    service: env.SERVICE_NAME,
  });
});

app.use("/api/example", exampleRouter);

app.use(notFoundHandler);
app.use(errorHandler);
