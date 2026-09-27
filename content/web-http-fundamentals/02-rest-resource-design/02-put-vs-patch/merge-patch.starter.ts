// Apply a JSON Merge Patch (RFC 7396), the body format of
// PATCH with Content-Type: application/merge-patch+json.
//
// mergePatch(target, patch):
// - If patch is not a plain object (a string, number, boolean, null, or array),
//   the result is the patch itself: it replaces the target wholesale.
// - Otherwise start from a COPY of target (use {} if target is not a plain object).
//   For each key in patch:
//     - value null  -> remove the key
//     - otherwise   -> set the key to mergePatch(existing value, patch value)
// - Arrays are replaced, never merged element by element.
// - Existing keys keep their position; new keys are added at the end.
// - Never mutate the inputs.
export function mergePatch(target: unknown, patch: unknown) {
}
