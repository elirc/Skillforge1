"use server";
import { revalidatePath } from "next/cache";
import { applyContentUpdate, previewContentUpdate } from "./content-update";
export async function previewContentAction() { return previewContentUpdate(); }
export async function applyContentAction(version: string) {
  if (!/^[a-f0-9]{16}$/.test(version)) throw new Error("Preview this update first.");
  const result = await applyContentUpdate(version);
  revalidatePath("/", "layout");
  return result;
}
