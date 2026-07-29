import { WeddingData } from './types';

export let mockWeddingName = 'Our Wedding';

export const ALL_DEFAULT_TASKS = [
  { taskId: 'T1', taskName: 'Finalize Guest Seating Chart', kanbanStage: 'In Progress' as const, category: 'Guests', priority: 'High', assignedTo: 'Sarah', dueDate: '2026-08-15', notes: 'Wait for RSVPs before final assignments.' },
  { taskId: 'T2', taskName: 'Approve Catering Menu', kanbanStage: 'Done' as const, category: 'Catering', priority: 'High', assignedTo: 'John & Sarah', dueDate: '2026-07-10', notes: 'Tasting completed. Pork belly & Sea bass selected.' },
  { taskId: 'T3', taskName: 'Purchase Groomsmen Suits', kanbanStage: 'To Do' as const, category: 'Attire', priority: 'Medium', assignedTo: 'John', dueDate: '2026-07-30', notes: 'Fittings scheduled for next Saturday.' },
  { taskId: 'T4', taskName: 'Submit Marriage License App', kanbanStage: 'To Do' as const, category: 'Legal', priority: 'High', assignedTo: 'John & Sarah', dueDate: '2026-08-01', notes: 'Need to bring certified birth certificates.' },
  { taskId: 'T5', taskName: 'Order Wedding Cake', kanbanStage: 'In Progress' as const, category: 'Catering', priority: 'Medium', assignedTo: 'Sarah', dueDate: '2026-08-10', notes: '3-tier vanilla almond cake with gold foil details.' },
  { taskId: 'T6', taskName: 'Book Wedding Night Suite', kanbanStage: 'Done' as const, category: 'Venue', priority: 'Low', assignedTo: 'John', dueDate: '2026-06-01', notes: 'Booked at Plaza Suite. Late checkout confirmed.' },
  { taskId: 'T7', taskName: 'Write Wedding Vows', kanbanStage: 'To Do' as const, category: 'Personal', priority: 'Medium', assignedTo: 'John & Sarah', dueDate: '2026-09-01', notes: 'Write in personal vows notebooks.' },
  { taskId: 'T8', taskName: 'Confirm Song Lists with DJ', kanbanStage: 'To Do' as const, category: 'Music', priority: 'Low', assignedTo: 'John', dueDate: '2026-09-05', notes: 'Submit do-not-play list.' },
];

