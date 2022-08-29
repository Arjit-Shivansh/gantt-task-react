import React, { ReactElement } from 'react';
import { ViewMode } from '../../types/public-types';
import { TopPartOfCalendar } from './top-part-of-calendar';
import {
  getCachedDateTimeFormat,
  getDaysInMonth,
  getLocalDayOfWeek,
  getLocaleMonth,
  getWeekNumberISO8601,
} from '../../helpers/date-helper';
import { DateSetup } from '../../types/date-setup';
import styles from './calendar.module.css';

export type CalendarProps = {
  dateSetup: DateSetup;
  locale: string;
  viewMode: ViewMode;
  rtl: boolean;
  headerHeight: number;
  columnWidth: number;
  fontFamily: string;
  fontSize: string;
};

export const Calendar = ({
  dateSetup,
  locale,
  viewMode,
  rtl,
  headerHeight,
  columnWidth,
  fontFamily,
  fontSize,
}: CalendarProps) => {
  const getCalendarValuesForYear = () => {
    const yearTopValues: ReactElement[] = [];
    const yearBottomValues: ReactElement[] = [];
    const topDefaultHeight = headerHeight;
    for (let i = 0; i < dateSetup.dates.length; i += 1) {
      const date = dateSetup.dates[i];
      const bottomValue = date.getFullYear();
      yearBottomValues.push(
        <text
          key={date.getFullYear()}
          y={headerHeight * 0.8}
          x={columnWidth * i + columnWidth * 0.5}
          className={styles.calendarBottomText}
        >
          {bottomValue}
        </text>
      );
      if (i === 0 || date.getFullYear() !== dateSetup.dates[i - 1].getFullYear()) {
        const topValue = date.getFullYear().toString();
        let xText: number;
        if (rtl) {
          xText = (6 + i + date.getFullYear() + 1) * columnWidth;
        } else {
          xText = (6 + i - date.getFullYear()) * columnWidth;
        }
        yearTopValues.push(
          <TopPartOfCalendar
            key={topValue}
            value={topValue}
            x1Line={columnWidth * i}
            y1Line={0}
            y2Line={headerHeight}
            xText={xText}
            yText={topDefaultHeight * 0.9}
          />
        );
      }
    }
    return [yearTopValues, yearBottomValues];
  };

  const getCalendarValuesForMonth = () => {
    const monthTopValues: ReactElement[] = [];
    const monthBottomValues: ReactElement[] = [];
    const topDefaultHeight = headerHeight * 0.5;
    for (let i = 0; i < dateSetup.dates.length; i += 1) {
      const date = dateSetup.dates[i];
      const bottomValue = getLocaleMonth(date, locale);
      monthBottomValues.push(
        <text
          key={bottomValue + date.getFullYear()}
          y={headerHeight * 0.8}
          x={columnWidth * i + columnWidth * 0.5}
          className={styles.calendarBottomText}
        >
          {bottomValue}
        </text>
      );
      if (i === 0 || date.getFullYear() !== dateSetup.dates[i - 1].getFullYear()) {
        const topValue = date.getFullYear().toString();
        let xText: number;
        if (rtl) {
          xText = (6 + i + date.getMonth() + 1) * columnWidth;
        } else {
          xText = (6 + i - date.getMonth()) * columnWidth;
        }
        monthTopValues.push(
          <TopPartOfCalendar
            key={topValue}
            value={topValue}
            x1Line={columnWidth * i}
            y1Line={0}
            y2Line={topDefaultHeight}
            xText={xText}
            yText={topDefaultHeight * 0.9}
          />
        );
      }
    }
    return [monthTopValues, monthBottomValues];
  };

  const getCalendarValuesForWeek = () => {
    const weekTopValues: ReactElement[] = [];
    const weekBottomValues: ReactElement[] = [];
    let weeksCount = 1;
    const topDefaultHeight = headerHeight * 0.5;
    const { dates } = dateSetup;
    for (let i = dates.length - 1; i >= 0; i -= 1) {
      const date = dates[i];
      let topValue = '';
      if (i === 0 || date.getMonth() !== dates[i - 1].getMonth()) {
        // top
        topValue = `${getLocaleMonth(date, locale)}, ${date.getFullYear()}`;
      }
      // bottom
      const bottomValue = `W${getWeekNumberISO8601(date)}`;

      weekBottomValues.push(
        <text
          key={date.getTime()}
          y={headerHeight * 0.8}
          x={columnWidth * (i + +rtl)}
          className={styles.calendarBottomText}
        >
          {bottomValue}
        </text>
      );

      if (topValue) {
        // if last day is new month
        if (i !== dates.length - 1) {
          weekTopValues.push(
            <TopPartOfCalendar
              key={topValue}
              value={topValue}
              x1Line={columnWidth * i + weeksCount * columnWidth}
              y1Line={0}
              y2Line={topDefaultHeight}
              xText={columnWidth * i + columnWidth * weeksCount * 0.5}
              yText={topDefaultHeight * 0.9}
            />
          );
        }
        weeksCount = 0;
      }
      weeksCount += 1;
    }
    return [weekTopValues, weekBottomValues];
  };

  const getCalendarValuesForDay = () => {
    const dayTopValues: ReactElement[] = [];
    const dayBottomValues: ReactElement[] = [];
    const topDefaultHeight = headerHeight * 0.5;
    const { dates } = dateSetup;
    for (let i = 0; i < dates.length; i += 1) {
      const date = dates[i];
      const bottomValue = `${getLocalDayOfWeek(date, locale, 'short')}, ${date
        .getDate()
        .toString()}`;

      dayBottomValues.push(
        <text
          key={date.getTime()}
          y={headerHeight * 0.8}
          x={columnWidth * i + columnWidth * 0.5}
          className={styles.calendarBottomText}
        >
          {bottomValue}
        </text>
      );
      if (i + 1 !== dates.length && date.getMonth() !== dates[i + 1].getMonth()) {
        const topValue = getLocaleMonth(date, locale);

        dayTopValues.push(
          <TopPartOfCalendar
            key={topValue + date.getFullYear()}
            value={topValue}
            x1Line={columnWidth * (i + 1)}
            y1Line={0}
            y2Line={topDefaultHeight}
            xText={
              columnWidth * (i + 1) -
              getDaysInMonth(date.getMonth(), date.getFullYear()) * columnWidth * 0.5
            }
            yText={topDefaultHeight * 0.9}
          />
        );
      }
    }
    return [dayTopValues, dayBottomValues];
  };

  const getCalendarValuesForPartOfDay = () => {
    const partOfDayTopValues: ReactElement[] = [];
    const partOfDayBottomValues: ReactElement[] = [];
    const ticks = viewMode === ViewMode.HalfDay ? 2 : 4;
    const topDefaultHeight = headerHeight * 0.5;
    const { dates } = dateSetup;
    for (let i = 0; i < dates.length; i += 1) {
      const date = dates[i];
      const bottomValue = getCachedDateTimeFormat(locale, {
        hour: 'numeric',
      }).format(date);

      partOfDayBottomValues.push(
        <text
          key={date.getTime()}
          y={headerHeight * 0.8}
          x={columnWidth * (i + +rtl)}
          className={styles.calendarBottomText}
          fontFamily={fontFamily}
        >
          {bottomValue}
        </text>
      );
      if (i === 0 || date.getDate() !== dates[i - 1].getDate()) {
        const topValue = `${getLocalDayOfWeek(
          date,
          locale,
          'short'
        )}, ${date.getDate()} ${getLocaleMonth(date, locale)}`;
        partOfDayTopValues.push(
          <TopPartOfCalendar
            key={topValue + date.getFullYear()}
            value={topValue}
            x1Line={columnWidth * i + ticks * columnWidth}
            y1Line={0}
            y2Line={topDefaultHeight}
            xText={columnWidth * i + ticks * columnWidth * 0.5}
            yText={topDefaultHeight * 0.9}
          />
        );
      }
    }

    return [partOfDayTopValues, partOfDayBottomValues];
  };

  const getCalendarValuesForHour = () => {
    const hourTopValues: ReactElement[] = [];
    const hourBottomValues: ReactElement[] = [];
    const topDefaultHeight = headerHeight * 0.5;
    const { dates } = dateSetup;
    for (let i = 0; i < dates.length; i += 1) {
      const date = dates[i];
      const bottomValue = getCachedDateTimeFormat(locale, {
        hour: 'numeric',
      }).format(date);

      hourBottomValues.push(
        <text
          key={date.getTime()}
          y={headerHeight * 0.8}
          x={columnWidth * (i + +rtl)}
          className={styles.calendarBottomText}
          fontFamily={fontFamily}
        >
          {bottomValue}
        </text>
      );
      if (i !== 0 && date.getDate() !== dates[i - 1].getDate()) {
        const displayDate = dates[i - 1];
        const topValue = `${getLocalDayOfWeek(
          displayDate,
          locale,
          'long'
        )}, ${displayDate.getDate()} ${getLocaleMonth(displayDate, locale)}`;
        const topPosition = (date.getHours() - 24) / 2;
        hourTopValues.push(
          <TopPartOfCalendar
            key={topValue + displayDate.getFullYear()}
            value={topValue}
            x1Line={columnWidth * i}
            y1Line={0}
            y2Line={topDefaultHeight}
            xText={columnWidth * (i + topPosition)}
            yText={topDefaultHeight * 0.9}
          />
        );
      }
    }

    return [hourTopValues, hourBottomValues];
  };

  let topValues: ReactElement[] = [];
  let bottomValues: ReactElement[] = [];
  switch (dateSetup.viewMode) {
    case ViewMode.Year:
      [topValues, bottomValues] = getCalendarValuesForYear();
      break;
    case ViewMode.Month:
      [topValues, bottomValues] = getCalendarValuesForMonth();
      break;
    case ViewMode.Week:
      [topValues, bottomValues] = getCalendarValuesForWeek();
      break;
    case ViewMode.HalfDay:
      [topValues, bottomValues] = getCalendarValuesForPartOfDay();
      break;
    case ViewMode.Hour:
      [topValues, bottomValues] = getCalendarValuesForHour();
      break;
    default:
      [topValues, bottomValues] = getCalendarValuesForDay();
  }
  return (
    <g className="calendar" fontSize={fontSize} fontFamily={fontFamily}>
      <rect
        x={0}
        y={0}
        width={columnWidth * dateSetup.dates.length}
        height={headerHeight}
        className={styles.calendarHeader}
      />
      {bottomValues} {topValues}
    </g>
  );
};
