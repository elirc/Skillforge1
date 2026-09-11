import { javascript } from "@codemirror/lang-javascript";
import { StreamLanguage } from "@codemirror/language";
import { csharp } from "@codemirror/legacy-modes/mode/clike";
import type { Extension } from "@codemirror/state";
import { runtimeForLanguage } from "@/lib/sandbox/shared";

/**
 * CodeMirror highlighting for an exercise's language.
 *
 * There is no `@codemirror/lang-csharp`; C# comes from the legacy clike modes,
 * which give highlighting but no parser-backed indentation or folding. That is
 * enough for short exercises.
 */
export function editorLanguage(language: string | null | undefined): Extension {
  return runtimeForLanguage(language) === "csharp"
    ? StreamLanguage.define(csharp)
    : javascript({ typescript: true });
}
