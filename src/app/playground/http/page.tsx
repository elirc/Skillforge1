import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { HttpPlayground } from "@/features/projects/http-playground";
export const dynamic = "force-dynamic";
export default function HttpPlaygroundPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold">HTTP request playground</h1>
        <p>
          Send real requests to local teaching endpoints and inspect status
          codes, headers, and JSON. Fixtures reset on every request. They do not
          update your learner progress or the Inventory Desk database.
        </p>
        <HttpPlayground />
        <p className="text-sm">
          Continue with{" "}
          <Link className="underline" href="/courses/web-http-fundamentals">
            Web and HTTP Fundamentals
          </Link>{" "}
          or build persistent endpoints in the{" "}
          <Link className="underline" href="/projects">
            companion project
          </Link>
          .
        </p>
      </div>
    </SiteShell>
  );
}
