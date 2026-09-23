export interface ContactDetail {
  raw: string;
  international: string;
  display: string;
  label: string;
  whatsappLink: string;
  telLink: string;
}

export const CONTACT_INFO = {
  phone1: {
    raw: '9500821550',
    international: '+919500821550',
    display: '+91 95008 21550',
    label: 'Manager Desk',
    whatsappLink: 'https://wa.me/919500821550?text=Hello%20SV%20Mahal%20%26%20Residency%2C%20I%20would%20like%20to%20inquire%20about%20booking%20and%20availability.',
    telLink: 'tel:+919500821550'
  },
  phone2: {
    raw: '9043780215',
    international: '+919043780215',
    display: '+91 90437 80215',
    label: 'Reservations & Support',
    whatsappLink: 'https://wa.me/919043780215?text=Hello%20SV%20Mahal%20%26%20Residency%2C%20I%20would%20like%20to%20inquire%20about%20booking%20and%20availability.',
    telLink: 'tel:+919043780215'
  },
  combinedDisplay: '9500821550, 9043780215',
  invoiceDisplay: 'Ph: 9500821550, 9043780215',
  address: {
    line1: 'No.859/B, SV Thirumana Mahal Opposite',
    road: 'Bangalore Main Road',
    town: 'Chengam',
    pincode: '606701',
    district: 'Tiruvannamalai District',
    state: 'Tamil Nadu',
    fullShort: 'Main Road, Thukkapet, Chengam, Tamil Nadu - 606701',
    fullPostal: 'No.859/B, SV Thirumana Mahal Opposite, Bangalore Main Road, Chengam, Tamil Nadu - 606701',
    googleMapsUrl: 'https://maps.google.com/?q=SV+MAHAL+Chengam+Thukkapet'
  },
  gstin: '33GTSPD9038L1Z1'
};
