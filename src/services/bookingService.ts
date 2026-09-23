import type { Booking, Room } from '../types';

export const bookingService = {
  // Helper to parse date string into local midnight Date object for clean comparisons
  parseLocalDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  },

  // Helper to check if two date ranges overlap
  // Range A: [startA, endA)
  // Range B: [startB, endB)
  isOverlapping(startA: string, endA: string, startB: string, endB: string): boolean {
    const sA = this.parseLocalDate(startA).getTime();
    const eA = this.parseLocalDate(endA).getTime();
    const sB = this.parseLocalDate(startB).getTime();
    const eB = this.parseLocalDate(endB).getTime();
    return sA < eB && sB < eA;
  },

  // Generate a unique sequential Booking ID
  generateBookingId(serviceType: 'room' | 'mahal', checkInOrEventDate: string, currentBookings: Booking[]): string {
    const year = checkInOrEventDate.split('-')[0] || '2026';
    const prefix = serviceType === 'room' ? 'ROOM' : 'MAHAL';
    
    // Filter bookings of the same type and year
    const yearPrefix = `${prefix}-${year}-`;
    const relevantIds = currentBookings
      .map(b => b.id)
      .filter(id => id.startsWith(yearPrefix));
      
    let maxSerial = 0;
    relevantIds.forEach(id => {
      const serialPart = id.substring(yearPrefix.length);
      const serial = parseInt(serialPart, 10);
      if (!isNaN(serial) && serial > maxSerial) {
        maxSerial = serial;
      }
    });

    const nextSerial = maxSerial + 1;
    const formattedSerial = String(nextSerial).padStart(4, '0');
    return `${yearPrefix}${formattedSerial}`;
  },

  // Validate Room Availability
  // Returns: { available: boolean, availableRoomIds: string[], error?: string }
  checkRoomAvailability(
    checkIn: string,
    checkOut: string,
    roomType: Room['type'],
    roomCount: number,
    rooms: Room[],
    bookings: Booking[],
    excludeBookingId?: string
  ): { available: boolean; availableRoomIds: string[]; error?: string } {
    
    // Check validation of checkIn and checkOut
    const sDate = this.parseLocalDate(checkIn);
    const eDate = this.parseLocalDate(checkOut);
    if (eDate.getTime() <= sDate.getTime()) {
      return { available: false, availableRoomIds: [], error: 'Check-out date must be after check-in date.' };
    }

    // Filter rooms of specified type
    const candidateRooms = rooms.filter(
      r => r.type === roomType && r.status !== 'Maintenance' && r.status !== 'Blocked'
    );

    if (candidateRooms.length < roomCount) {
      return {
        available: false,
        availableRoomIds: [],
        error: `Insufficient ${roomType} inventory. Total active inventory: ${candidateRooms.length} rooms.`
      };
    }

    // Find all room IDs of this type that are occupied during the range
    const activeBookings = bookings.filter(b => {
      if (b.id === excludeBookingId) return false;
      if (b.serviceType !== 'room') return false;
      if (['Cancelled', 'No-show', 'Checked-out', 'Completed'].includes(b.status)) return false;
      return this.isOverlapping(checkIn, checkOut, b.checkInDate, b.checkOutDate);
    });

    const occupiedRoomIds = new Set<string>();
    activeBookings.forEach(b => {
      b.roomIds?.forEach(id => occupiedRoomIds.add(id));
    });

    // Find rooms that are completely free
    const availableRooms = candidateRooms.filter(r => !occupiedRoomIds.has(r.id));
    const availableRoomIds = availableRooms.map(r => r.id);

    if (availableRoomIds.length < roomCount) {
      return {
        available: false,
        availableRoomIds: [],
        error: `Room availability conflict. Only ${availableRoomIds.length} ${roomType} room(s) available for these dates.`
      };
    }

    // Return the subset of available room IDs (up to requested count)
    return {
      available: true,
      availableRoomIds: availableRoomIds.slice(0, roomCount)
    };
  },

  // Validate Mahal Availability
  // Returns: { available: boolean, error?: string }
  checkMahalAvailability(
    eventDate: string,
    bookings: Booking[],
    excludeBookingId?: string
  ): { available: boolean; error?: string } {
    // Look for active Mahal bookings on the same date
    const conflictingBooking = bookings.find(b => {
      if (b.id === excludeBookingId) return false;
      if (b.serviceType !== 'mahal') return false;
      if (['Cancelled', 'No-show'].includes(b.status)) return false;
      return b.checkInDate === eventDate; // For Mahal, eventDate is stored in checkInDate
    });

    if (conflictingBooking) {
      if (conflictingBooking.status === 'Blocked' || conflictingBooking.status === 'Maintenance') {
        return {
          available: false,
          error: `SV Mahal is unavailable on ${eventDate} due to scheduled maintenance or blocking.`
        };
      }
      return {
        available: false,
        error: `SV Mahal is already booked or pending booking on ${eventDate}.`
      };
    }

    return { available: true };
  },

  // Check if a specific room is booked on a specific date (for calendar displays)
  getRoomStatusOnDate(roomId: string, dateStr: string, bookings: Booking[], roomDefaultStatus: string): string {
    // If the room is globally in maintenance/blocked, respect that
    if (roomDefaultStatus === 'Maintenance') return 'Maintenance';
    if (roomDefaultStatus === 'Blocked') return 'Blocked';

    // Check if there is an active room booking covering this date
    const targetTime = this.parseLocalDate(dateStr).getTime();
    
    const activeBooking = bookings.find(b => {
      if (b.serviceType !== 'room') return false;
      if (!b.roomIds?.includes(roomId)) return false;
      if (['Cancelled', 'No-show', 'Checked-out', 'Completed'].includes(b.status)) return false;
      
      const s = this.parseLocalDate(b.checkInDate).getTime();
      const e = this.parseLocalDate(b.checkOutDate).getTime();
      return targetTime >= s && targetTime < e; // checkOutDate is exclusive for nights calculation
    });

    if (activeBooking) {
      if (activeBooking.status === 'Checked-in') return 'Occupied';
      if (activeBooking.status === 'Confirmed') return 'Reserved';
      return 'Reserved'; // Inquiry/Pending
    }

    return 'Available';
  },

  // Get dynamic room availability counts by room type for a specific date (rolling calendar check)
  getRoomsAvailabilityOnDate(dateStr: string, rooms: Room[], bookings: Booking[]): Record<string, { total: number; booked: number; maintenance: number }> {
    const statusMap: Record<string, { total: number; booked: number; maintenance: number }> = {
      Standard: { total: 0, booked: 0, maintenance: 0 },
      Deluxe: { total: 0, booked: 0, maintenance: 0 },
      Premium: { total: 0, booked: 0, maintenance: 0 },
      'Family Room': { total: 0, booked: 0, maintenance: 0 },
      'Mahal Room': { total: 0, booked: 0, maintenance: 0 }
    };

    rooms.forEach(room => {
      const type = room.type;
      if (!statusMap[type]) return;
      statusMap[type].total += 1;

      if (room.status === 'Maintenance' || room.status === 'Blocked') {
        statusMap[type].maintenance += 1;
      } else {
        const roomStatus = this.getRoomStatusOnDate(room.id, dateStr, bookings, room.status);
        if (roomStatus === 'Occupied' || roomStatus === 'Reserved') {
          statusMap[type].booked += 1;
        } else if (roomStatus === 'Maintenance' || roomStatus === 'Blocked') {
          statusMap[type].maintenance += 1;
        }
      }
    });

    return statusMap;
  }
};
