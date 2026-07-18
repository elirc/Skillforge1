type Config = { retries: number; timeout: number; verbose: boolean };

export function applyDefaults(defaults: Config, userConfig: Partial<Config>) {
  // merge defaults with user config
}
