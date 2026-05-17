/**
 * Format bytes to human-readable size
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

/**
 * Format seconds to human-readable time
 */
export const formatTime = (seconds: number): string => {
  if (seconds < 1) return "less than 1 sec";
  if (seconds < 60) return `${Math.ceil(seconds)} sec`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.ceil(seconds % 60);

  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes} min ${remainingSeconds} sec`
      : `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0
    ? `${hours} hr ${remainingMinutes} min`
    : `${hours} hr`;
};
