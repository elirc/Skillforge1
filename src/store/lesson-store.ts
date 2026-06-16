import { create } from "zustand";

interface LessonUiState {
  editorBuffers: Record<string, string>;
  setEditorBuffer: (id: string, value: string) => void;
}

export const useLessonStore = create<LessonUiState>((set) => ({
  editorBuffers: {},
  setEditorBuffer: (id, value) =>
    set((state) => ({
      editorBuffers: { ...state.editorBuffers, [id]: value },
    })),
}));