export let mockDatabase: WeddingData = {
  dashboard: {
    totalBudget: 35000,
    estimatedCost: 32700,
    actualCost: 14200,
    remainingTasks: 4
  },
  guests: [
    { guestId: 'G1', firstName: 'Sarah', lastName: 'Connor', partyGroup: 'Bride Family', ageCategory: 'Adult', rsvpStatus: 'Attending', dietaryRestrictions: 'Gluten Free', tableAssignment: 'Table 1 - Head Table', emailAddress: 'sarah.c@example.com', phoneNumber: '555-0199', mailingAddress: '123 Main St, LA' },
    { guestId: 'G2', firstName: 'John', lastName: 'Connor', partyGroup: 'Bride Family', ageCategory: 'Adult', rsvpStatus: 'Attending', dietaryRestrictions: 'None', tableAssignment: 'Table 1 - Head Table', emailAddress: 'john.c@example.com', phoneNumber: '555-0120', mailingAddress: '123 Main St, LA' },
    { guestId: 'G3', firstName: 'Marcus', lastName: 'Wright', partyGroup: 'Groom Friends', ageCategory: 'Adult', rsvpStatus: 'Attending', dietaryRestrictions: 'Vegan', tableAssignment: 'Table 2 - Family VIP', emailAddress: 'marcus@example.com', phoneNumber: '555-0143', mailingAddress: '456 Oak Rd, Chicago' },
    { guestId: 'G4', firstName: 'Kate', lastName: 'Brewster', partyGroup: 'Groom Family', ageCategory: 'Adult', rsvpStatus: 'Attending', dietaryRestrictions: 'None', tableAssignment: 'Table 2 - Family VIP', emailAddress: 'kate@example.com', phoneNumber: '555-0187', mailingAddress: '789 Pine Ave, Seattle' },
    { guestId: 'G5', firstName: 'Tim', lastName: 'Brewster', partyGroup: 'Groom Family', ageCategory: 'Child', rsvpStatus: 'Attending', dietaryRestrictions: 'Nut Allergy', tableAssignment: 'Unassigned', emailAddress: 'tim@example.com', phoneNumber: '555-0188', mailingAddress: '789 Pine Ave, Seattle' },
    { guestId: 'G6', firstName: 'Danny', lastName: 'Dyson', partyGroup: 'Bride Friends', ageCategory: 'Adult', rsvpStatus: 'Attending', dietaryRestrictions: 'None', tableAssignment: 'Unassigned', emailAddress: 'danny@example.com', phoneNumber: '555-0155', mailingAddress: '321 Elm Blvd, Austin' },
    { guestId: 'G7', firstName: 'Miles', lastName: 'Dyson', partyGroup: 'Bride Friends', ageCategory: 'Adult', rsvpStatus: 'Attending', dietaryRestrictions: 'Dairy Free', tableAssignment: 'Unassigned', emailAddress: 'miles@example.com', phoneNumber: '555-0154', mailingAddress: '321 Elm Blvd, Austin' },
    { guestId: 'G8', firstName: 'Elena', lastName: 'Rostova', partyGroup: 'Bride Family', ageCategory: 'Adult', rsvpStatus: 'Attending', dietaryRestrictions: 'Vegetarian', tableAssignment: 'Unassigned', emailAddress: 'elena@example.com', phoneNumber: '555-0112', mailingAddress: '55 Maple St, Boston' },
    { guestId: 'G9', firstName: 'Viktor', lastName: 'Rostov', partyGroup: 'Bride Family', ageCategory: 'Adult', rsvpStatus: 'Attending', dietaryRestrictions: 'None', tableAssignment: 'Unassigned', emailAddress: 'viktor@example.com', phoneNumber: '555-0113', mailingAddress: '55 Maple St, Boston' },
    { guestId: 'G10', firstName: 'James', lastName: 'Vance', partyGroup: 'Groom Friends', ageCategory: 'Adult', rsvpStatus: 'Attending', dietaryRestrictions: 'None', tableAssignment: 'Unassigned', emailAddress: 'james@example.com', phoneNumber: '555-0210', mailingAddress: '88 River Rd, Denver' },
    { guestId: 'G11', firstName: 'Chloe', lastName: 'Vance', partyGroup: 'Groom Friends', ageCategory: 'Adult', rsvpStatus: 'Attending', dietaryRestrictions: 'Gluten Free', tableAssignment: 'Unassigned', emailAddress: 'chloe@example.com', phoneNumber: '555-0211', mailingAddress: '88 River Rd, Denver' },
    { guestId: 'G12', firstName: 'Liam', lastName: 'Gallagher', partyGroup: 'Bridal Party', ageCategory: 'Adult', rsvpStatus: 'Attending', dietaryRestrictions: 'None', tableAssignment: 'Unassigned', emailAddress: 'liam@example.com', phoneNumber: '555-0301', mailingAddress: '14 High St, London' },
    { guestId: 'G13', firstName: 'Maya', lastName: 'Lin', partyGroup: 'Bridal Party', ageCategory: 'Adult', rsvpStatus: 'Attending', dietaryRestrictions: 'Shellfish Allergy', tableAssignment: 'Unassigned', emailAddress: 'maya@example.com', phoneNumber: '555-0302', mailingAddress: '900 Broadway, NY' },
    { guestId: 'G14', firstName: 'Noah', lastName: 'Centineo', partyGroup: 'Groom Friends', ageCategory: 'Adult', rsvpStatus: 'Attending', dietaryRestrictions: 'None', tableAssignment: 'Unassigned', emailAddress: 'noah@example.com', phoneNumber: '555-0411', mailingAddress: '12 Palm Way, Miami' },
    { guestId: 'G15', firstName: 'Sophia', lastName: 'Turner', partyGroup: 'Bride Friends', ageCategory: 'Adult', rsvpStatus: 'Attending', dietaryRestrictions: 'Vegan', tableAssignment: 'Unassigned', emailAddress: 'sophia@example.com', phoneNumber: '555-0520', mailingAddress: '33 Sunset Blvd, LA' },
    { guestId: 'G16', firstName: 'David', lastName: 'Kim', partyGroup: 'Groom Family', ageCategory: 'Adult', rsvpStatus: 'Attending', dietaryRestrictions: 'None', tableAssignment: 'Unassigned', emailAddress: 'david.k@example.com', phoneNumber: '555-0612', mailingAddress: '77 Ocean Ave, SF' },
    { guestId: 'G17', firstName: 'Hannah', lastName: 'Kim', partyGroup: 'Groom Family', ageCategory: 'Adult', rsvpStatus: 'Attending', dietaryRestrictions: 'Kosher', tableAssignment: 'Unassigned', emailAddress: 'hannah.k@example.com', phoneNumber: '555-0613', mailingAddress: '77 Ocean Ave, SF' },
    { guestId: 'G18', firstName: 'Oliver', lastName: 'Smith', partyGroup: 'Bride Friends', ageCategory: 'Child', rsvpStatus: 'Attending', dietaryRestrictions: 'Nut Allergy', tableAssignment: 'Unassigned', emailAddress: 'oliver@example.com', phoneNumber: '555-0714', mailingAddress: '40 Park Row, NY' },
    { guestId: 'G19', firstName: 'Isabella', lastName: 'Rossi', partyGroup: 'Groom Friends', ageCategory: 'Adult', rsvpStatus: 'Attending', dietaryRestrictions: 'Pescetarian', tableAssignment: 'Unassigned', emailAddress: 'isabella@example.com', phoneNumber: '555-0815', mailingAddress: '20 Roma St, Chicago' },
    { guestId: 'G20', firstName: 'Lucas', lastName: 'Silva', partyGroup: 'Bride Family', ageCategory: 'Adult', rsvpStatus: 'Attending', dietaryRestrictions: 'None', tableAssignment: 'Unassigned', emailAddress: 'lucas@example.com', phoneNumber: '555-0916', mailingAddress: '15 Rio Way, Orlando' }
  ],
  budget: [
    { itemId: 'B1', category: 'Venue', vendorName: 'Grand Plaza Hall', estimatedCost: 15000, actualCost: 15000, amountPaid: 5000, dueDate: '2026-08-01', paymentStatus: 'Pending' },
    { itemId: 'B2', category: 'Catering', vendorName: 'Gourmet Delights', estimatedCost: 8000, actualCost: 7500, amountPaid: 7500, dueDate: '2026-07-15', paymentStatus: 'Paid' },
    { itemId: 'B3', category: 'Photography', vendorName: 'Golden Hour Photo', estimatedCost: 3500, actualCost: 3500, amountPaid: 1750, dueDate: '2026-09-10', paymentStatus: 'Pending' },
    { itemId: 'B4', category: 'Attire', vendorName: 'Vows & Veils Boutique', estimatedCost: 2500, actualCost: 2800, amountPaid: 2800, dueDate: '2026-05-20', paymentStatus: 'Paid' },
    { itemId: 'B5', category: 'Florals', vendorName: 'Bloom & Petal', estimatedCost: 2000, actualCost: 2200, amountPaid: 0, dueDate: '2026-10-01', paymentStatus: 'Pending' },
    { itemId: 'B6', category: 'Music/DJ', vendorName: 'BeatDrop Entertainment', estimatedCost: 1700, actualCost: 1700, amountPaid: 1700, dueDate: '2026-07-01', paymentStatus: 'Paid' },
  ],
  schedule: [
    { startTime: '08:00 AM', endTime: '10:00 AM', eventMoment: 'Hair & Makeup Styling', location: 'Bridal Suite', responsibility: 'Glam Team (Vows & Veils)', notes: 'Bride & Bridesmaids need to start on time. Mimosas and fruit platter served.' },
    { startTime: '11:00 AM', endTime: '12:00 PM', eventMoment: 'Groom Prep & Portraits', location: 'Hotel Lounge', responsibility: 'Groom, Groomsmen, Photographer', notes: 'Detail shots of rings, watch, and suit.' },
    { startTime: '01:30 PM', endTime: '02:30 PM', eventMoment: 'First Look & Couple Portraits', location: 'Garden Path', responsibility: 'Photographer, Planner', notes: 'Keep guests away. Sunset point backup if rain.' },
    { startTime: '04:00 PM', endTime: '04:30 PM', eventMoment: 'Ceremony Service', location: 'Courtyard Lawn', responsibility: 'Officiant, Musicians', notes: 'Live harp starts playing at 3:30 PM as guests sit.' },
    { startTime: '05:00 PM', endTime: '06:00 PM', eventMoment: 'Cocktail Hour', location: 'West Terrace', responsibility: 'Caterer, Bartenders', notes: 'Open bar, 4 tray-passed hors d\'oeuvres. Family photos taken.' },
    { startTime: '06:30 PM', endTime: '10:00 PM', eventMoment: 'Reception & Dinner', location: 'Grand Ballroom', responsibility: 'DJ, Caterer, MC', notes: 'First dance at 6:45 PM. Cake cutting at 8:30 PM.' },
    { startTime: '01:00 AM', endTime: '01:30 AM', eventMoment: 'After-Party Shuttle Departure', location: 'Main Entrance', responsibility: 'Transportation Driver', notes: 'Final shuttle taking guests to hotel suite.', isAfterMidnight: true, eventDate: 'Next Day (+1)' },
  ],
  vendors: [
    { vendorId: 'V1', vendorName: 'Grand Plaza Hall', category: 'Venue', contactName: 'Evelyn Bennett', emailAddress: 'evelyn@grandplaza.com', phoneNumber: '555-9081', totalContractValue: 15000, depositPaid: 5000, balanceOwing: 10000, paymentDueDate: '2026-08-01', contractLink: 'https://example.com/contracts/venue.pdf', staffMealsRequired: 'No' },
    { vendorId: 'V2', vendorName: 'Gourmet Delights', category: 'Catering', contactName: 'Chef Robert', emailAddress: 'robert@gourmetdelights.net', phoneNumber: '555-2241', totalContractValue: 7500, depositPaid: 7500, balanceOwing: 0, paymentDueDate: '2026-07-15', contractLink: 'https://example.com/contracts/catering.pdf', staffMealsRequired: 'Yes' },
    { vendorId: 'V3', vendorName: 'Golden Hour Photo', category: 'Photography', contactName: 'Mark Vance', emailAddress: 'mark@goldenhour.com', phoneNumber: '555-7033', totalContractValue: 3500, depositPaid: 1750, balanceOwing: 1750, paymentDueDate: '2026-09-10', contractLink: 'https://example.com/contracts/photo.pdf', staffMealsRequired: 'Yes' },
    { vendorId: 'V4', vendorName: 'Bloom & Petal', category: 'Florals', contactName: 'Jessica Rose', emailAddress: 'jessica@bloompetal.com', phoneNumber: '555-1294', totalContractValue: 2200, depositPaid: 0, balanceOwing: 2200, paymentDueDate: '2026-10-01', contractLink: 'https://example.com/contracts/florals.pdf', staffMealsRequired: 'No' },
    { vendorId: 'V5', vendorName: 'BeatDrop Entertainment', category: 'Music/DJ', contactName: 'DJ Spark', emailAddress: 'spark@beatdrop.fm', phoneNumber: '555-8832', totalContractValue: 1700, depositPaid: 1700, balanceOwing: 0, paymentDueDate: '2026-07-01', contractLink: 'https://example.com/contracts/dj.pdf', staffMealsRequired: 'Yes' },
  ],
  tasks: ALL_DEFAULT_TASKS,
  music: [
    { songId: 'M1', title: 'Perfect', artist: 'Ed Sheeran', listType: 'First Dance', link: 'https://open.spotify.com/track/0tgVpDi06FyKpA1z0VMD4v', notes: 'First Dance', priority: 'Must Play', played: false },
    { songId: 'M2', title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', listType: 'Must Play', link: 'https://open.spotify.com/track/32OlwWuMpZ6b0aN2RZOeMS', notes: 'Get people on the dance floor', priority: 'Must Play', played: false },
    { songId: 'M3', title: 'Macarena', artist: 'Los Del Rio', listType: 'Banned', link: '', notes: 'Absolutely NO', priority: 'Banned', played: false },
    { songId: 'M4', title: 'September', artist: 'Earth, Wind & Fire', listType: 'Must Play', link: 'https://open.spotify.com/track/2tJulUYLDKOg9XrtVkMgcJ', notes: 'Classic', priority: 'Must Play', played: false },
    { songId: 'M5', title: 'Chicken Dance', artist: 'The Emeralds', listType: 'Banned', link: '', notes: 'Never play this', priority: 'Banned', played: false },
  ],
  photos: [
    { shotId: 'P1', description: 'Bride & Groom First Look', location: 'Garden Path', shotTime: '01:30 PM', people: 'Bride, Groom', status: 'Captured', priority: 'Must Have', notes: 'Natural outdoor lighting' },
    { shotId: 'P2', description: 'Bridal Party Group Shot', location: 'Courtyard Lawn', shotTime: '03:00 PM', people: 'Full Bridal Party', status: 'Pending', priority: 'Must Have', notes: 'Groom & Groomsmen on Left, Bride & Bridesmaids on Right' },
    { shotId: 'P3', description: 'Bride with Grandparents', location: 'Bridal Suite', shotTime: '11:30 AM', people: 'Bride, Grandma Mary, Grandpa Joe', status: 'Captured', priority: 'Must Have', notes: 'Seated portrait with bouquet' },
    { shotId: 'P4', description: 'Rings & Invitation Suite Detail', location: 'Hotel Suite', shotTime: '09:00 AM', people: 'Flatlay Details', status: 'Captured', priority: 'Nice To Have', notes: 'Use silk ribbon & fresh flower petals' },
    { shotId: 'P5', description: 'Groom & Groomsmen Toast', location: 'Groom Lounge', shotTime: '11:45 AM', people: 'Groom & Groomsmen', status: 'Pending', priority: 'Nice To Have', notes: 'Whiskey glasses raised' },
    { shotId: 'P6', description: 'First Dance Golden Hour Shot', location: 'Grand Ballroom', shotTime: '06:45 PM', people: 'Bride & Groom', status: 'Pending', priority: 'Must Have', notes: 'Warm ambient lighting & sparkler effect' },
  ],
  gifts: [
    { giftId: 'G1', description: 'KitchenAid Artisan Stand Mixer (Pistachio)', giverName: 'Uncle Bob & Aunt Sarah', category: 'Kitchen & Dining', amount: 450, thankYouSent: true, notes: 'Shipped directly via Williams Sonoma' },
    { giftId: 'G2', description: '$250 Honeymoon Fund Contribution', giverName: 'Marcus & Jessica Vance', category: 'Cash / Honeyfund', amount: 250, thankYouSent: true, notes: 'Venmo transfer for Amalfi Coast dinner' },
    { giftId: 'G3', description: 'Le Creuset Enameled Cast Iron Dutch Oven (5.5 qt)', giverName: 'Grandma Mary & Grandpa Joe', category: 'Kitchen & Dining', amount: 420, thankYouSent: false, notes: 'Delivered to home address' },
    { giftId: 'G4', description: 'Dyson V15 Detect Cordless Vacuum', giverName: 'David & Emily Miller', category: 'Home Appliances', amount: 750, thankYouSent: false, notes: 'Target wedding registry' },
    { giftId: 'G5', description: 'Egyptian Cotton Sheet Set (King)', giverName: 'Rachel Green', category: 'Bed & Bath', amount: 180, thankYouSent: false, notes: 'Crate & Barrel registry' },
  ]
};

export function setMockWeddingName(name: string) {
  mockWeddingName = name;
}

export function updateMockDatabase(weddingName: string, budget: number, selectedTaskNames: string[]) {
  mockWeddingName = weddingName;
  mockDatabase.dashboard.totalBudget = budget;
  mockDatabase.tasks = ALL_DEFAULT_TASKS.filter(task => selectedTaskNames.includes(task.taskName));
  mockDatabase.dashboard.remainingTasks = mockDatabase.tasks.filter(t => t.kanbanStage !== 'Done').length;
}
