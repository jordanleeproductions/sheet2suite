export type AgeCategory = 'Adult' | 'Youth' | 'Child' | 'Infant' | 'Vendor';
export type RSVPStatus = 'No Response' | 'Attending' | 'Declined';
export type KanbanStage = 'To Do' | 'In Progress' | 'Done';
export type SongListType = 'Play List' | 'Do Not Play' | 'Special Moment' | 'General' | 'First Dance' | 'Ceremony' | 'Reception';
export type TableShape = 'circle' | 'rectangle';

export interface TableConfig {
  tableId: string;
  tableName: string;
  shape: TableShape;
  capacity: number; // seat count (even number for rectangle)
  includeEndSeats?: boolean; // Default false (off). Put 1 person on head & foot end
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
