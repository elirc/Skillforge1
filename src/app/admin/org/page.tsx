import { SiteShell } from "@/components/site-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OrgAdminStubPage() {
  const orgs = await prisma.organization.findMany({ include: { admin: true, members: true } });

  return (
    <SiteShell>
      <h1 className="text-3xl font-semibold">Organization admin</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">Reserved schema and route for team plans.</p>
      <div className="mt-6 grid gap-4">
        {orgs.map((org) => (
          <Card key={org.id}>
            <CardHeader>
              <CardTitle>{org.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-400">
              {org.seats} seats, {org.members.length} members, admin {org.admin.email}
            </CardContent>
          </Card>
        ))}
      </div>
    </SiteShell>
  );
}
