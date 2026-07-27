export function generateMonthlyPaymentDates(startDateStr: string, endDateStr: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  const startDay = start.getDate();
  let current = new Date(start);

  while (current <= end) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(startDay).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);

    // Increment 1 month
    current.setMonth(current.getMonth() + 1);
  }

  return dates;
}
