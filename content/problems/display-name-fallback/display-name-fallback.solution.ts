type Profile = { firstName?: string; lastName?: string; username: string };

export function displayNameFallback(profile: Profile): string {
  if (profile.firstName && profile.lastName) return `${profile.firstName} ${profile.lastName}`;
  return profile.username;
}
