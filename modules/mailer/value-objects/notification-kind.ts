import z from "zod/v4";
import { NotificationKindEnum } from "./notification-kind-enum";

export const NotificationKind = z.enum(NotificationKindEnum).optional().default(NotificationKindEnum.info);
