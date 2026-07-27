// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore `.open-next/worker.js` is generated during the build.
import handler from "./.open-next/worker.js";
import { runDataRetention } from "./lib/data-retention";

export default {
  fetch: handler.fetch,

  async scheduled(controller, env) {
    await runDataRetention(env.DB, new Date(controller.scheduledTime));
  },
} satisfies ExportedHandler<CloudflareEnv>;

// OpenNext cache support requires these generated Durable Object exports.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore `.open-next/worker.js` is generated during the build.
export { BucketCachePurge, DOQueueHandler, DOShardedTagCache } from "./.open-next/worker.js";
