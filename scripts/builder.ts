import fs from "node:fs";
import esbuild from "esbuild";
import Handlebars from "handlebars";
import semver from "semver";
import { type Listing, assertListing } from "vpm-listing-generator/Listing";
import type { Package } from "vpm-listing-generator/Package";
import { assertSource } from "vpm-listing-generator/Source";
import {
  listingJsonPath,
  rootDir,
  siteDestinationDir,
  siteSourceDir,
} from "./consts.js";
import {imageSize} from "image-size"

export function build() {
  fs.mkdirSync(siteDestinationDir, { recursive: true });
  fs.copyFileSync(listingJsonPath, `${siteDestinationDir}/index.json`);
  const index = assertListing(
    JSON.parse(fs.readFileSync(listingJsonPath, "utf8")),
  );

  const source = assertSource(
    JSON.parse(fs.readFileSync(`${rootDir}/source.json`, "utf8")),
  );
  const bannerAspectRatio = {
    bannerAspectRatio: "1 / 1",
  };
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const bannerUrl = (source as any).bannerUrl as string | undefined;
  if (bannerUrl) {
    const size = imageSize(fs.readFileSync(`${siteSourceDir}/${bannerUrl}`));
    bannerAspectRatio.bannerAspectRatio = `${size.width} / ${size.height}`;
  }
  const html = fs.readFileSync(`${siteSourceDir}/index.html`, "utf8");
  Handlebars.registerHelper("eachEntries", (context, options) => {
    if (!context) {
      return "";
    }
    const results = [];
    for (const [key, value] of Object.entries(context)) {
      results.push(options.fn({ key, value }));
    }
    return results.join("");
  });
  const template = Handlebars.compile(html);
  const detectType = genDetectType(index.packages);
  const packages = Object.keys(index.packages).map((id) => {
    const versions = semver
      .sort(Object.keys(index.packages[id].versions))
      .map((version) => index.packages[id].versions[version])
      .reverse();
    const latest = versions[0];
    const type = detectType(latest);
    return {
      id,
      latest,
      type,
      versions,
    };
  });
  const result = template({ ...source, packages, ...bannerAspectRatio });
  fs.writeFileSync(`${siteDestinationDir}/index.html`, result);

  const otherFiles = fs
    .readdirSync(siteSourceDir)
    .filter((file) => file !== "index.html");

  for (const file of otherFiles) {
    if (file.endsWith(".ts")) {
      esbuild.buildSync({
        outdir: siteDestinationDir,
        entryPoints: [`${siteSourceDir}/${file}`],
      });
    } else {
      fs.copyFileSync(
        `${siteSourceDir}/${file}`,
        `${siteDestinationDir}/${file}`,
      );
    }
  }
}

function genDetectType(packages: Listing["packages"]) {
  const existIds = new Set(Object.keys(packages));
  return function detectType(pkg: Package): "Any" | "Avatar" | "World" {
    if (!pkg.vpmDependencies) {
      return "Any";
    }
    const ids = new Set(Object.keys(pkg.vpmDependencies));
    if (!ids.size) {
      return "Any";
    }
    if (ids.has("com.vrchat.avatars")) {
      return "Avatar";
    }
    if (ids.has("nadena.dev.modular-avatar")) {
      return "Avatar";
    }
    if (ids.has("nadena.dev.ndmf")) {
      return "Avatar";
    }
    if (ids.has("com.vrchat.worlds")) {
      return "World";
    }
    const checkIds = ids.intersection(existIds);
    if (checkIds.size) {
      for (const id of checkIds) {
        const latestVersion = semver
          .sort(Object.keys(packages[id].versions))
          .reverse()[0];
        const type = detectType(packages[id].versions[latestVersion]);
        if (type !== "Any") {
          return type;
        }
      }
    }
    return "Any";
  };
}
