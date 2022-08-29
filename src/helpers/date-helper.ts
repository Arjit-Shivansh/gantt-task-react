import { Task, ViewMode } from '../types/public-types';
import DateTimeFormatOptions = Intl.DateTimeFormatOptions;
import DateTimeFormat = Intl.DateTimeFormat;

type DateHelperScales = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond';

const intlDTCache: any = {};

/**
 * Returns monday of current week
 * @param date date for modify
 */
const getMonday = (date: Date) => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(date.setDate(diff));
};

const compare = (dt1: Date, dt2: Date) => {
  let equal = false;

  if (
    dt1.getDate() === dt2.getDate() &&
    dt1.getMonth() === dt2.getMonth() &&
    dt1.getFullYear() === dt2.getFullYear()
  ) {
    equal = true;
  }

  return equal;
};

export const getCachedDateTimeFormat = (
  locString: string | string[],
  opts: DateTimeFormatOptions = {}
): DateTimeFormat => {
  const key = JSON.stringify([locString, opts]);
  let dtf = intlDTCache[key];
  if (!dtf) {
    dtf = new Intl.DateTimeFormat(locString, opts);
    intlDTCache[key] = dtf;
  }
  return dtf;
};

export const addToDate = (date: Date, quantity: number, scale: DateHelperScales) =>
  new Date(
    date.getFullYear() + (scale === 'year' ? quantity : 0),
    date.getMonth() + (scale === 'month' ? quantity : 0),
    date.getDate() + (scale === 'day' ? quantity : 0),
    date.getHours() + (scale === 'hour' ? quantity : 0),
    date.getMinutes() + (scale === 'minute' ? quantity : 0),
    date.getSeconds() + (scale === 'second' ? quantity : 0),
    date.getMilliseconds() + (scale === 'millisecond' ? quantity : 0)
  );

export const startOfDate = (date: Date, scale: DateHelperScales) => {
  const scores = ['millisecond', 'second', 'minute', 'hour', 'day', 'month', 'year'];

  const shouldReset = (_scale: DateHelperScales) => {
    const maxScore = scores.indexOf(scale);
    return scores.indexOf(_scale) <= maxScore;
  };
  return new Date(
    date.getFullYear(),
    shouldReset('year') ? 0 : date.getMonth(),
    shouldReset('month') ? 1 : date.getDate(),
    shouldReset('day') ? 0 : date.getHours(),
    shouldReset('hour') ? 0 : date.getMinutes(),
    shouldReset('minute') ? 0 : date.getSeconds(),
    shouldReset('second') ? 0 : date.getMilliseconds()
  );
};

export const ganttDateRange = (tasks: Task[], viewMode: ViewMode, preStepsCount: number) => {
  let newStartDate: Date = tasks[0].start;
  let newEndDate: Date = tasks[0].start;

  tasks.forEach((task: any) => {
    if (task.start < newStartDate) {
      newStartDate = task.start;
    }
    if (task.end > newEndDate) {
      newEndDate = task.end;
    }
  });

  switch (viewMode) {
    case ViewMode.Year:
      newStartDate = addToDate(newStartDate, -1, 'year');
      newStartDate = startOfDate(newStartDate, 'year');
      newEndDate = addToDate(newEndDate, 1, 'year');
      newEndDate = startOfDate(newEndDate, 'year');
      break;
    case ViewMode.Month:
      newStartDate = addToDate(newStartDate, -1 * preStepsCount, 'month');
      newStartDate = startOfDate(newStartDate, 'month');
      newEndDate = addToDate(newEndDate, 1, 'year');
      newEndDate = startOfDate(newEndDate, 'year');
      break;
    case ViewMode.Week:
      newStartDate = startOfDate(newStartDate, 'day');
      newStartDate = addToDate(getMonday(newStartDate), -7 * preStepsCount, 'day');
      newEndDate = startOfDate(newEndDate, 'day');
      newEndDate = addToDate(newEndDate, 1.5, 'month');
      break;
    case ViewMode.Day:
      newStartDate = startOfDate(newStartDate, 'day');
      newStartDate = addToDate(newStartDate, -1 * preStepsCount, 'day');
      newEndDate = startOfDate(newEndDate, 'day');
      newEndDate = addToDate(newEndDate, 19, 'day');
      break;
    case ViewMode.QuarterDay:
      newStartDate = startOfDate(newStartDate, 'day');
      newStartDate = addToDate(newStartDate, -1 * preStepsCount, 'day');
      newEndDate = startOfDate(newEndDate, 'day');
      newEndDate = addToDate(newEndDate, 66, 'hour'); // 24(1 day)*3 - 6
      break;
    case ViewMode.HalfDay:
      newStartDate = startOfDate(newStartDate, 'day');
      newStartDate = addToDate(newStartDate, -1 * preStepsCount, 'day');
      newEndDate = startOfDate(newEndDate, 'day');
      newEndDate = addToDate(newEndDate, 108, 'hour'); // 24(1 day)*5 - 12
      break;
    case ViewMode.Hour:
      newStartDate = startOfDate(newStartDate, 'hour');
      newStartDate = addToDate(newStartDate, -1 * preStepsCount, 'hour');
      newEndDate = startOfDate(newEndDate, 'day');
      newEndDate = addToDate(newEndDate, 1, 'day');
      break;
    default:
  }
  return [newStartDate, newEndDate];
};

