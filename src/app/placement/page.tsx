import { SiteShell } from "@/components/site-shell";
import { Placement } from "@/features/onboarding/placement";
export const dynamic = "force-dynamic";
export default function PlacementPage() { return <SiteShell><div className="mx-auto max-w-3xl"><h1 className="mb-4 text-3xl font-semibold">Find your starting point</h1><Placement /></div></SiteShell>; }
