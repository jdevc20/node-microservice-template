import type { ErrorRequestHandler } from "express";
import { env } from "../configurations/env.js";

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  req.log?.error?.({ err: error }, "Unhandled request error");

  const message =
    env.NODE_ENV === "production"
      ? "Internal server error."
      : error instanceof Error
        ? error.message
        : "Internal server error.";

  res.status(500).json({
    success: false,
    message,
    code: "INTERNAL_SERVER_ERROR",
  });
};
