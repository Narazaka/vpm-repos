import fs from "node:fs";
import { Octokit } from "octokit";
import { generate } from "vpm-listing-generator";
import { listingJsonPath } from "./consts.js";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const source = JSON.parse(fs.readFileSync("source.json", "utf-8"));
const listing = await generate(source, {
  octokit,
  logger: console.log,
});

fs.writeFileSync(listingJsonPath, JSON.stringify(listing));
