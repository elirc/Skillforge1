import type { TestCase } from "@content/_authoring/types";

export const functionName = "Resolve";

const layer = (Source: string, Values: Record<string, string | null>) => ({ Source, Values });

export const tests: TestCase[] = [
  {
    name: "later layers override earlier ones",
    args: [
      [
        layer("appsettings.json", { "Email:Host": "smtp.example.test", "Email:From": "noreply@example.test" }),
        layer("appsettings.Production.json", { "Email:Host": "smtp.prod.test" }),
      ],
      [],
    ],
    expected: {
      Values: { "Email:Host": "smtp.prod.test", "Email:From": "noreply@example.test" },
      Errors: [],
    },
  },
  {
    name: "environment variables use __ as the section separator",
    args: [
      [layer("appsettings.json", { "Email:Host": "smtp.example.test" }), layer("environment", { Email__Host: "smtp.env.test" })],
      [],
    ],
    expected: { Values: { "Email:Host": "smtp.env.test" }, Errors: [] },
  },
  {
    name: "keys are case-insensitive and keep their first casing",
    args: [[layer("appsettings.json", { "Email:From": "a@example.test" }), layer("environment", { EMAIL__FROM: "b@example.test" })], []],
    expected: { Values: { "Email:From": "b@example.test" }, Errors: [] },
  },
  {
    name: "reports required keys that are missing or blank",
    args: [
      [layer("appsettings.json", { "Email:Host": "smtp.example.test", "Email:From": "" })],
      ["Email:Host", "Email:From", "Email:ApiKey"],
    ],
    expected: {
      Values: { "Email:Host": "smtp.example.test", "Email:From": "" },
      Errors: ["Missing: Email:From", "Missing: Email:ApiKey"],
    },
  },
  {
    name: "flags secrets committed in appsettings files, but not user secrets",
    args: [
      [
        layer("appsettings.json", { "ConnectionStrings:Default": "Server=db;Password=hunter2", "Email:Host": "smtp" }),
        layer("user-secrets", { "Email:ApiKey": "sk_test_123" }),
      ],
      ["Email:ApiKey"],
    ],
    expected: {
      Values: {
        "ConnectionStrings:Default": "Server=db;Password=hunter2",
        "Email:Host": "smtp",
        "Email:ApiKey": "sk_test_123",
      },
      Errors: ["Secret in committed file: ConnectionStrings:Default (appsettings.json)"],
    },
  },
  {
    name: "a null value does not override a lower layer",
    args: [[layer("appsettings.json", { "Features:Streaks": "true" }), layer("environment", { Features__Streaks: null })], ["features:streaks"]],
    expected: { Values: { "Features:Streaks": "true" }, Errors: [] },
    hidden: true,
  },
  {
    name: "an overridden committed secret is still a leak, and missing keys come first",
    args: [
      [
        layer("appsettings.Development.json", { Jwt__SigningSecret: "dev-only", "Email:ApiKey": "" }),
        layer("environment", { Jwt__SigningSecret: "from-vault" }),
      ],
      ["Email:ApiKey"],
    ],
    expected: {
      Values: { "Jwt:SigningSecret": "from-vault", "Email:ApiKey": "" },
      Errors: ["Missing: Email:ApiKey", "Secret in committed file: Jwt:SigningSecret (appsettings.Development.json)"],
    },
    hidden: true,
  },
];
