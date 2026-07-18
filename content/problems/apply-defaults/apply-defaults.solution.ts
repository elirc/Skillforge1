type Config = { retries: number; timeout: number; verbose: boolean };

export function applyDefaults(defaults: Config, userConfig: Partial<Config>): Config {
  return { ...defaults, ...userConfig };
}
