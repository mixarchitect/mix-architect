"use client";

import { DateRangeSelector } from "@/components/ui/date-range-selector";

interface Props {
  range: string;
  from?: string;
  to?: string;
}

export function AttributionsRangeSelector({ range, from, to }: Props) {
  return (
    <DateRangeSelector
      range={range}
      from={from}
      to={to}
      basePath="/admin/attributions"
      variant="admin"
    />
  );
}
