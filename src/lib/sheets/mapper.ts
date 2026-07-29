import { Guest, BudgetItem, ScheduleEvent, Vendor, Task, PhotoShot, GiftItem, AgeCategory, RSVPStatus, KanbanStage } from './types';

// Dictionaries mapping human-readable sheet headers to camelCase properties
export const GUEST_HEADERS: Record<string, keyof Guest> = {
  'Guest ID': 'guestId',
  'First Name': 'firstName',
  'Last Name': 'lastName',
  'Party Group': 'partyGroup',
  'Age Category': 'ageCategory',
  'RSVP Status': 'rsvpStatus',
  'Dietary Restrictions': 'dietaryRestrictions',
  'Table Assignment': 'tableAssignment',
  'Email Address': 'emailAddress',
  'Phone Number': 'phoneNumber',
  'Mailing Address': 'mailingAddress',
  'Thanked': 'thankedSent',
};

export const BUDGET_HEADERS: Record<string, keyof BudgetItem> = {
  'Item ID': 'itemId',
  'Category': 'category',
  'Vendor Name': 'vendorName',
  'Estimated Cost': 'estimatedCost',
  'Actual Cost': 'actualCost',
  'Amount Paid': 'amountPaid',
  'Due Date': 'dueDate',
  'Payment Status': 'paymentStatus',
};

export const SCHEDULE_HEADERS: Record<string, keyof ScheduleEvent> = {
  'Start Time': 'startTime',
  'End Time': 'endTime',
  'Event Moment': 'eventMoment',
  'Location': 'location',
  'Responsibility / Vendors': 'responsibility',
  'Notes / Details': 'notes',
};

export const VENDOR_HEADERS: Record<string, keyof Vendor> = {
  'Vendor ID': 'vendorId',
  'Vendor Name': 'vendorName',
  'Category': 'category',
  'Contact Name': 'contactName',
  'Email Address': 'emailAddress',
  'Phone Number': 'phoneNumber',
  'Total Contract Value': 'totalContractValue',
  'Deposit Paid': 'depositPaid',
  'Balance Owing': 'balanceOwing',
  'Payment Due Date': 'paymentDueDate',
  'Contract Link': 'contractLink',
  'Staff Meals Required': 'staffMealsRequired',
};

export const TASK_HEADERS: Record<string, keyof Task> = {
  'Task ID': 'taskId',
  'Task Name': 'taskName',
  'Kanban Stage': 'kanbanStage',
  'Category': 'category',
  'Priority': 'priority',
  'Assigned To': 'assignedTo',
  'Due Date': 'dueDate',
  'Notes / Links': 'notes',
};

// Generic mapping utilities
export function mapRowToObject<T>(headers: string[], row: any[], mappingDict: Record<string, keyof T>): T {
  const result = {} as any;
  
  headers.forEach((header, index) => {
    const propKey = mappingDict[header];
    if (propKey) {
      const rawValue = row[index] !== undefined ? row[index] : '';
      result[propKey] = rawValue;
    }
  });

  return result as T;
}

export function mapObjectToRow<T>(headers: string[], obj: T, mappingDict: Record<string, keyof T>): any[] {
  const reverseDict: Record<string, string> = {};
  Object.entries(mappingDict).forEach(([header, prop]) => {
    reverseDict[prop as string] = header;
  });

  return headers.map(header => {
    const propKey = mappingDict[header];
    if (propKey) {
      const val = obj[propKey];
      return val !== undefined ? val : '';
    }
    return '';
  });
}

// Concrete Mappers with proper type coercion
export const guestMapper = {
  fromRow(headers: string[], row: any[]): Guest {
    const obj = mapRowToObject<Guest>(headers, row, GUEST_HEADERS);
    // Enforce default string values
    const ageCategory = (obj.ageCategory || 'Adult') as AgeCategory;
    const rsvpStatus = (obj.rsvpStatus || 'No Response') as RSVPStatus;
    return {
      guestId: String(obj.guestId || ''),
      firstName: String(obj.firstName || ''),
      lastName: String(obj.lastName || ''),
      partyGroup: String(obj.partyGroup || ''),
      ageCategory,
      rsvpStatus,
      dietaryRestrictions: String(obj.dietaryRestrictions || ''),
      tableAssignment: String(obj.tableAssignment || ''),
      emailAddress: String(obj.emailAddress || ''),
      phoneNumber: String(obj.phoneNumber || ''),
      mailingAddress: String(obj.mailingAddress || ''),
    };
  },
  toRow(headers: string[], guest: Guest): any[] {
    return mapObjectToRow(headers, guest, GUEST_HEADERS);
  }
};

export const budgetMapper = {
  fromRow(headers: string[], row: any[]): BudgetItem {
    const obj = mapRowToObject<BudgetItem>(headers, row, BUDGET_HEADERS);
    return {
      itemId: String(obj.itemId || ''),
      category: String(obj.category || ''),
      vendorName: String(obj.vendorName || ''),
      estimatedCost: Number(obj.estimatedCost) || 0,
      actualCost: Number(obj.actualCost) || 0,
      amountPaid: Number(obj.amountPaid) || 0,
      dueDate: String(obj.dueDate || ''),
      paymentStatus: String(obj.paymentStatus || ''),
    };
  },
  toRow(headers: string[], item: BudgetItem): any[] {
    return mapObjectToRow(headers, item, BUDGET_HEADERS);
  }
};

