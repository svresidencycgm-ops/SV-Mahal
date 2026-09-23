import type { Booking, BookingFinancials } from '../types';

export const invoiceService = {
  // Calculate financials for a hotel room booking
  calculateRoomFinancials(
    checkIn: string,
    checkOut: string,
    roomPrice: number,
    roomCount: number,
    discountAmount: number,
    advancePaid: number,
    billingType: 'GST' | 'Normal' = 'GST',
    extraBedPrice: number = 0
  ): BookingFinancials {
    const sDate = new Date(checkIn);
    const eDate = new Date(checkOut);
    const timeDiff = eDate.getTime() - sDate.getTime();
    
    // Default to at least 1 night if checkOut is somehow equal or before checkIn (safety fallback)
    const nights = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
    
    const subtotal = (roomPrice * roomCount * nights) + extraBedPrice;
    const discount = Math.max(0, Math.min(discountAmount, subtotal));
    const total = subtotal - discount;
    const balanceDue = total - advancePaid;

    let baseAmount = total;
    let cgst = 0;
    let sgst = 0;
    let tax = 0;
    let roundOff = 0;

    if (billingType === 'GST') {
      // 5% GST inclusive calculation for hotel room
      baseAmount = Number((total / 1.05).toFixed(2));
      cgst = Number((baseAmount * 0.025).toFixed(2));
      sgst = Number((baseAmount * 0.025).toFixed(2));
      tax = Number((cgst + sgst).toFixed(2));
      roundOff = Number((total - (baseAmount + cgst + sgst)).toFixed(2));
    }

    return {
      subtotal,
      discount,
      tax,
      total,
      advancePaid,
      balanceDue,
      cgst,
      sgst,
      roundOff,
      baseAmount
    };
  },

  // Calculate financials for a Mahal event booking
  calculateMahalFinancials(
    packagePrice: number,
    decoratorSelected: boolean,
    cateringSelected: boolean,
    guestCount: number,
    discountAmount: number,
    advancePaid: number,
    billingType: 'GST' | 'Normal' = 'GST',
    mahalCharges?: { electricity: number; rooms: number; generator: number; damages: number; other: number }
  ): BookingFinancials {
    // Basic package has hall. Standard adds décor. Premium adds décor + catering.
    // If user customizes via checkboxes, we can calculate additional cost.
    // Let's assume standard extra decor = 30000, and catering = 300 per guest.
    let baseSubtotal = packagePrice;
    
    if (decoratorSelected && packagePrice === 100000) {
      // Basic package didn't include decoration
      baseSubtotal += 30000;
    }
    if (cateringSelected && (packagePrice === 100000 || packagePrice === 150000)) {
      // Basic or Standard packages didn't include catering
      baseSubtotal += Math.round(guestCount * 300);
    }

    // Custom amenities charges
    const electricity = mahalCharges?.electricity || 0;
    const roomsCharge = mahalCharges?.rooms || 0;
    const generator = mahalCharges?.generator || 0;
    const damages = mahalCharges?.damages || 0;
    const other = mahalCharges?.other || 0;

    const subtotal = baseSubtotal + electricity + roomsCharge + generator + damages + other;

    const discount = Math.max(0, Math.min(discountAmount, subtotal));
    const total = subtotal - discount;
    const balanceDue = total - advancePaid;

    let baseAmount = total;
    let cgst = 0;
    let sgst = 0;
    let tax = 0;
    let roundOff = 0;

    if (billingType === 'GST') {
      // 18% GST inclusive calculation for Mahal booking
      baseAmount = Number((total / 1.18).toFixed(2));
      cgst = Number((baseAmount * 0.09).toFixed(2));
      sgst = Number((baseAmount * 0.09).toFixed(2));
      tax = Number((cgst + sgst).toFixed(2));
      roundOff = Number((total - (baseAmount + cgst + sgst)).toFixed(2));
    }

    return {
      subtotal,
      discount,
      tax,
      total,
      advancePaid,
      balanceDue,
      cgst,
      sgst,
      roundOff,
      baseAmount
    };
  },

  // Recalculate outstanding balance on an existing booking based on payment records
  recalculateBalance(booking: Booking, payments: { amount: number }[]): Booking {
    const totalPaid = payments.reduce((sum, pay) => sum + pay.amount, 0);
    const total = booking.financials.total;
    const balanceDue = total - totalPaid;

    let paymentStatus: Booking['paymentStatus'] = 'Unpaid';
    if (totalPaid >= total && total > 0) {
      paymentStatus = 'Paid';
    } else if (totalPaid > 0) {
      paymentStatus = 'Partially Paid';
    } else if (totalPaid < 0) {
      paymentStatus = 'Refunded';
    }

    return {
      ...booking,
      financials: {
        ...booking.financials,
        advancePaid: totalPaid,
        balanceDue: Math.max(0, balanceDue)
      },
      paymentStatus
    };
  }
};
