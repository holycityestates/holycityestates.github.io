import properties from '../data/properties.json';

export const THEME = process.env.SITE_THEME || 'signature';

export const site = {
  name: { en: 'Holy City Jerusalem Real Estate', he: 'העיר הקדושה – נדל״ן ירושלים' },
  phone: '052-678-3539',
  phoneIntl: '+972526783539',
  whatsapp: '972552605900',
  email: 'holycityestates1@gmail.com',
  address: { en: '26 King George St, Jerusalem', he: 'רחוב המלך ג׳ורג׳ 26, ירושלים' },
};

// Second currency shown next to every ₪ price. Rates are fetched live in the
// visitor's browser (open.er-api.com); these are only the fallback values.
export const currencies = [
  ['USD', '$'], ['EUR', '€'], ['GBP', '£'], ['CAD', 'C$'], ['AUD', 'A$'], ['CHF', 'CHF '], ['ZAR', 'R '],
];
export const fxFallback = { USD: 0.3276, EUR: 0.2920, GBP: 0.2477, CAD: 0.4669, AUD: 0.4705, CHF: 0.2721, ZAR: 5.4545 };

export const langPaths = () => [{ params: { lang: undefined } }, { params: { lang: 'he' } }];
export const getLang = (param) => (param === 'he' ? 'he' : 'en');
export const href = (lang, p = '/') => (lang === 'he' ? `/he${p === '/' ? '/' : p}` : p);
export const L = (obj, lang) => (obj && (obj[lang] || obj.en)) || '';

export const visible = properties.filter((p) => p.display);
export const active = visible.filter((p) => !p.offMarket);
export const sold = visible.filter((p) => p.offMarket);
export const projects = active.filter((p) => p.newProject);

const nf = new Intl.NumberFormat('en-US');
const suffix = (p, lang) => (p.status === 'rent' ? t[lang].perMonth : p.status === 'short-term' ? t[lang].perNight : '');
export const ils = (p, lang) => (p.price ? `₪${nf.format(p.price)}${suffix(p, lang)}` : t[lang].priceOnRequest);
export const price = ils;
export const fxDefault = (p) => {
  if (!p.price) return '';
  const v = p.price * fxFallback.USD;
  const r = p.status === 'sale' ? Math.round(v / 1000) * 1000 : Math.round(v / 10) * 10;
  return `≈ $${nf.format(r)}`;
};

// Hebrew readers expect "rooms" (חדרים); English readers expect bedrooms.
export const sizeLine = (p, lang) =>
  lang === 'he'
    ? [p.rooms && `${p.rooms} חדרים`, p.sizeSqm && `${p.sizeSqm} מ״ר`].filter(Boolean)
    : [p.bedrooms && `${p.bedrooms} ${p.bedrooms > 1 ? 'Bedrooms' : 'Bedroom'}`, p.sizeSqm && `${p.sizeSqm} m²`].filter(Boolean);

