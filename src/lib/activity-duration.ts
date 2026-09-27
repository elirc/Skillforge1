import { z } from "zod";

// Idle tabs must never make an otherwise valid answer impossible to save.
// Cap recorded time at one day, well inside SQLite's signed integer range.
export const durationMsSchema = z.number().finite().min(0).transform((value) => Math.min(86_400_000, Math.round(value)));
