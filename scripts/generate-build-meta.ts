import { createHash } from "crypto";
import dotenv from "dotenv";
import { writeFile } from "fs/promises";
import path from "path";

dotenv.config({ path: [".env.local", ".env"] });

function generateBuildMeta() {
  const properties = {
    build: new Date().getTime(),
    apps: process.env.REACT_ENABLED_APPS,
  };

  const buildHash = createHash("sha256")
    .update(JSON.stringify(properties))
    .digest("hex");

  return {
    version: process.env.npm_package_version,
    build: buildHash,
  };
}

async function main() {
  const buildMeta = generateBuildMeta();

  console.log(
    `Generating build meta. v${buildMeta.version} build: ${buildMeta.build}`,
  );

  await writeFile(
    path.join(__dirname, "..", "public/build-meta.json"),
    JSON.stringify(buildMeta),
  );
}

main();
