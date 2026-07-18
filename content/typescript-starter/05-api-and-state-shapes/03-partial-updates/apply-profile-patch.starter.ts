type Profile = {
  name: string;
  goal: string;
  streak: number;
};

export function applyProfilePatch(profile: Profile, patch: Partial<Profile>) {
  // merge patch into profile without mutating profile
}
