import { createHash } from "crypto";
import { writeFile } from "fs/promises";
import path from "path";
import { Plugin } from "vite";

async function generateBuildMeta(extraProperties?: Record<string, unknown>) {
  const meta: Record<string, unknown> = {
    version: process.env.npm_package_version,
    builtOn: new Date().getTime(),
    ...extraProperties,
  };

  meta["build"] = createHash("sha256")
    .update(JSON.stringify(meta))
    .digest("hex");

  await writeFile(
    path.join(__dirname, "..", "public/build-meta.json"),
    JSON.stringify(meta),
  );

  console.info(`v${meta.version} build: ${meta.build}`);
}

export function appUpdates({
  extraProperties,
}: {
  extraProperties?: Record<string, unknown>;
} = {}): Plugin {
  return {
    name: "app-updates",
    configureServer: async () => {
      await generateBuildMeta(extraProperties);
    },
    buildEnd: async () => {
      await generateBuildMeta(extraProperties);
    },
  };
}
