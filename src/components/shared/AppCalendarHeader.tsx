"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Button as CalendarNavButton,
  CalendarMonthPicker,
  CalendarYearPicker,
} from "react-aria-components";
import AppSelect from "./AppSelect";

/**
 * The shared month/year jump for the app's calendars — the ‹ › arrows alone make
 * a birth year hundreds of clicks away. It wraps react-aria's month and year
 * pickers in AppSelect, keeps the dropdown on the same control as the forms, and
 * must render inside a `<Calendar>`.
 */

const NAV_CLASS =
  "grid place-items-center w-7 h-7 shrink-0 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)] cursor-pointer transition-colors [&>svg]:w-4 [&>svg]:h-4";

interface AppCalendarHeaderProps {
  /** Spacing and borders the surrounding calendar wants; the row itself brings none. */
  className?: string;
}

export default function AppCalendarHeader({ className = "" }: AppCalendarHeaderProps) {
  return (
    <header className={`flex items-center gap-1.5 ${className}`}>
      <CalendarNavButton
        slot="previous"
        aria-label="Previous month"
        className={NAV_CLASS}
      >
        <ChevronLeft />
      </CalendarNavButton>

      <CalendarMonthPicker>
        {({ "aria-label": ariaLabel, value, onChange, items }) => (
          <AppSelect
            size="xs"
            ariaLabel={ariaLabel}
            className="w-[92px]"
            value={String(value ?? "")}
            onChange={(key) => {
              if (key) onChange(key);
            }}
            options={items.map((item) => ({
              value: String(item.id),
              label: item.formatted,
            }))}
          />
        )}
      </CalendarMonthPicker>

      <CalendarYearPicker visibleYears={100}>
        {({ "aria-label": ariaLabel, value, onChange, items }) => (
          <AppSelect
            size="xs"
            ariaLabel={ariaLabel}
            className="w-[78px]"
            value={String(value ?? "")}
            onChange={(key) => {
              if (key) onChange(key);
            }}
            options={items.map((item) => ({
              value: String(item.id),
              label: item.formatted,
            }))}
          />
        )}
      </CalendarYearPicker>

      <CalendarNavButton
        slot="next"
        aria-label="Next month"
        className={NAV_CLASS}
      >
        <ChevronRight />
      </CalendarNavButton>
    </header>
  );
}
