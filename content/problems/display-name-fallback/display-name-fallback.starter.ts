type Profile = { firstName?: string; lastName?: string; username: string };

export function displayNameFallback(profile: Profile) {
  // prefer full name, then username
}
