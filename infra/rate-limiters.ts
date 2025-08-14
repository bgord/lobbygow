import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";

export const HealthcheckStore = new bg.NodeCacheRateLimitStore(tools.Time.Seconds(5));

export const NotificationSendStore = new bg.NodeCacheRateLimitStore(tools.Time.Seconds(5));
