import { Guest, BudgetItem, ScheduleEvent, Vendor, Task, PhotoShot, GiftItem, Song, AgeCategory, RSVPStatus, KanbanStage } from './types';

// Dictionaries mapping human-readable sheet headers to camelCase properties
export const GUEST_HEADERS: Record<string, keyof Guest> = {
  'Guest ID': 'guestId',
  'First Name': 'firstName',
  'Last Name': 'lastName',
  'Party Group': 'partyGroup',
  'Age Category': 'ageCategory',
  'RSVP Status': 'rsvpStatus',
  'Dietary Restrictions': 'dietaryRestrictions',
  'Meal Choice': 'mealChoice',
  'Table Assignment': 'tableAssignment',
  'Seat Number': 'seatNumber',
  'Seat': 'seatNumber',
  'Has Plus One': 'hasPlusOne',
  'Plus One Name': 'plusOneName',
  'Email': 'emailAddress',
  'Email Address': 'emailAddress',
  'Phone Number': 'phoneNumber',
  'Phone': 'phoneNumber',
  'Mailing Address': 'mailingAddress',
  'Thanked': 'thankedSent',
  'Notes': 'notes',
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
  'Responsibility': 'responsibility',
  'Notes / Details': 'notes',
  'Notes': 'notes',
  'Is After Midnight': 'isAfterMidnight',
  'After Midnight': 'isAfterMidnight',
};

export const VENDOR_HEADERS: Record<string, keyof Vendor> = {
  'Vendor ID': 'vendorId',
  'Vendor Name': 'vendorName',
  'Category': 'category',
  'Contact Name': 'contactName',
  'Email Address': 'emailAddress',
  'Email': 'emailAddress',
  'Phone Number': 'phoneNumber',
  'Phone': 'phoneNumber',
  'Total Contract Value': 'totalContractValue',
  'Deposit Paid': 'depositPaid',
  'Balance Owing': 'balanceOwing',
  'Payment Due': 'paymentDueDate',
  'Payment Due Date': 'paymentDueDate',
  'Contract Link': 'contractLink',
  'Staff Meals Required': 'staffMealsRequired',
};

export const TASK_HEADERS: Record<string, keyof Task> = {
  'Task ID': 'taskId',
  'Task Name': 'taskName',
  'Status': 'kanbanStage',
  'Kanban Stage': 'kanbanStage',
  'Stage': 'kanbanStage',
  'Category': 'category',
  'Priority': 'priority',
  'Assigned To': 'assignedTo',
  'Due Date': 'dueDate',
  'Notes / Links': 'notes',
  'Notes': 'notes',
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
    const rawThanked = String(obj.thankedSent || '').toLowerCase();
    const rawPlusOne = String(obj.hasPlusOne || '').toLowerCase();
    return {
      guestId: String(obj.guestId || ''),
      firstName: String(obj.firstName || ''),
      lastName: String(obj.lastName || ''),
      partyGroup: String(obj.partyGroup || ''),
      ageCategory,
      rsvpStatus,
      dietaryRestrictions: String(obj.dietaryRestrictions || ''),
      mealChoice: String(obj.mealChoice || ''),
      tableAssignment: String(obj.tableAssignment || ''),
      emailAddress: String(obj.emailAddress || ''),
      phoneNumber: String(obj.phoneNumber || ''),
      mailingAddress: String(obj.mailingAddress || ''),
      seatNumber: obj.seatNumber ? Number(obj.seatNumber) : undefined,
      hasPlusOne: rawPlusOne === 'true' || rawPlusOne === 'yes' || rawPlusOne === '1',
      plusOneName: String(obj.plusOneName || ''),
      thankedSent: rawThanked === 'true' || rawThanked === 'yes' || rawThanked === '1',
      notes: String(obj.notes || ''),
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
    const rawMidnight = String(obj.isAfterMidnight || '').toLowerCase();
    return {
      startTime: String(obj.startTime || ''),
      endTime: String(obj.endTime || ''),
      eventMoment: String(obj.eventMoment || ''),
      location: String(obj.location || ''),
      responsibility: String(obj.responsibility || ''),
      notes: String(obj.notes || ''),
      isAfterMidnight: rawMidnight === 'true' || rawMidnight === 'yes' || rawMidnight === '1',
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
  'Shot Order': 'shotId',
  'Description': 'description',
  'Description or People': 'description',
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
  'Gift ID': 'giftId',
  'Gift Description': 'description',
  'Gift Description / Name': 'description',
  'Guest / Party Name': 'giverName',
  'Giver / From': 'giverName',
  'Gift Type': 'category',
  'Category / Store': 'category',
  'Amount': 'amount',
  'Estimated Value / Cash Amount': 'amount',
  'Thank You Sent': 'thankYouSent',
  'Received Date': 'notes',
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

export const MUSIC_HEADERS: Record<string, keyof Song> = {
  'Song ID': 'songId',
  'Song Title': 'title',
  'Artist': 'artist',
  'Occasion': 'listType',
  'Play Status': 'playStatus',
  'Requested By': 'requestedBy',
  'Notes': 'notes',
  'Approval Status': 'approvalStatus',
  'Link': 'link',
};

export const musicMapper = {
  fromRow(headers: string[], row: any[]): Song {
    const obj = mapRowToObject<Song>(headers, row, MUSIC_HEADERS);
    return {
      songId: String(obj.songId || ''),
      title: String(obj.title || ''),
      artist: String(obj.artist || ''),
      listType: (obj.listType || 'Reception') as any,
      playStatus: (obj.playStatus || 'Must Play') as any,
      requestedBy: String(obj.requestedBy || ''),
      notes: String(obj.notes || ''),
      approvalStatus: (obj.approvalStatus || 'Approved') as any,
      link: String(obj.link || ''),
    };
  },
  toRow(headers: string[], song: Song): any[] {
    return mapObjectToRow(headers, song, MUSIC_HEADERS);
  }
};
