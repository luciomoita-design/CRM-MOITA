import { reminderQueue } from './queue';
import { prisma } from '@/server/prisma';
import { addMinutes, isAfter } from 'date-fns';

export async function scheduleActivityReminders() {
  const activities = await prisma.activity.findMany({
    where: { doneAt: null, dueAt: { not: null } }
  });

  for (const activity of activities) {
    if (!activity.dueAt) continue;
    const reminderTime = addMinutes(activity.dueAt, -15);
    if (isAfter(new Date(), reminderTime)) continue;
    await reminderQueue.add(
      'activity-reminder',
      { activityId: activity.id, dueAt: activity.dueAt },
      { delay: reminderTime.getTime() - Date.now() }
    );
  }
}
