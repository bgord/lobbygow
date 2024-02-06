import z from "zod";

import { NotificationKindEnum } from "./notification-kind-enum";

export const NotificationKind = z
  .nativeEnum(NotificationKindEnum)
  .optional()
  .default(NotificationKindEnum.info);
