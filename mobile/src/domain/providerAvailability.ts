export function buildTimeOffEndSlots(timeSlots: string[]): string[] {
  const sortedSlots = [...timeSlots].sort();
  const finalSlot = sortedSlots[sortedSlots.length - 1];

  if (!finalSlot) {
    return [];
  }

  const closingSlot = addHours(finalSlot, 1);
  return sortedSlots.includes(closingSlot)
    ? sortedSlots
    : [...sortedSlots, closingSlot];
}

function addHours(time: string, hours: number): string {
  const [hour = '0', minute = '0'] = time.split(':');
  const nextHour = Number(hour) + hours;

  return `${`${nextHour}`.padStart(2, '0')}:${minute.padStart(2, '0')}`;
}
