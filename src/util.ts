import { Temporal } from "@js-temporal/polyfill";

export function formatDuration(milliseconds: number | null) {
  if (!milliseconds) {
    return "--:--";
  }
  const duration = Temporal.Duration.from({
    milliseconds: Math.floor(milliseconds),
  }).round({
    largestUnit: "hour",
  });

  let formatted = "";

  if (duration.hours !== 0)
    formatted = `${String(duration.hours).padStart(2, "0")}:`;
  formatted = `${formatted}${String(duration.minutes).padStart(2, "0")}:${String(duration.seconds).padStart(2, "0")}`;

  return formatted;
}
