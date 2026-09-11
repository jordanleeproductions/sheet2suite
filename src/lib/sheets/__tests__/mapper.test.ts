import { guestMapper, budgetMapper, expenseMapper, GUEST_HEADERS, BUDGET_HEADERS } from '../mapper';
import { Guest, BudgetItem, ExpenseItem } from '../types';

export function runTests() {
  console.log('Running Sheet2Vow Mapper Unit Tests...');

  // 1. Test Guest Mapping (Headers to properties)
  const mockGuestHeaders = [
    'Guest ID', 'First Name', 'Last Name', 'Party Group', 
    'Age Category', 'RSVP Status', 'Dietary Restrictions', 
    'Table Assignment', 'Email Address', 'Phone Number', 'Mailing Address'
  ];
  
  const mockGuestRow = [
    'G-123', 'John', 'Doe', 'Groom Friends', 
    'Adult', 'Attending', 'Peanut Allergy', 
    'Table 3', 'john.doe@example.com', '555-4321', '123 Pine St'
  ];

  const guest = guestMapper.fromRow(mockGuestHeaders, mockGuestRow);
  
  // Assertions
  if (guest.guestId !== 'G-123') throw new Error('Guest ID mapping failed');
  if (guest.firstName !== 'John') throw new Error('First Name mapping failed');
  if (guest.lastName !== 'Doe') throw new Error('Last Name mapping failed');
  if (guest.rsvpStatus !== 'Attending') throw new Error('RSVP Status mapping failed');
  if (guest.dietaryRestrictions !== 'Peanut Allergy') throw new Error('Dietary restrictions mapping failed');
  
  // Test Guest Mapping back to Row
  const outputGuestRow = guestMapper.toRow(mockGuestHeaders, guest);
  if (outputGuestRow[0] !== 'G-123') throw new Error('Guest back-to-row mapping failed at Guest ID');
  if (outputGuestRow[5] !== 'Attending') throw new Error('Guest back-to-row mapping failed at RSVP Status');

  // 2. Test Budget Ledger Mapping & Coercion
  const mockBudgetHeaders = [
    'Item ID', 'Category', 'Vendor Name', 
    'Estimated Cost', 'Actual Cost', 'Amount Paid', 
    'Due Date', 'Payment Status'
  ];

  const mockBudgetRow = [
    'B-999', 'Venue', 'Sunset Hall', 
    '15000', '15500', '5000', 
    '2026-08-01', 'Pending'
  ];

  const budgetItem = budgetMapper.fromRow(mockBudgetHeaders, mockBudgetRow);

  // Assertions with numeric conversion verification
  if (budgetItem.itemId !== 'B-999') throw new Error('Budget Item ID mapping failed');
  if (budgetItem.estimatedCost !== 15000) throw new Error('Estimated cost number parsing failed');
  if (budgetItem.actualCost !== 15500) throw new Error('Actual cost number parsing failed');
  if (budgetItem.amountPaid !== 5000) throw new Error('Amount paid number parsing failed');
  if (budgetItem.paymentStatus !== 'Pending') throw new Error('Payment status mapping failed');

  // Test Budget back to Row
  const outputBudgetRow = budgetMapper.toRow(mockBudgetHeaders, budgetItem);
  if (outputBudgetRow[0] !== 'B-999') throw new Error('Budget back-to-row failed at Item ID');
  if (outputBudgetRow[3] !== 15000) throw new Error('Budget back-to-row failed at Estimated Cost');

  // 2b. Test Modernized 6-Column Category Budget Mapping & Formulas
  const modernBudgetHeaders = ['Category ID', 'Category', 'Target Budget', 'Total Spent', 'Remaining', 'Notes'];
  const modernBudgetRow = ['B1', 'Florals & Decor', '3500', '1200', '2300', 'Arch & centerpieces'];
  const modernParsed = budgetMapper.fromRow(modernBudgetHeaders, modernBudgetRow);
  if (modernParsed.itemId !== 'B1') throw new Error('Modern Budget Category ID mapping failed');
  if (modernParsed.estimatedCost !== 3500) throw new Error('Modern Budget Target Budget parsing failed');
  if (modernParsed.actualCost !== 1200) throw new Error('Modern Budget Total Spent parsing failed');
  if (modernParsed.amountPaid !== 2300) throw new Error('Modern Budget Remaining parsing failed');
  if (modernParsed.notes !== 'Arch & centerpieces') throw new Error('Modern Budget Notes mapping failed');

  const modernOutputRow = budgetMapper.toRow(modernBudgetHeaders, modernParsed, 2);
  if (modernOutputRow[0] !== 'B1') throw new Error('Modern back-to-row failed at Category ID');
  if (modernOutputRow[2] !== 3500) throw new Error('Modern back-to-row failed at Target Budget');
  if (!String(modernOutputRow[3]).includes('SUMIF(EXPENSES!C:C, B2')) throw new Error('Modern back-to-row failed to generate Total Spent formula');
  if (!String(modernOutputRow[4]).includes('C2 - D2')) throw new Error('Modern back-to-row failed to generate Remaining formula');

  // 2c. Test Currency Formatted Strings & Case-Insensitive Header Mapping
  const formattedBudgetHeaders = [' category id ', 'CATEGORY', 'Target Budget', 'Total Spent', 'Remaining', 'Notes'];
  const formattedBudgetRow = ['B2', 'Photography', '$15,000.00', '£3,500.50', '$ 11,499.50', 'Main photographer package'];
  const formattedParsed = budgetMapper.fromRow(formattedBudgetHeaders, formattedBudgetRow);
  if (formattedParsed.itemId !== 'B2') throw new Error('Formatted Budget Category ID mapping failed');
  if (formattedParsed.estimatedCost !== 15000) throw new Error('Formatted $15,000.00 string parsing failed');
  if (formattedParsed.actualCost !== 3500.5) throw new Error('Formatted £3,500.50 string parsing failed');
  if (formattedParsed.amountPaid !== 11499.5) throw new Error('Formatted $ 11,499.50 string parsing failed');

  // 3. Test Expense Mapping & Date Serial Parsing (Google Sheets numeric serials)
  const mockExpenseHeaders = [
    'Expense ID', 'Description', 'Category', 'Amount', 'Actual Cost', 'Amount Paid', 'Purchase Date', 'Notes'
  ];
  const mockExpenseRowWithNumericSerial = [
    'EXP-001', 'Florist deposit', 'Florals & Decor', '140', '140', '140', 46276, 'Deposit payment'
  ];
  const expenseItem = expenseMapper.fromRow(mockExpenseHeaders, mockExpenseRowWithNumericSerial);
  if (expenseItem.itemId !== 'EXP-001') throw new Error('Expense ID mapping failed');
  if (expenseItem.purchaseDate !== '2026-09-11') throw new Error(`Expense purchase date serial conversion failed: expected 2026-09-11, got ${expenseItem.purchaseDate}`);

  // Test String Serial conversion
  const mockExpenseRowWithStringSerial = [
    'EXP-002', 'Cake tasting', 'Cake & Desserts', '75', '75', '75', '46274', 'Tasting fee'
  ];
  const expenseItem2 = expenseMapper.fromRow(mockExpenseHeaders, mockExpenseRowWithStringSerial);
  if (expenseItem2.purchaseDate !== '2026-09-09') throw new Error(`Expense purchase date string serial conversion failed: expected 2026-09-09, got ${expenseItem2.purchaseDate}`);

  // Test toRow outputs formatted YYYY-MM-DD
  const outputExpenseRow = expenseMapper.toRow(mockExpenseHeaders, expenseItem);
  if (outputExpenseRow[6] !== '2026-09-11') throw new Error(`Expense back-to-row date failed: expected 2026-09-11, got ${outputExpenseRow[6]}`);

  console.log('✓ All Sheet2Vow Mapper Unit Tests Passed Successfully.');
}

runTests();

