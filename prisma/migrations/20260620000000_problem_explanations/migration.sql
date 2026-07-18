-- Add explanation copy for standalone problems.
ALTER TABLE "Problem"
ADD COLUMN "explanation" JSONB NOT NULL DEFAULT '{"beginner":"","junior":""}';
