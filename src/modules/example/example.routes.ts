import { Router } from "express";
import { getExamples } from "./example.controller.js";

export const exampleRouter = Router();

exampleRouter.get("/", getExamples);