export const waLink = (text) => `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const t = {
  en: {
    dir: 'ltr',
    nav: { home: 'Home', properties: 'Properties', map: 'Map', projects: 'New Projects', sold: 'Sold', about: 'About', contact: 'Contact' },
    switchLang: 'עברית',
    heroKicker: 'Jerusalem Real Estate',
    heroTitle: 'Distinguished homes in Jerusalem’s finest neighborhoods',
    heroSub: 'Sales, rentals and property management in Talbiya, Rehavia, Mamilla, the City Center and beyond.',
    search: 'Search',
    any: 'Any',
    dealType: 'Buy or rent',
    status: { sale: 'For Sale', rent: 'For Rent', 'short-term': 'Short-Term Rental' },
    offMarket: { sale: 'Sold', rent: 'Rented', 'short-term': 'Rented' },
    neighborhood: 'Neighborhood',
    type: 'Property type',
    bedrooms: 'Bedrooms',
    rooms: 'Rooms',
    roomsHint: 'Israeli count: bedrooms + living room',
    fxLabel: 'Show prices also in',
    size: 'Size',
    sqm: 'm²',
    floor: 'Floor',
    ground: 'Ground',
    propertyNo: 'Property No.',
    sort: 'Sort',
    sortNew: 'Newest',
    sortLow: 'Price: low to high',
    sortHigh: 'Price: high to low',
    results: 'properties',
    noResults: 'No properties match these filters.',
    featured: 'Featured Properties',
    featuredSub: 'A curated selection of current listings.',
    projectsTitle: 'New Projects',
    projectsSub: 'Boutique developments and pre-sale opportunities across Jerusalem.',
    viewAll: 'View all properties',
    mapView: 'Map view',
    approxArea: 'Approximate area. Exact address on request.',
    neighborhoods: 'Explore by Neighborhood',
    listings: 'listings',
    soldTitle: 'Recently Sold & Rented',
    soldSub: 'A selection of homes we have recently placed with buyers and tenants.',
    priceOnRequest: 'Price upon request',
    perMonth: ' / mo',
    perNight: ' / night',
    newProject: 'New Project',
    exclusive: 'Exclusive',
    aboutKicker: 'About us',
    aboutTitle: 'Local knowledge. Personal service.',
    aboutBody:
      'Holy City Jerusalem Real Estate guides buyers, sellers, tenants and investors through Jerusalem’s most sought-after neighborhoods — and keeps their properties well managed long after the keys change hands.',
    services: [
      ['Sales', 'Representation for buyers and sellers of apartments, penthouses and buildings.'],
      ['Rentals', 'Long-term and short-term rentals, from studios to luxury penthouses.'],
      ['Property management', 'Tenant placement, leases, maintenance and financial oversight.'],
    ],
    testimonialTitle: 'What clients say',
    sellTitle: 'Thinking of selling or renting out?',
    sellSub: 'Get a professional valuation and a tailored marketing plan for your property.',
    sellCta: 'Request a valuation',
    offTitle: 'Hear about off-market properties first',
    offSub: 'Some of our best homes are never advertised. Leave your number and we’ll be in touch when the right one comes up.',
    offPlaceholder: 'Your phone or email',
    offCta: 'Keep me posted',
    ctaTitle: 'Looking to buy, sell or rent in Jerusalem?',
    ctaSub: 'Tell us what you’re looking for — we usually reply within the hour.',
    whatsapp: 'WhatsApp',
    whatsappLong: 'Message us on WhatsApp',
    call: 'Call',
    email: 'Email',
    description: 'About this property',
    features: 'Features',
    location: 'Location',
    gallery: 'Photos',
    interested: 'Interested in this property?',
    book: 'Book a viewing',
    video: 'Video call tour',
    share: 'Share',
    waProperty: (p) => `Hi, I'm interested in "${p.title.en}" (No. ${p.id}) on your website.`,
    similar: 'You may also like',
    back: 'All properties',
    contactTitle: 'Contact us',
    contactSub: 'Whether you’re searching, selling, or need expert advice — we’re here to help.',
    office: 'Office',
    rights: 'All rights reserved.',
  },
  he: {
    dir: 'rtl',
    nav: { home: 'דף הבית', properties: 'נכסים', map: 'מפת נכסים', projects: 'פרויקטים חדשים', sold: 'נכסים שנמכרו', about: 'אודות', contact: 'צור קשר' },
    switchLang: 'English',
    heroKicker: 'נדל״ן בירושלים',
    heroTitle: 'נכסי יוקרה בשכונות המבוקשות של ירושלים',
    heroSub: 'תיווך במכירה ובהשכרה וניהול נכסים בטלביה, רחביה, ממילא, מרכז העיר ועוד.',
    search: 'חיפוש נכסים',
    any: 'הכל',
    dealType: 'סוג עסקה',
    status: { sale: 'למכירה', rent: 'להשכרה', 'short-term': 'השכרה לטווח קצר' },
    offMarket: { sale: 'נמכר', rent: 'הושכר', 'short-term': 'הושכר' },
    neighborhood: 'שכונה',
    type: 'סוג נכס',
    bedrooms: 'חדרי שינה',
    rooms: 'חדרים',
    roomsHint: 'כולל סלון',
    fxLabel: 'הצגת מחירים גם ב-',
    size: 'שטח',
    sqm: 'מ״ר',
    floor: 'קומה',
    ground: 'קרקע',
    propertyNo: 'מספר נכס',
    sort: 'מיון',
    sortNew: 'החדשים ביותר',
    sortLow: 'מחיר: מהנמוך לגבוה',
    sortHigh: 'מחיר: מהגבוה לנמוך',
    results: 'נכסים',
    noResults: 'לא נמצאו נכסים התואמים את החיפוש.',
    featured: 'נכסים נבחרים',
    featuredSub: 'מבחר נכסים עדכניים מתוך המאגר שלנו.',
    projectsTitle: 'פרויקטים חדשים',
    projectsSub: 'פרויקטי בוטיק והזדמנויות בשלב המכירה המוקדמת ברחבי ירושלים.',
    viewAll: 'לכל הנכסים',
    mapView: 'תצוגת מפה',
    approxArea: 'אזור משוער. כתובת מדויקת תימסר בפנייה.',
    neighborhoods: 'חיפוש לפי שכונה',
    listings: 'נכסים',
    soldTitle: 'נכסים שנמכרו והושכרו',
    soldSub: 'מבחר נכסים שליווינו לאחרונה עד לחתימה.',
    priceOnRequest: 'מחיר לפי דרישה',
    perMonth: ' לחודש',
    perNight: ' ללילה',
    newProject: 'פרויקט חדש',
    exclusive: 'בבלעדיות',
    aboutKicker: 'אודותינו',
    aboutTitle: 'היכרות מעמיקה עם השוק. ליווי אישי.',
    aboutBody:
      'העיר הקדושה נדל״ן ירושלים מלווה רוכשים, מוכרים, שוכרים ומשקיעים בשכונות המבוקשות של ירושלים – וממשיכה לנהל עבורם את הנכס גם לאחר מסירת המפתח.',
    services: [
      ['תיווך במכירה', 'ליווי רוכשים ומוכרים של דירות, פנטהאוזים ובניינים.'],
      ['תיווך בהשכרה', 'השכרה לטווח ארוך ולטווח קצר – מדירות סטודיו ועד פנטהאוזים.'],
      ['ניהול נכסים', 'איתור שוכרים, חוזי שכירות, תחזוקה ופיקוח פיננסי.'],
    ],
    testimonialTitle: 'לקוחות ממליצים',
    sellTitle: 'מעוניינים למכור או להשכיר נכס?',
    sellSub: 'קבלו הערכת שווי מקצועית ותוכנית שיווק מותאמת לנכס שלכם.',
    sellCta: 'לקבלת הערכת שווי',
    offTitle: 'רוצים לשמוע ראשונים על נכסים חדשים ובלעדיים?',
    offSub: 'חלק מהנכסים הטובים ביותר שלנו לא מפורסמים כלל. השאירו פרטים ונעדכן כשיגיע הנכס המתאים.',
    offPlaceholder: 'טלפון או אימייל',
    offCta: 'עדכנו אותי',
    ctaTitle: 'מחפשים לקנות, למכור או לשכור בירושלים?',
    ctaSub: 'ספרו לנו מה אתם מחפשים – בדרך כלל נחזור אליכם תוך שעה.',
    whatsapp: 'וואטסאפ',
    whatsappLong: 'שלחו לנו הודעה בוואטסאפ',
    call: 'חייגו',
    email: 'אימייל',
    description: 'תיאור הנכס',
    features: 'מאפייני הנכס',
    location: 'מיקום',
    gallery: 'תמונות',
    interested: 'מתעניינים בנכס?',
    book: 'תיאום סיור בנכס',
    video: 'סיור בשיחת וידאו',
    share: 'שיתוף',
    waProperty: (p) => `שלום, אשמח לפרטים נוספים על הנכס "${p.title.he || p.title.en}" (מס׳ ${p.id}) שראיתי באתר.`,
    similar: 'נכסים נוספים שעשויים לעניין אותך',
    back: 'לכל הנכסים',
    contactTitle: 'צור קשר',
    contactSub: 'מחפשים נכס, מוכרים או זקוקים לייעוץ מקצועי – נשמח לעמוד לשירותכם.',
    office: 'המשרד',
    rights: 'כל הזכויות שמורות.',
  },
};

export const testimonial = {
  name: { en: 'Shula M.', he: 'שולה מ.' },
  text: {
    en: 'I would highly recommend Aryeh. He is responsive, reliable and patient. No question is too big or too small. I really felt that Aryeh wanted to help me find the right home, and the experience from start to finish was pleasant and smooth.',
    he: 'ממליצה בחום על אריה. זמין, אמין וסבלני – אין שאלה גדולה או קטנה מדי. הרגשתי שאריה באמת רוצה לעזור לי למצוא את הבית הנכון, והתהליך כולו, מההתחלה ועד הסוף, היה נעים וחלק.',
  },
};

// Optimized photos are stored as "/photos/<id>" → pick a size. External links pass through.
export const img = (src, size = 800) => (src && src.startsWith('/photos/') ? `${src}-${size}.webp` : src);
