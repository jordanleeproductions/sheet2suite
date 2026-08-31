import { Guest, TableConfig, BudgetItem, ExpenseItem, ScheduleEvent, Vendor, Task, PhotoShot, GiftItem, Song, MenuItem, AgeCategory, RSVPStatus, KanbanStage } from './types';

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
  'Reception Table': 'tableAssignment',
  'Ceremony Seating': 'ceremonySeating',
  'Ceremony Row': 'ceremonySeating',
  'Ceremony Side': 'ceremonySeating',
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

export const EXPENSE_HEADERS: Record<string, keyof ExpenseItem> = {
  'Item ID': 'itemId',
  'Description': 'description',
  'Item Name': 'description',
  'Item Description': 'description',
  'Category': 'category',
  'Amount': 'amount',
  'Actual Cost': 'actualCost',
  'Amount Paid': 'amountPaid',
  'Purchase Date': 'purchaseDate',
  'Date': 'purchaseDate',
  'Notes': 'notes',
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
    const rawRsvp = String(obj.rsvpStatus || '').trim().toLowerCase();
    let rsvpStatus: RSVPStatus = 'No Response';
    if (rawRsvp === 'attending') {
      rsvpStatus = 'Attending';
    } else if (rawRsvp === 'declined') {
      rsvpStatus = 'Declined';
    } else if (rawRsvp === 'pending' || rawRsvp === 'no response') {
      rsvpStatus = 'Pending';
    }
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
      ceremonySeating: String(obj.ceremonySeating || ''),
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

export const expenseMapper = {
  fromRow(headers: string[], row: any[]): ExpenseItem {
    const obj = mapRowToObject<ExpenseItem>(headers, row, EXPENSE_HEADERS);
    const parsedAmount = Number(obj.amount) || Number(obj.actualCost) || Number(obj.amountPaid) || 0;
    return {
      itemId: String(obj.itemId || ''),
      description: String(obj.description || ''),
      category: String(obj.category || ''),
      amount: parsedAmount,
      actualCost: parsedAmount,
      amountPaid: parsedAmount,
      purchaseDate: String(obj.purchaseDate || ''),
      notes: String(obj.notes || ''),
    };
  },
  toRow(headers: string[], item: ExpenseItem): any[] {
    const amt = item.amount ?? item.actualCost ?? item.amountPaid ?? 0;
    const normalizedItem: ExpenseItem = {
      ...item,
      amount: amt,
      actualCost: amt,
      amountPaid: amt,
    };
    return mapObjectToRow(headers, normalizedItem, EXPENSE_HEADERS);
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
    const rawId = String(obj.vendorId || '').trim();
    const vendorName = String(obj.vendorName || '').trim();
    const vendorId = rawId !== '' ? rawId : (vendorName ? `V_${vendorName.toUpperCase().replace(/[^A-Z0-9]/g, '_')}` : '');
    return {
      vendorId,
      vendorName,
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

export const CATERING_HEADERS: Record<string, keyof MenuItem> = {
  'Item ID': 'id',
  'Course Category': 'category',
  'Category': 'category',
  'Course': 'category',
  'Item Name': 'name',
  'Name': 'name',
  'Description': 'description',
  'Is Guest Choice': 'isGuestChoice',
  'Guest Choice': 'isGuestChoice',
  'Vegetarian': 'isVegetarian',
  'Vegan': 'isVegan',
  'Gluten-Free': 'isGlutenFree',
  'Gluten Free': 'isGlutenFree',
  'Nut-Free': 'isNutFree',
  'Nut Free': 'isNutFree',
};

export const cateringMapper = {
  fromRow(headers: string[], row: any[]): MenuItem {
    const obj = mapRowToObject<MenuItem>(headers, row, CATERING_HEADERS);
    const toBool = (val: any, defaultVal = false): boolean => {
      if (typeof val === 'boolean') return val;
      const s = String(val || '').trim().toLowerCase();
      if (s === 'true' || s === 'yes' || s === 'y' || s === '1') return true;
      if (s === 'false' || s === 'no' || s === 'n' || s === '0') return false;
      return defaultVal;
    };

    let cat = String(obj.category || 'entree').trim().toLowerCase();
    if (cat.includes('entree') || cat.includes('main')) cat = 'entree';
    else if (cat.includes('appetizer') || cat.includes('starter')) cat = 'appetizer';
    else if (cat.includes('dessert') || cat.includes('sweet') || cat.includes('cake')) cat = 'dessert';
    else if (cat.includes('late') || cat.includes('snack')) cat = 'late night snack';
    else if (cat.includes('beverage') || cat.includes('drink')) cat = 'beverage';

    return {
      id: String(obj.id || `M${Date.now()}`),
      category: cat,
      name: String(obj.name || ''),
      description: String(obj.description || ''),
      isGuestChoice: toBool(obj.isGuestChoice, true),
      isVegetarian: toBool(obj.isVegetarian, false),
      isVegan: toBool(obj.isVegan, false),
      isGlutenFree: toBool(obj.isGlutenFree, false),
      isNutFree: toBool(obj.isNutFree, false),
    };
  },
  toRow(headers: string[], item: MenuItem): any[] {
    // Format category nicely (e.g. 'Entree', 'Appetizer', 'Dessert')
    const displayCategory = item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : 'Entree';
    const formattedItem = {
      ...item,
      category: displayCategory,
      isGuestChoice: item.isGuestChoice !== false ? 'TRUE' : 'FALSE',
      isVegetarian: item.isVegetarian ? 'TRUE' : 'FALSE',
      isVegan: item.isVegan ? 'TRUE' : 'FALSE',
      isGlutenFree: item.isGlutenFree ? 'TRUE' : 'FALSE',
      isNutFree: item.isNutFree ? 'TRUE' : 'FALSE',
    };
    return mapObjectToRow(headers, formattedItem as any, CATERING_HEADERS);
  }
};

export const TABLES_HEADERS: Record<string, keyof TableConfig> = {
  'Table ID': 'tableId',
  'ID': 'tableId',
  'Table Name': 'tableName',
  'Name': 'tableName',
  'Table Shape': 'shape',
  'Shape': 'shape',
  'Max Seats': 'capacity',
  'Capacity': 'capacity',
  'Seats': 'capacity',
  'Include End Seats': 'includeEndSeats',
  'Single Side Seating': 'singleSideSeating',
};

export const tableMapper = {
  fromRow(headers: string[], row: any[]): TableConfig {
    const obj = mapRowToObject<TableConfig>(headers, row, TABLES_HEADERS);
    const toBool = (val: any, defaultVal = false): boolean => {
      if (typeof val === 'boolean') return val;
      const s = String(val || '').trim().toLowerCase();
      if (s === 'true' || s === 'yes' || s === 'y' || s === '1') return true;
      if (s === 'false' || s === 'no' || s === 'n' || s === '0') return false;
      return defaultVal;
    };

    let shapeStr = String(obj.shape || 'circle').trim().toLowerCase();
    let shape: 'circle' | 'rectangle' | 'square' = 'circle';
    if (shapeStr.includes('rect') || shapeStr.includes('sweetheart') || shapeStr.includes('head') || shapeStr.includes('oval')) {
      shape = 'rectangle';
    } else if (shapeStr.includes('square')) {
      shape = 'square';
    }

    const capacity = parseInt(String(obj.capacity || '8'), 10) || 8;

    return {
      tableId: String(obj.tableId || `table-${Date.now()}`),
      tableName: String(obj.tableName || ''),
      shape,
      capacity,
      includeEndSeats: toBool(obj.includeEndSeats, false),
      singleSideSeating: toBool(obj.singleSideSeating, false),
    };
  },
  toRow(headers: string[], item: TableConfig): any[] {
    let shapeDisplay = 'Circle';
    if (item.shape === 'rectangle') shapeDisplay = 'Rectangle';
    else if (item.shape === 'square') shapeDisplay = 'Square';

    const formattedItem = {
      ...item,
      shape: shapeDisplay,
      capacity: item.capacity,
      includeEndSeats: item.includeEndSeats ? 'TRUE' : 'FALSE',
      singleSideSeating: item.singleSideSeating ? 'TRUE' : 'FALSE',
    };
    return mapObjectToRow(headers, formattedItem as any, TABLES_HEADERS);
  }
};
