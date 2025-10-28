import { differenceInMinutes } from 'date-fns';

export function checkSLA(target: { prazoMinutos: number; createdAt: Date; completedAt?: Date | null }) {
  const completed = target.completedAt ?? new Date();
  const diff = differenceInMinutes(completed, target.createdAt);
  return diff <= target.prazoMinutos;
}
