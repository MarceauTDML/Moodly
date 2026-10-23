import { PENDING_ACTIVATION_HASH } from '../config/auth.config';
import { prisma } from '../config/prisma.config';
import { emailService } from '../services/email.service';
import { type PushMessage, sendPushNotifications } from '../services/push-notification.service';
import { today } from '../utils/date.util';

export const runDailyMoodReminder = async () => {
  const day = today();
  const users = await prisma.user.findMany({
    where: {
      dailyReminderEnabled: true,
      passwordHash: { not: PENDING_ACTIVATION_HASH },
      memberships: { some: { isLead: false } },
      checkins: { none: { date: day } },
    },
    select: {
      email: true,
      firstName: true,
      pushToken: true,
      emailNotificationsEnabled: true,
    },
  });

  const pushMessages: PushMessage[] = users
    .filter((u) => u.pushToken)
    .map((u) => ({
      to: u.pushToken!,
      title: 'La question du jour',
      body: `${u.firstName}, comment s'est passée ta journée ?`,
      data: { screen: 'DailyCheckin' },
    }));

  const report = await sendPushNotifications(pushMessages);
  // Un appareil désinscrit (application supprimée, autorisation retirée) ne recevra plus rien.
  if (report.unregistered.length)
    await prisma.user.updateMany({
      where: { pushToken: { in: report.unregistered } },
      data: { pushToken: null },
    });

  // Sans push réussi, le rappel part par e-mail si l'utilisateur l'accepte.
  const delivered = new Set(report.delivered);
  const emailTargets = users.filter(
    (u) => u.emailNotificationsEnabled && !(u.pushToken && delivered.has(u.pushToken)),
  );
  for (const user of emailTargets) await emailService.sendDailyReminder(user.email, user.firstName);

  return {
    candidates: users.length,
    pushed: report.delivered.length,
    unregistered: report.unregistered.length,
    emailed: emailTargets.length,
  };
};