export const seedDates = (startDate: Date, endDate: Date, viewMode: ViewMode) => {
  let currentDate: Date = new Date(startDate);
  const dates: Date[] = [currentDate];
  while (currentDate < endDate) {
    switch (viewMode) {
      case ViewMode.Year:
        currentDate = addToDate(currentDate, 1, 'year');
        break;
      case ViewMode.Month:
        currentDate = addToDate(currentDate, 1, 'month');
        break;
      case ViewMode.Week:
        currentDate = addToDate(currentDate, 7, 'day');
        break;
      case ViewMode.Day:
        currentDate = addToDate(currentDate, 1, 'day');
        break;
      case ViewMode.HalfDay:
        currentDate = addToDate(currentDate, 12, 'hour');
        break;
      case ViewMode.QuarterDay:
        currentDate = addToDate(currentDate, 6, 'hour');
        break;
      case ViewMode.Hour:
        currentDate = addToDate(currentDate, 1, 'hour');
        break;
      default:
    }
    dates.push(currentDate);
  }
  return dates;
};

export const getLocaleMonth = (date: Date, locale: string) => {
  let bottomValue = getCachedDateTimeFormat(locale, {
    month: 'long',
  }).format(date);
  bottomValue = bottomValue.replace(bottomValue[0], bottomValue[0].toLocaleUpperCase());
  return bottomValue;
};

export const getLocalDayOfWeek = (
  date: Date,
  locale: string,
  format?: 'long' | 'short' | 'narrow' | undefined
) => {
  let bottomValue = getCachedDateTimeFormat(locale, {
    weekday: format,
  }).format(date);
  bottomValue = bottomValue.replace(bottomValue[0], bottomValue[0].toLocaleUpperCase());
  return bottomValue;
};

export const getWeekNumberISO8601 = (date: Date) => {
  const tmpDate = new Date(date.valueOf());
  const dayNumber = (tmpDate.getDay() + 6) % 7;
  tmpDate.setDate(tmpDate.getDate() - dayNumber + 3);
  const firstThursday = tmpDate.valueOf();
  tmpDate.setMonth(0, 1);
  if (tmpDate.getDay() !== 4) {
    tmpDate.setMonth(0, 1 + ((4 - tmpDate.getDay() + 7) % 7));
  }
  const weekNumber = (1 + Math.ceil((firstThursday - tmpDate.valueOf()) / 604800000)).toString();

  if (weekNumber.length === 1) {
    return `0${weekNumber}`;
  }
  return weekNumber;
};

export const getDaysInMonth = (month: number, year: number) =>
  new Date(year, month + 1, 0).getDate();

export const isHoliday = (dt: Date, arr: Date[]) => {
  arr.forEach((hd: any) => {
    if (compare(dt, hd)) {
      return true;
    }
  });

  return false;
};
