import * as bg from "@bgord/bun";
import * as tools from "@bgord/tools";
import * as v from "valibot";

export const SEND_EMAIL_JOB = "SEND_EMAIL_JOB";

export const SendEmailJobSchema = v.object({
  ...bg.JobEnvelopeSchema,
  name: v.literal(SEND_EMAIL_JOB),
  payload: v.object({
    from: tools.Email,
    to: tools.Email,
    subject: bg.MailerSubject,
    html: bg.MailerContentHtml,
  }),
});

export type SendEmailJobType = v.InferOutput<typeof SendEmailJobSchema>;
