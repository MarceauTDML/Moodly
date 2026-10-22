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

  const emailTargets = users.filter((u) => !u.pushToken && u.emailNotificationsEnabled);

  const pushed = await sendPushNotifications(pushMessages);
  for (const user of emailTargets) await emailService.sendDailyReminder(user.email, user.firstName);

  return { candidates: users.length, pushed, emailed: emailTargets.length };
};
