"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="mx-auto max-w-xl space-y-4 p-8"><h1 className="text-2xl font-semibold">This page could not load</h1><p>Your saved learning progress and browser drafts are still available. Check that the local database is accessible, then try again.</p><Button onClick={reset}>Try again</Button><Link className="ml-4 underline" href="/">Back to Today</Link></main>;
}
