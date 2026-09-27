"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import { Progress } from "@/components/ui/progress";

interface CatalogCourse {
  id: string;
  slug: string;
  title: string;
  description: string;
  language: string;
  topicTags: string[];
  difficulty: string;
  modules: { lessons: { id: string }[] }[];
}

export function CatalogClient({
  courses,
  completedLessonIds,
}: {
  courses: CatalogCourse[];
  completedLessonIds: string[];
}) {
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const query = params.get("q") ?? "";
  const language = params.get("language") ?? "all";
  const difficulty = params.get("difficulty") ?? "all";
  const tag = params.get("tag") ?? "all";
  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    router.replace(`${path}?${next}`, { scroll: false });
  }

  const languages = useMemo(
    () => Array.from(new Set(courses.map((course) => course.language))),
    [courses],
  );
  const tags = useMemo(
    () => Array.from(new Set(courses.flatMap((course) => course.topicTags))),
    [courses],
  );
  const completed = useMemo(
    () => new Set(completedLessonIds),
    [completedLessonIds],
  );

  const filtered = courses.filter((course) => {
    const text =
      `${course.title} ${course.description} ${course.topicTags.join(" ")}`.toLowerCase();
    return (
      text.includes(query.toLowerCase()) &&
      (language === "all" || course.language === language) &&
      (difficulty === "all" || course.difficulty === difficulty) &&
      (tag === "all" || course.topicTags.includes(tag))
    );
  });

  const started = courses.filter((course) => {
    const lessons = course.modules.flatMap((module) => module.lessons);
    return (
      lessons.some((lesson) => completed.has(lesson.id)) &&
      lessons.some((lesson) => !completed.has(lesson.id))
    );
  });

  return (
    <div className="space-y-6">
      {started.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Continue learning</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {started.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                completed={completed}
                compact
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              className="pl-9"
              aria-label="Search courses"
              placeholder="Search courses"
              value={query}
              onChange={(event) => update("q", event.target.value)}
            />
          </label>
          <Select
            label="Language"
            value={language}
            onChange={(value) => update("language", value)}
            options={["all", ...languages]}
          />
          <Select
            label="Topic"
            value={tag}
            onChange={(value) => update("tag", value)}
            options={["all", ...tags]}
          />
          <Select
            label="Level"
            value={difficulty}
            onChange={(value) => update("difficulty", value)}
            options={["all", "BEGINNER", "INTERMEDIATE", "ADVANCED"]}
          />
        </div>
        {filtered.length === 0 ? (
          <p role="status">
            No courses match.{" "}
            <Link className="underline" href="/tracks">
              Clear filters
            </Link>
          </p>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} completed={completed} />
          ))}
        </div>
      </section>
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
            ? `All ${label.toLowerCase()}s`
            : option.toLowerCase()}
        </option>
      ))}
    </select>
  );
}

function CourseCard({
  course,
  completed,
  compact = false,
}: {
  course: CatalogCourse;
  completed: Set<string>;
  compact?: boolean;
}) {
  const totalLessons = course.modules.reduce(
    (sum, module) => sum + module.lessons.length,
    0,
  );
  const done = course.modules.reduce(
    (sum, module) =>
      sum + module.lessons.filter((lesson) => completed.has(lesson.id)).length,
    0,
  );
  const progress =
    totalLessons === 0 ? 0 : Math.round((done / totalLessons) * 100);

  return (
    <Link
      href={
        compact
          ? `/courses/${course.slug}/lessons/${course.modules.flatMap((module) => module.lessons).find((lesson) => !completed.has(lesson.id))?.id}`
          : `/courses/${course.slug}`
      }
    >
      <Card className="h-full transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
        <CardHeader>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge>{course.language}</Badge>
            <Badge>{course.difficulty.toLowerCase()}</Badge>
          </div>
          <CardTitle>{course.title}</CardTitle>
          {!compact ? (
            <CardDescription>{course.description}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {course.topicTags.slice(0, 4).map((item) => (
              <span key={item} className="text-xs text-slate-500">
                #{item}
              </span>
            ))}
          </div>
          <Progress value={progress} />
          <p className="text-xs text-slate-500">
            {done}/{totalLessons} lessons complete
            {compact ? " · Resume next lesson" : ""}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
