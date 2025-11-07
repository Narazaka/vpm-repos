import fs from 'fs/promises';
import path from 'path';
import semver from 'semver';

const root = path.dirname(import.meta.dirname);
const listingJsonPath = path.join(root, 'index.json');
const listingJson = await fs.readFile(listingJsonPath, 'utf-8');
const listing = JSON.parse(listingJson);
const amc = listing.packages["net.narazaka.vrchat.avatar-menu-creater-for-ma"]
for (const version of Object.keys(amc.versions)) {
  if (semver.gte(version, '1.36.0')) continue;
  const ver = amc.versions[version];
  ver.vpmDependencies["com.vrchat.avatars"] = ">=3.0.9 <3.9.1-beta.1 || >=3.9.1-beta.2";
}
await fs.writeFile(listingJsonPath, JSON.stringify(listing), 'utf-8');
