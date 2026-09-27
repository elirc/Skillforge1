"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ProblemListItem {
  id: string;
  slug: string;
  title: string;
  prompt: string;
  language: string;
  runtime?: string;
  difficulty: string;
  conceptTags: string[];
  solved: boolean;
}

const difficulties = ["all", "EASY", "MEDIUM", "HARD"];
const drillFamily = (slug: string) =>
  /^(?:js|ts|csharp|react)-(?:easy|medium)-[^-]+-(.+)$/.exec(slug)?.[1] ?? null;

export function ProblemsClient({ problems }: { problems: ProblemListItem[] }) {
  const params = useSearchParams();
  const query = params.get("q") ?? "";
  const language = params.get("language") ?? "all";
  const difficulty = params.get("difficulty") ?? "all";
  const tag = params.get("tag") ?? "all";
  const status = params.get("status") ?? "all";
  const sort = params.get("sort") ?? "difficulty";
  const set = params.get("set") ?? "all";
  const familyCounts = new Map<string, number>();
  for (const problem of problems) {
    const family = drillFamily(problem.slug);
    if (family) familyCounts.set(family, (familyCounts.get(family) ?? 0) + 1);
  }
  const isDrill = (slug: string) =>
    (familyCounts.get(drillFamily(slug) ?? "") ?? 0) > 1;
  const pageSize = 24;
  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    if (key !== "page") next.delete("page");
    window.history.replaceState(
      null,
      "",
      `/problems${next.size ? `?${next}` : ""}`,
    );
  };

  const languages = useMemo(
    () =>
      Array.from(new Set(problems.map((problem) => problem.language))).sort(),
    [problems],
  );
  const tags = useMemo(
    () =>
      Array.from(
        new Set(problems.flatMap((problem) => problem.conceptTags)),
      ).sort(),
    [problems],
  );

  const filtered = problems.filter((problem) => {
    const text =
      `${problem.title} ${problem.prompt} ${problem.language} ${problem.conceptTags.join(" ")}`.toLowerCase();
    return (
      text.includes(query.toLowerCase()) &&
      (language === "all" || problem.language === language) &&
      (difficulty === "all" || problem.difficulty === difficulty) &&
      (tag === "all" || problem.conceptTags.includes(tag)) &&
      (set === "all" ||
        (set === "extra-drills"
          ? isDrill(problem.slug)
          : !isDrill(problem.slug))) &&
      (status === "all" ||
        (status === "solved" ? problem.solved : !problem.solved))
    );
  });
  if (sort === "title") filtered.sort((a, b) => a.title.localeCompare(b.title));
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(pages, Math.max(1, Number(params.get("page")) || 1));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <label className="relative sm:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            aria-label="Search problems"
            className="pl-9"
            placeholder="Search problems"
            value={query}
            onChange={(event) => setFilter("q", event.target.value)}
          />
        </label>
        <Select
          label="Topic language"
          value={language}
          onChange={(value) => setFilter("language", value)}
          options={["all", ...languages]}
        />
        <Select
          label="Difficulty"
          value={difficulty}
          onChange={(value) => setFilter("difficulty", value)}
          options={difficulties}
        />
        <Select
          label="Concept"
          value={tag}
          onChange={(value) => setFilter("tag", value)}
          options={["all", ...tags]}
        />
        <Select
          label="Status"
          value={status}
          onChange={(value) => setFilter("status", value)}
          options={["all", "solved", "unsolved"]}
        />
        <Select
          label="Sort"
          value={sort}
          onChange={(value) => setFilter("sort", value)}
          options={["difficulty", "title"]}
        />
        <Select
          label="Practice set"
          value={set}
          onChange={(value) => setFilter("set", value)}
          options={["all", "core-problems", "extra-drills"]}
        />
      </div>

      <div className="text-sm text-slate-500">
        {filtered.length} matching problems · Page {page} of {pages}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((problem) => (
          <Link key={problem.id} href={`/problems/${problem.slug}`}>
            <Card className="h-full transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge>{problem.language}</Badge>
                  {problem.runtime && problem.runtime !== problem.language ? (
                    <Badge>Runs {problem.runtime}</Badge>
                  ) : null}
                  <Badge>{problem.difficulty.toLowerCase()}</Badge>
                  {problem.solved ? (
                    <Badge className="border-emerald-300 text-emerald-700 dark:text-emerald-300">
                      Solved
                    </Badge>
                  ) : null}
                  {isDrill(problem.slug) ? (
                    <Badge>
                      Extra drill ·{" "}
                      {drillFamily(problem.slug)?.replaceAll("-", " ")}
                    </Badge>
                  ) : null}
                </div>
                <CardTitle>{problem.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {problem.prompt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {problem.conceptTags.slice(0, 4).map((item) => (
                    <span key={item} className="text-xs text-slate-500">
                      #{item}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="rounded border p-8 text-center">
          <p>No problems match these filters.</p>
          <Button
            className="mt-3"
            variant="secondary"
            onClick={() => window.history.replaceState(null, "", "/problems")}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <nav
          aria-label="Problem pages"
          className="flex items-center justify-between"
        >
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setFilter("page", String(page - 1))}
          >
            Previous
          </Button>
          <span className="text-sm">
            {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </span>
          <Button
            variant="outline"
            disabled={page === pages}
            onClick={() => setFilter("page", String(page + 1))}
          >
            Next
          </Button>
        </nav>
      )}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option === "all"
            ? `All ${label.toLowerCase()}`
            : option.toLowerCase()}
        </option>
      ))}
    </select>
  );
}
