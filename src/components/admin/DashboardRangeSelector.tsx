"use client";

import { DateRangeSelector } from "@/components/ui/date-range-selector";

interface Props {
  range: string;
  from?: string;
  to?: string;
  compare?: string;
}

export function DashboardRangeSelector({ range, from, to, compare }: Props) {
  return (
    <DateRangeSelector
      range={range}
      from={from}
      to={to}
      compare={compare}
      basePath="/admin"
      variant="admin"
    />
  );
}
