import fs from "node:fs";
import { Octokit } from "octokit";
import { generate } from "vpm-listing-generator";
import { listingJsonPath } from "./consts.js";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const source = JSON.parse(fs.readFileSync("source.json", "utf-8"));
const listing = await generate(source, {
  octokit,
  logger: console.log,
  additionalOnVersion({ package: pkg, release, githubRepo }) {
    const githubUrl = `https://github.com/${githubRepo}`;
    const installerNames = [
      `${pkg.name}-installer.zip`,
      `${pkg.name}-instaler.zip`,
    ];
    const exactInstallerName = [
      `${pkg.name}-${pkg.version}-installer.zip`,
      `${pkg.name}-${pkg.version}-instaler.zip`,
    ];
    const installer = release.assets.find((asset) =>
      installerNames.includes(asset.name),
    );
    const exactInstaller = release.assets.find((asset) =>
      exactInstallerName.includes(asset.name),
    );
    const additional: Record<string, string> = { githubUrl };
    if (installer) {
      additional.installerUrl = installer.browser_download_url;
    }
    if (exactInstaller) {
      additional.exactInstallerUrl = exactInstaller.browser_download_url;
    }
    return additional;
  },
});

fs.writeFileSync(listingJsonPath, JSON.stringify(listing));
