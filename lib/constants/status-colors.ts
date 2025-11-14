// Status colors - synchronized with chart colors from globals.css
export const STATUS_COLORS: Record<string, string> = {
  paid: "oklch(0.6886 0.1136 122.0697)",    // --chart-1 (green)
  sent: "oklch(0.6655 0.0902 172.4808)",    // --chart-2 (blue)
  draft: "oklch(0.5416 0.111 21.4177)",     // --chart-3 (orange)
  overdue: "oklch(0.5471 0.1438 32.9149)",  // --destructive (red)
  cancelled: "oklch(0.5532 0.145 320.2471)", // --chart-5 (purple)
};

export const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
};
