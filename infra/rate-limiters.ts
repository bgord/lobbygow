import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";

export const HealthcheckStore = new bg.RateLimitStoreNodeCacheAdapter(tools.Duration.Seconds(5));

export const NotificationSendStore = new bg.RateLimitStoreNodeCacheAdapter(tools.Duration.Seconds(5));
