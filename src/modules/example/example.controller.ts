import type { Request, Response } from "express";
import { listExamples } from "./example.service.js";

export function getExamples(_req: Request, res: Response): void {
  res.json({
    success: true,
    message: "Example records retrieved.",
    data: listExamples(),
  });
}
