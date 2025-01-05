import fs from "node:fs";
import { siteDestinationDir } from "./consts.js";

if (fs.existsSync(siteDestinationDir)) {
  fs.rmSync(siteDestinationDir, { recursive: true });
}
