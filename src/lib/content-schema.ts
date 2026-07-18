import { z } from "zod";

export const contentBlockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("prose"),
    body: z.string(),
  }),
  z.object({
    type: z.literal("code-example"),
    language: z.string(),
    code: z.string(),
  }),
  z.object({
    type: z.literal("callout"),
    tone: z.enum(["info", "warning", "success"]),
    body: z.string(),
  }),
]);

const mcqPayloadSchema = z.object({
  choices: z.array(z.string()).min(2),
  answer: z.string(),
  explanation: z.string(),
});

const clozePayloadSchema = z.object({
  text: z.string(),
  blanks: z.array(z.string()).min(1),
});

export const codeTestSchema = z.object({
  name: z.string(),
  args: z.array(z.unknown()),
  expected: z.unknown(),
  hidden: z.boolean().default(false),
});

const problemExplanationSchema = z.object({
  beginner: z.string(),
  junior: z.string(),
});

const codePayloadSchema = z.object({
  starterCode: z.string(),
  functionName: z.string(),
  tests: z.array(codeTestSchema).min(1),
  referenceSolution: z.string(),
});

export const knowledgeItemSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("MCQ"),
    prompt: z.string(),
    payload: mcqPayloadSchema,
    conceptTags: z.array(z.string()),
  }),
  z.object({
    type: z.literal("CLOZE"),
    prompt: z.string(),
    payload: clozePayloadSchema,
    conceptTags: z.array(z.string()),
  }),
  z.object({
    type: z.literal("CODE"),
    prompt: z.string(),
    payload: codePayloadSchema,
    conceptTags: z.array(z.string()),
  }),
]);

export const courseSeedSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  language: z.string(),
  topicTags: z.array(z.string()),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  isPro: z.boolean(),
  order: z.number().int(),
  outcomes: z.array(z.string()),
  modules: z.array(
    z.object({
      title: z.string(),
      order: z.number().int(),
      lessons: z.array(
        z.object({
          title: z.string(),
          order: z.number().int(),
          contentBlocks: z.array(contentBlockSchema),
          knowledgeItems: z.array(knowledgeItemSchema),
        }),
      ),
    }),
  ),
});

export const problemSeedSchema = z.object({
  slug: z.string(),
  title: z.string(),
  prompt: z.string(),
  explanation: problemExplanationSchema,
  language: z.string().default("javascript"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  conceptTags: z.array(z.string()),
  order: z.number().int().default(0),
  starterCode: z.string(),
  functionName: z.string(),
  tests: z.array(codeTestSchema).min(1),
  referenceSolution: z.string(),
});

export type CourseSeed = z.infer<typeof courseSeedSchema>;
export type ContentBlock = z.infer<typeof contentBlockSchema>;
export type KnowledgeSeed = z.infer<typeof knowledgeItemSchema>;
export type CodePayload = z.infer<typeof codePayloadSchema>;
export type ProblemSeed = z.infer<typeof problemSeedSchema>;
