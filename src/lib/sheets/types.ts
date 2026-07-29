export type AgeCategory = 'Adult' | 'Youth' | 'Child' | 'Infant' | 'Vendor';
export type RSVPStatus = 'Attending' | 'Declined' | 'Pending' | 'No Response';
export type KanbanStage = 'To Do' | 'In Progress' | 'Done';
export type SongListType = 'Must Play' | 'Play If Time' | 'Banned' | 'Ceremony' | 'Reception' | 'First Dance' | 'Play List' | 'Do Not Play' | 'Special Moment' | 'General';
export type TableShape = 'circle' | 'rectangle' | 'square' | 'Circle' | 'Rectangle' | 'Square';

export interface TableConfig {
  tableId: string;
  tableName: string;
  shape: 'circle' | 'rectangle' | 'square';
  capacity: number; // seat count
  includeEndSeats?: boolean; // Default false (off). Put 1 person on head & foot end
  singleSideSeating?: boolean; // Default false (off). Put all seats on one side
}

export interface DashboardSummary {
  totalBudget: number;
  estimatedCost: number;
  actualCost: number;
  remainingTasks: number;
}

export interface Guest {
  guestId: string;
  firstName: string;
  lastName: string;
  partyGroup: string;
  ageCategory: AgeCategory;
  rsvpStatus: RSVPStatus;
  dietaryRestrictions: string;
  tableAssignment: string;
  emailAddress: string;
  phoneNumber: string;
  mailingAddress: string;
  hasPlusOne?: boolean;
  plusOneName?: string;
  notes?: string;
  seatNumber?: number;
}

export interface BudgetItem {
  itemId: string;
  category: string;
  vendorName: string;
  estimatedCost: number;
  actualCost: number;
  amountPaid: number;
  dueDate: string;
  paymentStatus: string;
  notes?: string;
}

export interface ScheduleEvent {
  startTime: string;
  endTime: string;
  eventMoment: string;
  location: string;
  responsibility: string; // From "Responsibility / Vendors"
  notes: string; // From "Notes / Details"
  eventDate?: string;
  isAfterMidnight?: boolean;
}

export interface Vendor {
  vendorId: string;
  vendorName: string;
  category: string;
  contactName: string;
  emailAddress: string;
  phoneNumber: string;
  totalContractValue: number;
  depositPaid: number;
  balanceOwing: number;
  paymentDueDate: string;
  contractLink: string;
  staffMealsRequired: string; // "Yes" / "No" or text
  notes?: string;
}

export interface Task {
  taskId: string;
  taskName: string;
  kanbanStage: KanbanStage;
  category: string;
  priority: string;
  assignedTo: string;
  dueDate: string;
  notes: string; // From "Notes / Links"
}

export interface Song {
  songId: string;
  title: string;
  artist: string;
  listType: SongListType;
  link: string;
  notes: string;
  priority?: string;
  played?: boolean;
}

export interface WeddingData {
  dashboard: DashboardSummary;
  guests: Guest[];
  budget: BudgetItem[];
  schedule: ScheduleEvent[];
  vendors: Vendor[];
  tasks: Task[];
  music: Song[];
}
