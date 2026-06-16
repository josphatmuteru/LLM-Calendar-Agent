import { CalendarEvent } from '../types';

export const DEFAULT_EVENTS: CalendarEvent[] = [
  // Events for June 18, 2026
  {
    id: 'e1',
    title: 'Stand up',
    time: '9.00 AM – 10.30 PM',
    date: '2026-06-18',
    color: 'blue'
  },
  {
    id: 'e2',
    title: 'Client call',
    time: '11.00 AM – 12.30 AM',
    date: '2026-06-18',
    color: 'green'
  },
  {
    id: 'e3',
    title: 'Another Activity',
    time: '3.00 AM – 5.30 PM',
    date: '2026-06-18',
    color: 'beige'
  },
  
  // Events for June 13, 2026 (Header default date)
  {
    id: 'e4',
    title: 'Planning Session',
    time: '10.00 AM – 11.30 AM',
    date: '2026-06-13',
    color: 'blue'
  },
  {
    id: 'e5',
    title: 'Review Tasks',
    time: '4.00 PM – 5.00 PM',
    date: '2026-06-13',
    color: 'beige'
  },

  // Events for June 4, 2026
  {
    id: 'e6',
    title: 'Design Sync',
    time: '9.00 AM – 10.30 AM',
    date: '2026-06-04',
    color: 'blue'
  },
  {
    id: 'e7',
    title: 'Coffee Catchup',
    time: '2.00 PM – 3.00 PM',
    date: '2026-06-04',
    color: 'beige'
  },

  // Events for June 11, 2026
  {
    id: 'e8',
    title: 'Product Demo',
    time: '1.00 PM – 2.30 PM',
    date: '2026-06-11',
    color: 'green'
  },

  // Events for June 14, 2026
  {
    id: 'e9',
    title: 'Grocery Run',
    time: '11.00 AM – 12.00 PM',
    date: '2026-06-14',
    color: 'beige'
  },

  // Events for June 20, 2026
  {
    id: 'e10',
    title: 'Weekend Brunch',
    time: '11.30 AM – 1.30 PM',
    date: '2026-06-20',
    color: 'green'
  },

  // Events for June 23, 2026
  {
    id: 'e11',
    title: 'Project Kickoff',
    time: '10.00 AM – 11.30 AM',
    date: '2026-06-23',
    color: 'blue'
  },
  {
    id: 'e12',
    title: 'Dentist Visit',
    time: '3.00 PM – 4.00 PM',
    date: '2026-06-23',
    color: 'beige'
  }
];

// Helper to get days in month for a given year and month (0-indexed)
export function getDaysInMonth(year: number, month: number) {
  // We want to return an array of day objects for the calendar grid
  const date = new Date(year, month, 1);
  const days = [];
  
  // Get day of week for the 1st of the month (0 - Sunday, 1 - Monday, etc.)
  // We want our calendar to start on Monday, so we convert Sunday (0) to 6, Monday (1) to 0, etc.
  let startDay = date.getDay();
  startDay = startDay === 0 ? 6 : startDay - 1; 
  
  // Previous month trailing days
  const tempPrevDate = new Date(year, month, 0);
  const prevMonthTotalDays = tempPrevDate.getDate();
  const prevMonth = tempPrevDate.getMonth();
  const prevYear = tempPrevDate.getFullYear();
  
  for (let i = startDay - 1; i >= 0; i--) {
    const d = prevMonthTotalDays - i;
    days.push({
      dayNumber: d,
      isCurrentMonth: false,
      dateString: `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    });
  }
  
  // Current month days
  const tempCurrDate = new Date(year, month + 1, 0);
  const currentMonthTotalDays = tempCurrDate.getDate();
  
  for (let d = 1; d <= currentMonthTotalDays; d++) {
    days.push({
      dayNumber: d,
      isCurrentMonth: true,
      dateString: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    });
  }
  
  // Next month trailing days to complete the grid (usually 35 or 42 cells)
  const totalCells = days.length > 35 ? 42 : 35;
  const remainingCells = totalCells - days.length;
  const nextMonthDate = new Date(year, month + 1, 1);
  const nextMonth = nextMonthDate.getMonth();
  const nextYear = nextMonthDate.getFullYear();
  
  for (let d = 1; d <= remainingCells; d++) {
    days.push({
      dayNumber: d,
      isCurrentMonth: false,
      dateString: `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    });
  }
  
  return days;
}

export function formatDateLong(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-US', options).replace(',', '');
}

export function getWeekDays(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const current = new Date(year, month - 1, day);
  
  // Find Monday of the current week
  const dayOfWeek = current.getDay();
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(current);
  monday.setDate(current.getDate() + distanceToMonday);
  
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    
    const yStr = d.getFullYear();
    const mStr = String(d.getMonth() + 1).padStart(2, '0');
    const dStr = String(d.getDate()).padStart(2, '0');
    
    weekDays.push({
      name: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i],
      fullName: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i],
      dayNumber: d.getDate(),
      dateString: `${yStr}-${mStr}-${dStr}`
    });
  }
  return weekDays;
}
