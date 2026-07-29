export function generateMonthlyPaymentDates(startDateStr: string, endDateStr: string): string[] {
  const dates: string[] = [];
  
  const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
  const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);

  let current = new Date(Date.UTC(startYear, startMonth - 1, startDay));
  const end = new Date(Date.UTC(endYear, endMonth - 1, endDay));

  while (current <= end) {
    const year = current.getUTCFullYear();
    const month = String(current.getUTCMonth() + 1).padStart(2, '0');
    const day = String(startDay).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);

    // Increment 1 month using UTC
    current.setUTCMonth(current.getUTCMonth() + 1);
  }

  return dates;
}
