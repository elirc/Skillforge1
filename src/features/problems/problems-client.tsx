"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ProblemListItem {
  id: string;
  slug: string;
  title: string;
  prompt: string;
  language: string;
  difficulty: string;
  conceptTags: string[];
  solved: boolean;
}

const difficulties = ["all", "EASY", "MEDIUM", "HARD"];

export function ProblemsClient({ problems }: { problems: ProblemListItem[] }) {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [tag, setTag] = useState("all");

  const languages = useMemo(() => Array.from(new Set(problems.map((problem) => problem.language))).sort(), [problems]);
  const tags = useMemo(() => Array.from(new Set(problems.flatMap((problem) => problem.conceptTags))).sort(), [problems]);

  const filtered = problems.filter((problem) => {
    const text = `${problem.title} ${problem.prompt} ${problem.language} ${problem.conceptTags.join(" ")}`.toLowerCase();
    return (
      text.includes(query.toLowerCase()) &&
      (language === "all" || problem.language === language) &&
      (difficulty === "all" || problem.difficulty === difficulty) &&
      (tag === "all" || problem.conceptTags.includes(tag))
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input className="pl-9" placeholder="Search problems" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <Select value={language} onChange={setLanguage} options={["all", ...languages]} />
        <Select value={difficulty} onChange={setDifficulty} options={difficulties} />
        <Select value={tag} onChange={setTag} options={["all", ...tags]} />
      </div>

      <div className="text-sm text-slate-500">
        Showing {filtered.length} of {problems.length} problems
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((problem) => (
          <Link key={problem.id} href={`/problems/${problem.slug}`}>
            <Card className="h-full transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge>{problem.language}</Badge>
                  <Badge>{problem.difficulty.toLowerCase()}</Badge>
                  {problem.solved ? <Badge className="border-emerald-300 text-emerald-700 dark:text-emerald-300">Solved</Badge> : null}
                </div>
                <CardTitle>{problem.title}</CardTitle>
                <CardDescription className="line-clamp-3">{problem.prompt}</CardDescription>
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
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option === "all" ? "All" : option.toLowerCase()}
        </option>
      ))}
    </select>
  );
}
