import { Task } from '@/lib/sheets/types';

export interface TaskPreset {
  id: string;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  iconName: string;
  tasks: Task[];
}

export const TASK_PRESETS: Record<string, TaskPreset> = {
  TRADITIONAL: {
    id: 'TRADITIONAL',
    name: 'Traditional Wedding',
    tagline: 'Comprehensive Milestone Checklist',
    description: 'Full-featured planner preset for medium-to-large weddings (50-200+ guests). Includes venue, attire, catering, seating, and rehearsal planning.',
    badge: 'Popular',
    iconName: 'Sparkles',
    tasks: [
      {
        taskId: 'T1',
        taskName: 'Confirm Ceremony & Reception Venue Booking',
        kanbanStage: 'In Progress',
        category: 'Venue',
        priority: 'High',
        assignedTo: 'Couple',
        dueDate: '2026-08-15',
        notes: 'Review contract terms, deposit structure, and curfew limits.'
      },
      {
        taskId: 'T2',
        taskName: 'Schedule Bridal & Groom Attire Fittings',
        kanbanStage: 'To Do',
        category: 'Attire',
        priority: 'High',
        assignedTo: 'Bride & Groom',
        dueDate: '2026-09-01',
        notes: 'Book first alteration appointment 3 months prior to wedding date.'
      },
      {
        taskId: 'T3',
        taskName: 'Catering & Menu Tasting',
        kanbanStage: 'To Do',
        category: 'Catering',
        priority: 'Medium',
        assignedTo: 'Couple',
        dueDate: '2026-09-20',
        notes: 'Select appetizers, main entree options, and note allergy alternatives.'
      },
      {
        taskId: 'T4',
        taskName: 'Finalize Guest List & Send Invitations',
        kanbanStage: 'To Do',
        category: 'Guests',
        priority: 'High',
        assignedTo: 'Coordinator',
        dueDate: '2026-10-05',
        notes: 'Track RSVPs and dietary restrictions in Guest Registry.'
      },
      {
        taskId: 'T5',
        taskName: 'Hire Photographer & Videographer',
        kanbanStage: 'Done',
        category: 'Media',
        priority: 'High',
        assignedTo: 'Groom',
        dueDate: '2026-07-10',
        notes: 'Contract signed; shot list provided for ceremony and reception.'
      },
      {
        taskId: 'T6',
        taskName: 'Design Seating Chart & Table Numbers',
        kanbanStage: 'To Do',
        category: 'Decor',
        priority: 'Medium',
        assignedTo: 'Bride',
        dueDate: '2026-10-15',
        notes: 'Group guests by party and family ties.'
      },
      {
        taskId: 'T7',
        taskName: 'Confirm Rehearsal Dinner Booking',
        kanbanStage: 'To Do',
        category: 'Events',
        priority: 'Low',
        assignedTo: 'Couple',
        dueDate: '2026-10-25',
        notes: 'Reserve private dining room for bridal party and immediate family.'
      }
    ]
  },
  MICRO: {
    id: 'MICRO',
    name: 'Micro / Intimate Wedding',
    tagline: 'Streamlined Boutique Checklist',
    description: 'Tailored for boutique gatherings, elopements, or micro-weddings (under 50 guests). Fast and stress-free planning.',
    badge: 'Boutique',
    iconName: 'Heart',
    tasks: [
      {
        taskId: 'T1',
        taskName: 'Reserve Boutique Venue / Private Dining Room',
        kanbanStage: 'In Progress',
        category: 'Venue',
        priority: 'High',
        assignedTo: 'Couple',
        dueDate: '2026-08-10',
        notes: 'Confirm intimate dining space reservation and floral setup policy.'
      },
      {
        taskId: 'T2',
        taskName: 'Obtain Marriage License & Officiant Papers',
        kanbanStage: 'To Do',
        category: 'Legal',
        priority: 'High',
        assignedTo: 'Couple',
        dueDate: '2026-08-30',
        notes: 'Check city hall filing requirements and witness ID requirements.'
      },
      {
        taskId: 'T3',
        taskName: 'Book Documentary Photographer',
        kanbanStage: 'Done',
        category: 'Media',
        priority: 'Medium',
        assignedTo: 'Couple',
        dueDate: '2026-07-01',
        notes: '4-hour coverage package for ceremony and intimate dinner.'
      },
      {
        taskId: 'T4',
        taskName: 'Order Custom Cake or Dessert Tower',
        kanbanStage: 'To Do',
        category: 'Catering',
        priority: 'Medium',
        assignedTo: 'Bride',
        dueDate: '2026-09-10',
        notes: 'Single or 2-tier signature cake with floral accents.'
      },
      {
        taskId: 'T5',
        taskName: 'Send Digital Save The Dates & Invites',
        kanbanStage: 'To Do',
        category: 'Guests',
        priority: 'Medium',
        assignedTo: 'Groom',
        dueDate: '2026-09-15',
        notes: 'Use digital RSVP link for fast headcount.'
      }
    ]
  },
  DESTINATION: {
    id: 'DESTINATION',
    name: 'Destination Wedding',
    tagline: 'Travel & Logistics Focused',
    description: 'Designed for resort, international, or travel-away weddings. Focuses on guest accommodation, travel itineraries, and local vendor contracts.',
    badge: 'Travel',
    iconName: 'Plane',
    tasks: [
      {
        taskId: 'T1',
        taskName: 'Verify Passports & International Legal Filings',
        kanbanStage: 'In Progress',
        category: 'Legal',
        priority: 'High',
        assignedTo: 'Couple',
        dueDate: '2026-07-30',
        notes: 'Ensure passports have at least 6 months validity from travel date.'
      },
      {
        taskId: 'T2',
        taskName: 'Lock In Resort / Hotel Room Block Contract',
        kanbanStage: 'To Do',
        category: 'Lodging',
        priority: 'High',
        assignedTo: 'Couple',
        dueDate: '2026-08-20',
        notes: 'Negotiate discounted group rate and guest airport shuttle transfer.'
      },
      {
        taskId: 'T3',
        taskName: 'Send Destination Welcome Pack & Travel Itinerary',
        kanbanStage: 'To Do',
        category: 'Guests',
        priority: 'High',
        assignedTo: 'Coordinator',
        dueDate: '2026-09-05',
        notes: 'Include flight tips, resort dress code, and local currency info.'
      },
      {
        taskId: 'T4',
        taskName: 'Plan Welcome Cocktail Party & Beach Sunset Dinner',
        kanbanStage: 'To Do',
        category: 'Events',
        priority: 'Medium',
        assignedTo: 'Couple',
        dueDate: '2026-09-25',
        notes: 'Casual pre-wedding drinks to welcome arriving guests.'
      },
      {
        taskId: 'T5',
        taskName: 'Coordinate Local On-Site Resort Floral & DJ',
        kanbanStage: 'To Do',
        category: 'Vendors',
        priority: 'Medium',
        assignedTo: 'Resort Planner',
        dueDate: '2026-10-01',
        notes: 'Review resort in-house vendor catalog and sound permissions.'
      }
    ]
  },
  BLANK: {
    id: 'BLANK',
    name: 'Blank Slate',
    tagline: 'Start From Scratch',
    description: 'Empty task list. Build your custom Kanban checklist from the ground up.',
    badge: 'Custom',
    iconName: 'Edit3',
    tasks: []
  }
};
