import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export const dynamic = "force-dynamic";

export default function ProjectsPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="space-y-3">
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Put the tracks together
          </p>
          <h1 className="text-3xl font-bold">Build Inventory Desk</h1>
          <p className="text-slate-600 dark:text-slate-300">
            A working inventory app with a React interface, ASP.NET Core API,
            and SQLite database. Follow twelve checkpoints to change it, test
            it, and explain your decisions.
          </p>
        </header>
        <Card>
          <CardHeader>
            <CardTitle>Your companion project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Includes source, setup instructions, HTTP integration tests, a
              browser workflow, container configuration, and backup/restore
              commands. Requires .NET 10 and Node.js 22 or later.
            </p>
            <a
              className="inline-block rounded bg-emerald-700 px-4 py-3 font-semibold text-white"
              href="/downloads/inventory-desk.zip"
              download
            >
              Download Inventory Desk source
            </a>
            <p className="text-sm text-slate-500">
              Unzip it and start with README.md and CHECKPOINTS.md. Run the
              project checks on your computer; the lesson quizzes check your
              understanding and do not certify that your project passes.
            </p>
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [
              "inventory-desk-capstone",
              "12 connected checkpoints",
              "Domain rules, persistence, API, UI, permissions, concurrency, tests, and recovery.",
            ],
            [
              "aspnet-api-project",
              "Build the API",
              "Trace real HTTP requests through validation, EF Core, ownership, and transactions.",
            ],
            [
              "shipping-maintenance",
              "Ship and maintain",
              "Practice Git changes, CI, containers, configuration, health checks, and restore drills.",
            ],
          ].map(([slug, title, description]) => (
            <Link
              key={slug}
              href={`/courses/${slug}`}
              className="rounded-lg border p-5 transition hover:border-emerald-500"
            >
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {description}
              </p>
            </Link>
          ))}
        </div>
        <Link
          className="block rounded-lg border p-5 font-semibold hover:border-emerald-500"
          href="/playground/http"
        >
          Try the HTTP request playground →
        </Link>
        <p className="text-sm text-slate-500">
          New to the stack? Begin with{" "}
          <Link className="underline" href="/courses/csharp-foundations">
            C# Foundations
          </Link>
          , then try the{" "}
          <Link className="underline" href="/courses/sql-business-labs">
            SQL business labs
          </Link>{" "}
          and{" "}
          <Link className="underline" href="/courses/react-integration-labs">
            React integration labs
          </Link>
          .
        </p>
      </div>
    </SiteShell>
  );
}
