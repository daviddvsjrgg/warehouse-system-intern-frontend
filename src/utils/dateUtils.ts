// Utility function to convert UTC date to Jakarta Time (GMT+7)
export const convertToJakartaTime = (utcDate: string): string => {
  // Convert the UTC date string to a Date object
  const date = new Date(utcDate);

  // Extract year, day, and month, and format time using 24-hour format
  const year = date.getFullYear();
  const day = ('0' + date.getDate()).slice(-2);  // Ensure 2-digit day
  const month = ('0' + (date.getMonth() + 1)).slice(-2);  // Ensure 2-digit month

  // Format time (24-hour format)
  const hours = ('0' + date.getHours()).slice(-2);  // 1-24 hour format
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);

  // Return formatted date and time in the YYYY-DD-MM and 24-hour format
  return `${year}-${month}- ${day} ${hours}:${minutes}:${seconds}`;
};
