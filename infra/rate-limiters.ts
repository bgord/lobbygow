import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";

export const NotificationSendStore = new bg.RateLimitStoreNodeCacheAdapter(tools.Duration.Seconds(5));
