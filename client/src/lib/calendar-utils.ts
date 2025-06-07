export interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate: Date;
}

export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const formatGoogleDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatGoogleDate(event.startDate)}/${formatGoogleDate(event.endDate)}`,
    details: event.description || '',
    location: event.location || '',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateOutlookUrl(event: CalendarEvent): string {
  const formatOutlookDate = (date: Date) => {
    return date.toISOString();
  };

  const params = new URLSearchParams({
    subject: event.title,
    startdt: formatOutlookDate(event.startDate),
    enddt: formatOutlookDate(event.endDate),
    body: event.description || '',
    location: event.location || '',
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

export function createCalendarEvent(
  title: string,
  date: string,
  startTime: string,
  endTime: string,
  description?: string,
  location?: string
): CalendarEvent {
  // Add seconds if not present in time format
  const normalizeTime = (time: string) => {
    return time.includes(':') && time.split(':').length === 2 ? `${time}:00` : time;
  };

  const startDate = new Date(`${date}T${normalizeTime(startTime)}`);
  const endDate = new Date(`${date}T${normalizeTime(endTime)}`);

  // Validate dates
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error(`Invalid date/time: ${date} ${startTime}-${endTime}`);
  }

  return {
    title,
    description,
    location,
    startDate,
    endDate,
  };
}
