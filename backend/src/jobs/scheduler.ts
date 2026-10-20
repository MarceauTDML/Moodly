import cron, { type ScheduledTask } from 'node-cron';
import { env } from '../config/env.config';
import { logger } from '../config/logger.config';
import { runComputeMoodSnapshots, runFinalizeYesterdaySnapshots } from './compute-mood-snapshots.job';
import { runDailyMoodReminder } from './daily-mood-reminder.job';

const tasks: ScheduledTask[] = [];

const schedule = (name: string, expression: string, job: () => Promise<unknown>) => {
  if (!cron.validate(expression)) {
    logger.error({ name, expression }, 'Expression cron invalide, job ignoré');
    return;
  }
  const task = cron.schedule(
    expression,
    async () => {
      const started = Date.now();
      try {
        const result = await job();
        logger.info({ job: name, result, durationMs: Date.now() - started }, 'Job terminé');
      } catch (err) {
        logger.error({ err, job: name }, 'Job en échec');
      }
    },
    { timezone: env.TIMEZONE, name, noOverlap: true },
  );
  tasks.push(task);
};

export const startScheduler = () => {
  schedule('compute-mood-snapshots', env.CRON_SNAPSHOTS, runComputeMoodSnapshots);
  schedule('finalize-yesterday-snapshots', '5 0 * * *', runFinalizeYesterdaySnapshots);
  schedule('daily-mood-reminder', env.CRON_DAILY_REMINDER, runDailyMoodReminder);

  logger.info({ jobs: tasks.length, timezone: env.TIMEZONE }, 'Planificateur démarré');
};

export const stopScheduler = () => {
  for (const task of tasks) task.stop();
  tasks.length = 0;
};
