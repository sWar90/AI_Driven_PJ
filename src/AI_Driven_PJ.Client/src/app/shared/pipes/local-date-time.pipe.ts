import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

const UTC_OFFSET_PATTERN = /(?:z|[+-]\d{2}:?\d{2})$/i;
const DEFAULT_LOCAL_DATE_TIME_FORMAT = 'dd/MMM/yyyy hh:mm a';

@Pipe({
  name: 'localDateTime',
  standalone: true,
})
export class LocalDateTimePipe implements PipeTransform {
  private readonly datePipe = new DatePipe('en-US');

  transform(
    value: Date | string | null | undefined,
    format = DEFAULT_LOCAL_DATE_TIME_FORMAT,
  ): string {
    const date = parseServerUtcDate(value);

    if (!date) {
      return '-';
    }

    return this.datePipe.transform(date, format) ?? '-';
  }
}

export function parseServerUtcDate(value: Date | string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const utcValue = UTC_OFFSET_PATTERN.test(trimmedValue) ? trimmedValue : `${trimmedValue}Z`;
  const date = new Date(utcValue);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function toServerUtcIso(value: Date | string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
