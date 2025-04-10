import { createHash } from "crypto";
import { writeFile } from "fs/promises";
import path from "path";
import { Plugin } from "vite";

type Extras = Record<string, unknown>;

async function generateBuildMeta(extraProperties?: Extras) {
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

export function appUpdates({ extras }: { extras?: Extras } = {}): Plugin {
  return {
    name: "app-updates",
    configureServer: () => generateBuildMeta(extras),
    buildEnd: () => generateBuildMeta(extras),
  };
}
