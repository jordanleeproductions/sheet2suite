import { Guest, Table } from './types';

export interface MealChoiceBreakdown {
  meal: string;
  count: number;
  icon?: string;
}

export interface DietaryGuestDetail {
  guestName: string;
  restriction: string;
  mealChoice: string;
  tableName: string;
}

export interface DietaryRestrictionBreakdown {
  restriction: string;
  count: number;
  guests: DietaryGuestDetail[];
}

export interface TableCapacityAlert {
  tableId: string;
  tableName: string;
  assignedCount: number;
  maxCapacity: number;
  status: 'NORMAL' | 'FULL' | 'OVER_CAPACITY';
}

export interface RelationalCateringSummary {
  totalInvited: number;
  attendingCount: number;
  declinedCount: number;
  pendingCount: number;
  mealChoiceBreakdown: MealChoiceBreakdown[];
  dietaryBreakdown: DietaryRestrictionBreakdown[];
  tableCapacityAlerts: TableCapacityAlert[];
  unassignedAttendingGuests: Guest[];
}

/**
 * Computes real-time relational analytics across GuestRegistry and Floorplan Tables
 */
export function calculateRelationalCateringSummary(
  guests: Guest[],
  tables: Table[]
): RelationalCateringSummary {
  let attendingCount = 0;
  let declinedCount = 0;
  let pendingCount = 0;

  const mealMap: Record<string, number> = {};
  const dietaryMap: Record<string, DietaryGuestDetail[]> = {};
  const tableAssignmentCounts: Record<string, number> = {};
  const unassignedAttending: Guest[] = [];

  guests.forEach(guest => {
    const status = (guest.rsvpStatus || '').toLowerCase();

    if (status === 'attending') {
      attendingCount++;

      // Meal choice tracking
      const meal = (guest.mealChoice || '').trim() || 'Unspecified Meal';
      mealMap[meal] = (mealMap[meal] || 0) + 1;

      // Dietary restriction tracking
      const restriction = (guest.dietaryRestrictions || '').trim();
      if (restriction && restriction.toLowerCase() !== 'none' && restriction !== '-') {
        if (!dietaryMap[restriction]) {
          dietaryMap[restriction] = [];
        }
        dietaryMap[restriction].push({
          guestName: `${guest.firstName} ${guest.lastName}`.trim(),
          restriction,
          mealChoice: meal,
          tableName: guest.tableAssignment || 'Unassigned',
        });
      }

      // Table seat tracking
      if (guest.tableAssignment) {
        tableAssignmentCounts[guest.tableAssignment] = (tableAssignmentCounts[guest.tableAssignment] || 0) + 1;
      } else {
        unassignedAttending.push(guest);
      }

    } else if (status === 'declined') {
      declinedCount++;
    } else {
      pendingCount++;
    }
  });

  // Convert Meal Map to Array
  const mealChoiceBreakdown: MealChoiceBreakdown[] = Object.entries(mealMap).map(([meal, count]) => {
    let icon = '🍽️';
    const lower = meal.toLowerCase();
    if (lower.includes('beef') || lower.includes('steak') || lower.includes('filet')) icon = '🥩';
    else if (lower.includes('chicken') || lower.includes('poultry')) icon = '🍗';
    else if (lower.includes('fish') || lower.includes('salmon') || lower.includes('seafood')) icon = '🐟';
    else if (lower.includes('vegan') || lower.includes('veggie') || lower.includes('vegetarian')) icon = '🌱';
    else if (lower.includes('kid') || lower.includes('child') || lower.includes('tender')) icon = '🍟';

    return { meal, count, icon };
  });

  // Convert Dietary Map to Array
  const dietaryBreakdown: DietaryRestrictionBreakdown[] = Object.entries(dietaryMap).map(([restriction, guestsList]) => ({
    restriction,
    count: guestsList.length,
    guests: guestsList,
  }));

  // Compute Table Capacity Status
  const tableCapacityAlerts: TableCapacityAlert[] = tables.map(table => {
    const assignedCount = tableAssignmentCounts[table.tableName] || tableAssignmentCounts[table.tableId] || 0;
    const maxCapacity = table.capacity || 8;

    let status: 'NORMAL' | 'FULL' | 'OVER_CAPACITY' = 'NORMAL';
    if (assignedCount > maxCapacity) {
      status = 'OVER_CAPACITY';
    } else if (assignedCount === maxCapacity && maxCapacity > 0) {
      status = 'FULL';
    }

    return {
      tableId: table.tableId,
      tableName: table.tableName,
      assignedCount,
      maxCapacity,
      status,
    };
  });

  return {
    totalInvited: guests.length,
    attendingCount,
    declinedCount,
    pendingCount,
    mealChoiceBreakdown,
    dietaryBreakdown,
    tableCapacityAlerts,
    unassignedAttendingGuests: unassignedAttending,
  };
}
