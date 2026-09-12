import ExcelJS from 'exceljs';

export async function generateMasterXlsxBuffer(coupleName: string = 'Alex & Sam'): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sheet2Suite Engine';
  workbook.lastModifiedBy = 'Sheet2Vow';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Tab 1: Dashboard
  const dashboardSheet = workbook.addWorksheet('Dashboard');
  dashboardSheet.columns = [
    { header: '', key: 'colA', width: 5 },
    { header: '', key: 'colB', width: 35 },
    { header: '', key: 'colC', width: 25 },
  ];
  dashboardSheet.getCell('B2').value = coupleName.toLowerCase().includes('wedding') ? `${coupleName} Database` : `${coupleName} Wedding Database`;
  dashboardSheet.getCell('B2').font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF0F172A' } };
  dashboardSheet.getCell('B4').value = 'Total Budget ($USD):';
  dashboardSheet.getCell('C4').value = 35000;
  dashboardSheet.getCell('C4').numFmt = '$#,##0.00';

  // Tab 2: Guest List
  const guestSheet = workbook.addWorksheet('Guest List');
  guestSheet.columns = [
    { header: 'Guest ID', key: 'id', width: 14 },
    { header: 'First Name', key: 'firstName', width: 18 },
    { header: 'Last Name', key: 'lastName', width: 18 },
    { header: 'Party Group', key: 'partyGroup', width: 16 },
    { header: 'Age Category', key: 'ageCategory', width: 14 },
    { header: 'RSVP Status', key: 'rsvpStatus', width: 14 },
    { header: 'Dietary Restrictions', key: 'dietary', width: 22 },
    { header: 'Meal Choice', key: 'mealChoice', width: 20 },
    { header: 'Reception Table', key: 'table', width: 16 },
    { header: 'Ceremony Seating', key: 'ceremonySeating', width: 18 },
    { header: 'Email Address', key: 'email', width: 24 },
    { header: 'Phone Number', key: 'phone', width: 18 },
    { header: 'Mailing Address', key: 'address', width: 28 },
    { header: 'Thanked', key: 'thanked', width: 12 },
  ];
  styleHeaderRow(guestSheet);

  guestSheet.addRow({
    id: 'GUEST-001',
    firstName: 'Jordan',
    lastName: 'Lee',
    partyGroup: 'Family',
    ageCategory: 'Adult',
    rsvpStatus: 'Attending',
    dietary: 'None',
    table: 'Table 1',
    email: 'jordan@example.com',
    phone: '555-0192',
    address: '123 Main St, New York NY',
    thanked: 'FALSE',
  });

  // Tab 3: Budget Ledger
  const budgetSheet = workbook.addWorksheet('Budget Ledger');
  budgetSheet.columns = [
    { header: 'Category ID', key: 'itemId', width: 16 },
    { header: 'Category', key: 'category', width: 22 },
    { header: 'Target Budget', key: 'estCost', width: 18 },
    { header: 'Total Spent', key: 'actCost', width: 18 },
    { header: 'Remaining', key: 'remaining', width: 18 },
    { header: 'Notes', key: 'notes', width: 30 },
  ];
  styleHeaderRow(budgetSheet);

  budgetSheet.addRow({
    itemId: 'B1',
    category: 'Venue & Catering',
    estCost: 18000,
    actCost: { formula: '=IF(ISBLANK(B2), "", SUMIF(EXPENSES!C:C, B2, EXPENSES!D:D))', result: 0 },
    remaining: { formula: '=IF(ISBLANK(B2), "", C2 - D2)', result: 18000 },
    notes: 'Reception ballroom & catering package',
  });
  budgetSheet.addRow({
    itemId: 'B2',
    category: 'Florals & Decor',
    estCost: 3500,
    actCost: { formula: '=IF(ISBLANK(B3), "", SUMIF(EXPENSES!C:C, B3, EXPENSES!D:D))', result: 0 },
    remaining: { formula: '=IF(ISBLANK(B3), "", C3 - D3)', result: 3500 },
    notes: 'Ceremony arch, bouquets & centerpieces',
  });
  budgetSheet.addRow({
    itemId: 'B3',
    category: 'DJ & Music',
    estCost: 2000,
    actCost: { formula: '=IF(ISBLANK(B4), "", SUMIF(EXPENSES!C:C, B4, EXPENSES!D:D))', result: 0 },
    remaining: { formula: '=IF(ISBLANK(B4), "", C4 - D4)', result: 2000 },
    notes: 'Ceremony audio + 4hr reception DJ',
  });

  // Tab 4: Day-Of-Schedule
  const scheduleSheet = workbook.addWorksheet('Day-Of-Schedule');
  scheduleSheet.columns = [
    { header: 'Start Time', key: 'start', width: 14 },
    { header: 'End Time', key: 'end', width: 14 },
    { header: 'Event Moment', key: 'event', width: 26 },
    { header: 'Location', key: 'location', width: 22 },
    { header: 'Responsibility / Vendors', key: 'vendors', width: 26 },
    { header: 'Notes / Details', key: 'notes', width: 30 },
  ];
  styleHeaderRow(scheduleSheet);

  scheduleSheet.addRow({
    start: '14:00',
    end: '15:00',
    event: 'Wedding Ceremony',
    location: 'St. Mary Church',
    vendors: 'Officiant & Quartet',
    notes: 'Guests arrive at 13:30',
  });

  // Tab 5: Vendors
  const vendorSheet = workbook.addWorksheet('Vendors');
  vendorSheet.columns = [
    { header: 'Vendor ID', key: 'id', width: 14 },
    { header: 'Vendor Name', key: 'name', width: 22 },
    { header: 'Category', key: 'category', width: 18 },
    { header: 'Contact Name', key: 'contact', width: 18 },
    { header: 'Email Address', key: 'email', width: 22 },
    { header: 'Phone Number', key: 'phone', width: 16 },
    { header: 'Total Contract Value', key: 'total', width: 18 },
    { header: 'Deposit Paid', key: 'deposit', width: 16 },
    { header: 'Balance Owing', key: 'balance', width: 16 },
    { header: 'Payment Due Date', key: 'dueDate', width: 16 },
    { header: 'Contract Link', key: 'contract', width: 22 },
    { header: 'Staff Meals Required', key: 'meals', width: 18 },
  ];
  styleHeaderRow(vendorSheet);

  // Tab 6: To-Do List
  const taskSheet = workbook.addWorksheet('To-Do List');
  taskSheet.columns = [
    { header: 'Task ID', key: 'id', width: 14 },
    { header: 'Task Name', key: 'name', width: 28 },
    { header: 'Kanban Stage', key: 'stage', width: 16 },
    { header: 'Category', key: 'category', width: 18 },
    { header: 'Priority', key: 'priority', width: 14 },
    { header: 'Assigned To', key: 'assigned', width: 16 },
    { header: 'Due Date', key: 'dueDate', width: 14 },
    { header: 'Notes / Links', key: 'notes', width: 26 },
  ];
  styleHeaderRow(taskSheet);

  // Tab 7: MUSIC
  const musicSheet = workbook.addWorksheet('MUSIC');
  musicSheet.columns = [
    { header: 'Song ID', key: 'id', width: 14 },
    { header: 'Track Title', key: 'title', width: 24 },
    { header: 'Artist', key: 'artist', width: 20 },
    { header: 'Wedding Moment', key: 'moment', width: 20 },
    { header: 'Requested By', key: 'requestedBy', width: 18 },
    { header: 'Do Not Play', key: 'doNotPlay', width: 14 },
    { header: 'Notes', key: 'notes', width: 26 },
  ];
  styleHeaderRow(musicSheet);

  // Tab 8: PHOTOS
  const photoSheet = workbook.addWorksheet('PHOTOS');
  photoSheet.columns = [
    { header: 'Shot ID', key: 'id', width: 14 },
    { header: 'Description', key: 'desc', width: 28 },
    { header: 'Location', key: 'loc', width: 20 },
    { header: 'Shot Time', key: 'time', width: 14 },
    { header: 'Included People', key: 'people', width: 24 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Priority', key: 'priority', width: 14 },
    { header: 'Notes', key: 'notes', width: 24 },
  ];
  styleHeaderRow(photoSheet);

  // Tab 9: GIFT REGISTRY
  const giftSheet = workbook.addWorksheet('GIFT REGISTRY');
  giftSheet.columns = [
    { header: 'Item ID', key: 'id', width: 14 },
    { header: 'Gift Description / Name', key: 'name', width: 26 },
    { header: 'Giver / From', key: 'from', width: 22 },
    { header: 'Category / Store', key: 'store', width: 18 },
    { header: 'Estimated Value / Cash Amount', key: 'amount', width: 22 },
    { header: 'Thank You Sent', key: 'thanked', width: 16 },
    { header: 'Notes', key: 'notes', width: 24 },
  ];
  styleHeaderRow(giftSheet);

  // Tab 10: GUESTBOOK
  const guestbookSheet = workbook.addWorksheet('GUESTBOOK');
  guestbookSheet.columns = [
    { header: 'Entry ID', key: 'entryId', width: 14 },
    { header: 'Date & Time', key: 'submittedAt', width: 22 },
    { header: 'Guest Name', key: 'guestName', width: 20 },
    { header: 'Message / Wishes', key: 'message', width: 36 },
    { header: 'Photo Count', key: 'photoCount', width: 14 },
    { header: 'Photo Links', key: 'photoLinks', width: 30 },
    { header: 'Drive Folder', key: 'driveFolder', width: 22 },
  ];
  styleHeaderRow(guestbookSheet);
  guestbookSheet.addRow({
    entryId: 'GB101',
    submittedAt: 'Sep 12, 2026, 4:30 PM',
    guestName: 'Jessica Martinez',
    message: 'Wishing you both a lifetime of love and laughter! So happy to celebrate with you.',
    photoCount: 3,
    photoLinks: '',
    driveFolder: 'Guest Uploads',
  });

  // Tab 11: Settings
  const settingsSheet = workbook.addWorksheet('Settings');
  settingsSheet.columns = [
    { header: 'Property', key: 'prop', width: 20 },
    { header: 'Value / JSON', key: 'val', width: 45 },
  ];
  styleHeaderRow(settingsSheet);
  settingsSheet.addRow({
    prop: 'CONFIG_JSON',
    val: JSON.stringify({ budget: 35000, weddingName: coupleName }),
  });

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

function styleHeaderRow(sheet: ExcelJS.Worksheet) {
  const headerRow = sheet.getRow(1);
  headerRow.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0B57D0' }, // Google Drive Blue header fill
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'left' };
  headerRow.height = 24;
}
