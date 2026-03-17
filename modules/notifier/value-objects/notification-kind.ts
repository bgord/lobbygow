import * as v from "valibot";
import { NotificationKindEnum } from "./notification-kind-enum";

export const NotificationKind = v.optional(
  v.picklist(Object.values(NotificationKindEnum)),
  NotificationKindEnum.info,
);
