import type { NextConfig } from "next";
import packageJson from "./package.json";

const now = new Date();
const buildDateString = now.toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "America/New_York",
});
const buildTimeString = now.toLocaleTimeString("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "America/New_York",
});
const buildTimestamp = `${buildDateString} • ${buildTimeString}`;

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_APP_VERSION: `v${packageJson.version}`,
    NEXT_PUBLIC_BUILD_TIMESTAMP: buildTimestamp,
    NEXT_PUBLIC_BUILD_ISO: now.toISOString(),
  },
};

export default nextConfig;
