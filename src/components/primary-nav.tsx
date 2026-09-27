"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, FolderCode, Map, RotateCcw, Swords, Target, UserCircle } from "lucide-react";

const links = [
  { href: "/", label: "Today", icon: Target }, { href: "/tracks", label: "Tracks", icon: Map },
  { href: "/projects", label: "Projects", icon: FolderCode }, { href: "/problems", label: "Problems", icon: Swords }, { href: "/mastery", label: "Mastery", icon: Brain },
  { href: "/reviews", label: "Reviews", icon: RotateCcw }, { href: "/profile", label: "Profile", icon: UserCircle },
];
export function PrimaryNav({ due }: { due: number }) {
  const path = usePathname();
  return <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-1 text-sm">{links.map(link => {
    const active = path === link.href || (link.href !== "/" && path.startsWith(`${link.href}/`)) || (link.href === "/tracks" && path.startsWith("/courses/"));
    return <Link key={link.href} href={link.href} aria-label={link.href === "/reviews" ? `Reviews, ${due} due` : link.label} aria-current={active ? "page" : undefined} title={link.label} className={`flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-md px-2 py-2 ${active ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200" : "hover:bg-slate-100 dark:hover:bg-slate-900"}`}><link.icon className="h-4 w-4" aria-hidden /><span className="hidden sm:inline">{link.label}</span>{link.href === "/reviews" && due > 0 ? <span className="text-xs">{due}</span> : null}</Link>;
  })}</nav>;
}
