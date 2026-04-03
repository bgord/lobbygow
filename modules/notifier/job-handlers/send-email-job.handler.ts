import type * as Notifier from "+notifier";

export async function SendEmailJobHandler(job: Notifier.Jobs.SendEmailJobType): Promise<void> {
  console.log(job);
}
