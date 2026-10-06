// Professional Hebrew real estate terminology, matched to how leading Jerusalem
// agencies (Oren Cohen Group, Prosperity, etc.) word their listings.
// Keyed by the English label coming from Grist; overrides Grist's Hebrew column.

export const featureHe = {
  'Accessible': 'גישה לנכים',
  'A/C': 'מיזוג אוויר',
  'Great View': 'נוף פתוח',
  'Elevator': 'מעלית',
  'Renovated': 'משופצת',
  'Shabbat Lift': 'מעלית שבת',
  'Storage': 'מחסן',
  'Sukkah Balcony': 'מרפסת סוכה',
  'Pool': 'בריכה',
  'Parking': 'חנייה',
  'Gym': 'חדר כושר',
  'Luxury': 'סטנדרט יוקרה',
  'Garden': 'גינה',
  'Security': 'שמירה 24/7',
  'Concierge': 'שירותי קונסיירז׳',
  'Rooftop': 'גג פרטי',
  'Pre-sale': 'מכירה מוקדמת (פריסייל)',
  'High Ceilings': 'תקרות גבוהות',
  'Washer/Dryer': 'מכונת כביסה ומייבש',
  'Smart Home': 'בית חכם',
  'BBQ Area': 'פינת מנגל',
  'Sauna': 'סאונה',
  'Kitchen Appliances': 'מטבח מאובזר',
  'Private Entrance': 'כניסה פרטית',
  'Fully Furnished': 'מרוהטת קומפלט',
  'Private Garden': 'גינה פרטית',
  'No Stairs': 'ללא מדרגות',
  'New Building': 'בניין חדש',
  'Balcony': 'מרפסת',
  'New Project': 'פרויקט חדש',
  // Common Israeli features worth adding as Grist options:
  'Safe Room': 'ממ״ד',
  'Air Directions': 'כיווני אוויר',
  'Underfloor Heating': 'חימום תת-רצפתי',
  'Master Suite': 'יחידת הורים',
  'Immediate Entry': 'כניסה מיידית',
};

export const typeHe = {
  'Penthouse': 'פנטהאוז',
  'Apartment': 'דירה',
  'Studio Apartment': 'דירת סטודיו',
  'New project': 'פרויקט חדש',
  'Building': 'בניין',
  'Garden': 'בית עם גינה',
  'Garden Apartment': 'דירת גן',
  'Duplex Penthouse': 'פנטהאוז דופלקס',
  'Duplex': 'דופלקס',
  'Private House': 'בית פרטי',
  'Villa': 'וילה',
};

export const neighborhoodHe = {
  'Talbiya': 'טלביה',
  'Rehavia': 'רחביה',
  'City Center': 'מרכז העיר',
  'Mahane Yehuda': 'מחנה יהודה',
  'Mamilla': 'ממילא',
  'Shaarei Chesed': 'שערי חסד',
  'German Colony': 'המושבה הגרמנית',
  'Old Katamon': 'קטמון הישנה',
  'Baka': 'בקעה',
  'Arnona': 'ארנונה',
  'Nachlaot': 'נחלאות',
  'Yemin Moshe': 'ימין משה',
};

// Common misspellings in Hebrew street names coming from Grist.
const streetFixes = [
  [/הנביאם/g, 'הנביאים'],
  [/לינקון/g, 'לינקולן'],
  [/גורג(?!['׳])/g, 'ג׳ורג׳'],
];
export const fixStreetHe = (s) => streetFixes.reduce((v, [re, to]) => v.replace(re, to), s || '');
