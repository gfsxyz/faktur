export const STATUS_COLORS: Record<string, string> = {
  paid: "oklch(0.70 0.12 143)",
  sent: "oklch(0.55 0.10 271)",
  draft: "oklch(0.32 0.015 60)",
  overdue: "oklch(0.48 0.10 33)",
  cancelled: "oklch(75.721% 0.00009 271.152)",
};

export const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
};