export const scheduleMapper = {
  fromRow(headers: string[], row: any[]): ScheduleEvent {
    const obj = mapRowToObject<ScheduleEvent>(headers, row, SCHEDULE_HEADERS);
    return {
      startTime: String(obj.startTime || ''),
      endTime: String(obj.endTime || ''),
      eventMoment: String(obj.eventMoment || ''),
      location: String(obj.location || ''),
      responsibility: String(obj.responsibility || ''),
      notes: String(obj.notes || ''),
    };
  },
  toRow(headers: string[], event: ScheduleEvent): any[] {
    return mapObjectToRow(headers, event, SCHEDULE_HEADERS);
  }
};

export const vendorMapper = {
  fromRow(headers: string[], row: any[]): Vendor {
    const obj = mapRowToObject<Vendor>(headers, row, VENDOR_HEADERS);
    return {
      vendorId: String(obj.vendorId || ''),
      vendorName: String(obj.vendorName || ''),
      category: String(obj.category || ''),
      contactName: String(obj.contactName || ''),
      emailAddress: String(obj.emailAddress || ''),
      phoneNumber: String(obj.phoneNumber || ''),
      totalContractValue: Number(obj.totalContractValue) || 0,
      depositPaid: Number(obj.depositPaid) || 0,
      balanceOwing: Number(obj.balanceOwing) || 0,
      paymentDueDate: String(obj.paymentDueDate || ''),
      contractLink: String(obj.contractLink || ''),
      staffMealsRequired: String(obj.staffMealsRequired || 'No'),
    };
  },
  toRow(headers: string[], vendor: Vendor): any[] {
    return mapObjectToRow(headers, vendor, VENDOR_HEADERS);
  }
};

export const taskMapper = {
  fromRow(headers: string[], row: any[]): Task {
    const obj = mapRowToObject<Task>(headers, row, TASK_HEADERS);
    const kanbanStage = (obj.kanbanStage || 'To Do') as KanbanStage;
    return {
      taskId: String(obj.taskId || ''),
      taskName: String(obj.taskName || ''),
      kanbanStage,
      category: String(obj.category || ''),
      priority: String(obj.priority || 'Medium'),
      assignedTo: String(obj.assignedTo || ''),
      dueDate: String(obj.dueDate || ''),
      notes: String(obj.notes || ''),
    };
  },
  toRow(headers: string[], task: Task): any[] {
    return mapObjectToRow(headers, task, TASK_HEADERS);
  }
};

export const PHOTO_HEADERS: Record<string, keyof PhotoShot> = {
  'Shot ID': 'shotId',
  'Description': 'description',
  'Location': 'location',
  'Shot Time': 'shotTime',
  'Included People': 'people',
  'Status': 'status',
  'Priority': 'priority',
  'Notes': 'notes',
};

export const photoMapper = {
  fromRow(headers: string[], row: any[]): PhotoShot {
    const obj = mapRowToObject<PhotoShot>(headers, row, PHOTO_HEADERS);
    return {
      shotId: String(obj.shotId || ''),
      description: String(obj.description || ''),
      location: String(obj.location || ''),
      shotTime: String(obj.shotTime || ''),
      people: String(obj.people || ''),
      status: (obj.status || 'Pending') as any,
      priority: (obj.priority || 'Must Have') as any,
      notes: String(obj.notes || ''),
    };
  },
  toRow(headers: string[], photo: PhotoShot): any[] {
    return mapObjectToRow(headers, photo, PHOTO_HEADERS);
  }
};

export const GIFT_HEADERS: Record<string, keyof GiftItem> = {
  'Item ID': 'giftId',
  'Gift Description / Name': 'description',
  'Giver / From': 'giverName',
  'Category / Store': 'category',
  'Estimated Value / Cash Amount': 'amount',
  'Thank You Sent': 'thankYouSent',
  'Notes': 'notes',
};

export const giftMapper = {
  fromRow(headers: string[], row: any[]): GiftItem {
    const obj = mapRowToObject<GiftItem>(headers, row, GIFT_HEADERS);
    const rawThanked = String(obj.thankYouSent || '').toLowerCase();
    return {
      giftId: String(obj.giftId || ''),
      description: String(obj.description || ''),
      giverName: String(obj.giverName || ''),
      category: String(obj.category || ''),
      amount: Number(obj.amount) || 0,
      thankYouSent: rawThanked === 'true' || rawThanked === 'yes' || rawThanked === '1',
      notes: String(obj.notes || ''),
    };
  },
  toRow(headers: string[], gift: GiftItem): any[] {
    return mapObjectToRow(headers, {
      ...gift,
      thankYouSent: gift.thankYouSent ? 'TRUE' : 'FALSE' as any
    }, GIFT_HEADERS);
  }
};
