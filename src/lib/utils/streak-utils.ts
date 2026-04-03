/**
 * Streak and Timezone Utilities for InternHub
 * Standardized on Asia/Kolkata (GMT+5:30)
 */

export const DAILY_POINTS = 2;
export const TASK_COMPLETION_POINTS = 10;
export const EARLY_SUBMISSION_POINTS = 5;
export const EARLY_SUBMISSION_HOURS = 24;

export interface Milestone {
  days: number;
  points: number;
  badge_id?: string;
  badge_name?: string;
}

export const STREAK_MILESTONES: Milestone[] = [
  { days: 3, points: 5, badge_name: '3-Day Starter' },
  { days: 7, points: 15, badge_name: '1-Week Warrior' },
  { days: 10, points: 25, badge_name: '10-Day Legend' },
  { days: 30, points: 100, badge_name: 'Monthly Master' },
];

export const TASK_MILESTONES: Milestone[] = [
  { days: 5, points: 10, badge_name: '5-Day Streak' },
  { days: 10, points: 25, badge_name: '10-Day Streak Bonus' },
];

/**
 * Returns current date in YYYY-MM-DD format for Asia/Kolkata
 */
export function getKolkataDate(date: Date = new Date()): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  
  const formatter = new Intl.DateTimeFormat('en-CA', options); // en-CA gives YYYY-MM-DD
  return formatter.format(date);
}

/**
 * Returns true if the date is Saturday (6) or Sunday (0)
 */
export function isWeekend(dateStr: string): boolean {
  const date = new Date(dateStr);
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Finds the previous working day (skipping Sat/Sun)
 */
export function getPreviousWorkingDay(dateStr: string): string {
  const date = new Date(dateStr);
  
  do {
    date.setDate(date.getDate() - 1);
  } while (date.getDay() === 0 || date.getDay() === 6);
  
  return getKolkataDate(date);
}

/**
 * Business logic to calculate new streak and points
 */
export function calculateStreakUpdate(
  currentStreak: number,
  lastAttendance: string | null,
  today: string
) {
  if (!lastAttendance) {
    return { newStreak: 1, isReset: false };
  }

  if (lastAttendance === today) {
    return { newStreak: currentStreak, isReset: false, alreadyMarked: true };
  }

  const prevWorkingDay = getPreviousWorkingDay(today);

  if (lastAttendance === prevWorkingDay) {
    return { newStreak: currentStreak + 1, isReset: false };
  }

  // If last attendance was before the previous working day, streak resets to 1
  return { newStreak: 1, isReset: true };
}

/**
 * Logic to calculate points and check for milestones
 */
export function evaluateRewards(newStreak: number, currentPoints: number) {
  let pointsToEarn = DAILY_POINTS;
  let awardedBadge = null;

  const milestone = STREAK_MILESTONES.find(m => m.days === newStreak);
  if (milestone) {
    pointsToEarn += milestone.points;
    awardedBadge = milestone.badge_name;
  }

  return {
    totalPoints: currentPoints + pointsToEarn,
    pointsEarned: pointsToEarn,
    awardedBadge
  };
}

/**
 * Task-specific streak calculation
 */
export function calculateTaskStreakUpdate(
  currentStreak: number,
  lastTaskDate: string | null,
  today: string
) {
  if (!lastTaskDate) {
    return { newStreak: 1, isReset: false };
  }

  if (lastTaskDate === today) {
    // Already counted today, maintain current streak but don't increment
    return { newStreak: currentStreak, isReset: false, alreadyCountedToday: true };
  }

  const prevWorkingDay = getPreviousWorkingDay(today);

  if (lastTaskDate === prevWorkingDay) {
    return { newStreak: currentStreak + 1, isReset: false };
  }

  // If last task was before the previous working day, streak resets to 1
  return { newStreak: 1, isReset: true };
}

/**
 * Evaluate rewards for task completion
 */
export function evaluateTaskRewards(
  newStreak: number, 
  currentTotalPoints: number, 
  completedAt: string, 
  deadline: string,
  alreadyCountedToday: boolean,
  taskPointsReward: number = 20
) {
  let pointsEarned = taskPointsReward;
  const reasons: string[] = [`Task Completion (${taskPointsReward}pts)`];
  let awardedBadge = null;
  let isEarly = false;

  // 1. Early Submission Check
  const completedDate = new Date(completedAt);
  const deadlineDate = new Date(deadline);
  const diffInHours = (deadlineDate.getTime() - completedDate.getTime()) / (1000 * 60 * 60);

  if (diffInHours >= EARLY_SUBMISSION_HOURS) {
    pointsEarned += EARLY_SUBMISSION_POINTS;
    reasons.push("Early Submission Bonus");
    isEarly = true;
  }

  // 2. Milestone Check (Only if streak incremented)
  if (!alreadyCountedToday) {
    const milestone = TASK_MILESTONES.find(m => m.days === newStreak);
    if (milestone) {
      pointsEarned += milestone.points;
      awardedBadge = milestone.badge_name;
      reasons.push(`${milestone.badge_name} Milestone`);
    }
  }

  return {
    totalPoints: currentTotalPoints + pointsEarned,
    pointsEarned: pointsEarned,
    awardedBadge,
    isEarly,
    reasons
  };
}
