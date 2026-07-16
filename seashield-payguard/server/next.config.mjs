import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // This app lives inside a larger repo; pin the tracing root to this folder
  // so Next doesn't get confused by parent lockfiles.
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url)),
};
export default nextConfig;
