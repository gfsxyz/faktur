/**
 * Generates a formatted date range text from chart data
 * @param data Array of chart data with month property (e.g., "Jan 2025")
 * @param fallback Fallback text when no data is available
 * @returns Formatted date range (e.g., "Jan - Dec 2025" or "Feb 2024 - Jan 2025")
 */
export function getChartDateRangeText(
  data: { month: string }[] | null | undefined,
  fallback: string = "No data"
): string {
  if (!data || data.length === 0) return fallback;

  const firstMonth = data[0].month;
  const lastMonth = data[data.length - 1].month;

  const [firstMonthName, firstYear] = firstMonth.split(" ");
  const [lastMonthName, lastYear] = lastMonth.split(" ");

  if (firstYear === lastYear) {
    return `${firstMonthName} - ${lastMonthName} ${lastYear}`;
  }
  return `${firstMonth} - ${lastMonth}`;
}
