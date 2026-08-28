export type AgeCategory = 'Adult' | 'Youth' | 'Child' | 'Infant' | 'Vendor';
export type RSVPStatus = 'Attending' | 'Declined' | 'Pending' | 'No Response';
export type KanbanStage = 'To Do' | 'In Progress' | 'Done';
export type SongListType = 'Must Play' | 'Play If Time' | 'Banned' | 'Ceremony' | 'Reception' | 'First Dance' | 'Play List' | 'Do Not Play' | 'Special Moment' | 'General' | 'Requested Song';
export type TableShape = 'circle' | 'rectangle' | 'square' | 'Circle' | 'Rectangle' | 'Square';
export type PlayStatus = 'Must Play' | 'Play If Time' | 'Banned';

export interface TableConfig {
  tableId: string;
  tableName: string;
  shape: 'circle' | 'rectangle' | 'square';
  capacity: number;
  includeEndSeats?: boolean;
  singleSideSeating?: boolean;
}

export interface DashboardSummary {
  totalBudget: number;
  estimatedCost: number;
  actualCost: number;
  remainingTasks: number;
  weddingDate?: string;
  location?: string;
  currency?: string;
}

export interface Guest {
  guestId: string;
  firstName: string;
  lastName: string;
  partyGroup: string;
  ageCategory: AgeCategory;
  rsvpStatus: RSVPStatus;
  dietaryRestrictions: string;
  mealChoice?: string;
  tableAssignment: string;
  ceremonySeating?: string;
  emailAddress: string;
  phoneNumber: string;
  mailingAddress: string;
  hasPlusOne?: boolean;
  plusOneName?: string;
  notes?: string;
  seatNumber?: number;
  thankedSent?: boolean;
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
  responsibility: string;
  notes: string;
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
  staffMealsRequired: string;
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
  notes: string;
}

export interface Song {
  songId: string;
  title: string;
  artist: string;
  listType: SongListType;
  playStatus?: PlayStatus;
  requestedBy?: string;
  notes?: string;
  approvalStatus?: 'Approved' | 'Pending Approval' | 'Banned' | 'Declined';
  link?: string;
  priority?: string;
  played?: boolean;
}

export interface PhotoShot {
  shotId: string;
  description: string;
  location: string;
  shotTime: string;
  people: string;
  status: 'Pending' | 'Captured' | 'Skipped';
  notes?: string;
  priority?: 'Must Have' | 'Nice To Have';
}

export interface GiftItem {
  giftId: string;
  description: string;
  giverName: string;
  category: string;
  amount: number;
  thankYouSent: boolean;
  notes?: string;
}

export interface ExpenseItem {
  itemId: string;
  description: string;
  category: string;
  amount?: number;
  actualCost: number;
  amountPaid: number;
  purchaseDate: string;
  notes?: string;
}

export interface EnabledModules {
  metrics: boolean;
  guests: boolean;
  menu: boolean;
  tables: boolean;
  budget: boolean;
  schedule: boolean;
  vendors: boolean;
  tasks: boolean;
  music: boolean;
  photos: boolean;
  thanks: boolean;
  print: boolean;
}

export interface WeddingData {
  dashboard: DashboardSummary;
  guests: Guest[];
  budget: BudgetItem[];
  expenses?: ExpenseItem[];
  schedule: ScheduleEvent[];
  vendors: Vendor[];
  tasks: Task[];
  music: Song[];
  photos: PhotoShot[];
  gifts: GiftItem[];
}
