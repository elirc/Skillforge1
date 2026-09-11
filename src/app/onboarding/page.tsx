import { SiteShell } from "@/components/site-shell";
import { OnboardingForm } from "@/features/onboarding/onboarding-form";
import { getCurrentUser } from "@/server/user";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Set up your path | Skillforge",
};

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Set up your path</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Everything here stays on this machine, in your local database. Change any of it later from your profile.
        </p>
        <div className="mt-8">
          <OnboardingForm
            defaults={{
              name: user.name,
              goal: user.goal,
              experience: user.experience,
              dailyXpGoal: user.dailyXpGoal,
              focusTags: user.focusTags,
            }}
          />
        </div>
      </div>
    </SiteShell>
  );
}
