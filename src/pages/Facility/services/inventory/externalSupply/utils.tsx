export const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  active: "bg-green-100 text-green-700",
  suspended: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
  entered_in_error: "bg-red-100 text-red-700",
};

export const PRIORITY_COLORS: Record<string, string> = {
  routine: "bg-blue-100 text-blue-700",
  urgent: "bg-red-100 text-red-700",
  asap: "bg-amber-100 text-amber-700",
  stat: "bg-purple-100 text-purple-700",
};
