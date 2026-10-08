import imported from '../data/properties.json';
// Corrections and rewritten copy (src/data/overrides.json) layered over the Grist import:
// any field set there replaces the imported one; `display: false` hides a listing.
import overrides from '../data/overrides.json';
import projectData from '../data/projects.json';

const properties = imported.map((p) => {
  const o = overrides[p.id];
  if (!o) return p;
  const { description, why, ...fields } = o;
  return { ...p, ...fields, description: description ? { en: description.en || p.description.en, he: description.he || p.description.he } : p.description };
});

// Property numbers are shown with a "300" prefix (#16 → 30016); the internal id and page addresses stay the same.
export const propNo = (id) => `300${id}`;
// Floor as shown to visitors: "Ground" for 0, "3–4" for duplexes.
export const floorText = (p, lang) => (p.floor == null ? null : p.floor === 0 ? t[lang].ground : p.floorTo ? `${p.floor}–${p.floorTo}` : String(p.floor));

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
// A project groups several apartments in one building. On New Projects it shows as one tile with its own
// page; apartments that aren't part of a project still show on their own. Properties lists every apartment.
export const projectGroups = projectData
  .map((g) => {
    const units = visible.filter((p) => p.project === g.slug).sort((a, b) => a.offMarket - b.offMarket || (a.price || 0) - (b.price || 0));
    const forSale = units.filter((p) => !p.offMarket);
    const prices = forSale.map((p) => p.price).filter(Boolean);
    return { ...g, units, forSale, from: prices.length ? Math.min(...prices) : null };
  })
  .filter((g) => g.forSale.length);
export const projectOf = (p) => projectGroups.find((g) => g.slug === p.project) || null;
export const projectTiles = [
  ...projectGroups.map((g) => ({ group: g })),
  ...projects.filter((p) => !projectOf(p)).map((p) => ({ p })),
];

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
    ? [p.rooms && (p.rooms === 1 ? 'חדר אחד' : `${p.rooms} חדרים`), p.sizeSqm && `${p.sizeSqm} מ״ר`].filter(Boolean)
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
    budget: 'Budget',
    budgetBuy: 'To buy',
    budgetRent: 'To rent, per month',
    budgetStay: 'Short-term, per night',
    upTo: 'Up to',
    status: { sale: 'For Sale', rent: 'For Rent', 'short-term': 'Short-Term Rental' },
    offMarket: { sale: 'Sold', rent: 'Rented', 'short-term': 'Rented' },
    neighborhood: 'Neighborhood',
    type: 'Property type',
    bedrooms: 'Bedrooms',
    rooms: 'Rooms',
    roomsHint: 'Israeli count: bedrooms + living room',
    fxLabel: 'Show prices also in',
    size: 'Size',
    balcony: 'Balcony',
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
    tools: {
      calcTitle: 'Costs & mortgage',
      calcSub: 'Quick estimates for this home. Adjust anything.',
      tabMortgage: 'Mortgage', tabTax: 'Purchase tax', tabYield: 'Investor return',
      price: 'Home price', buyer: 'Who is buying', first: 'First home', replace: 'Replacing a home', invest: 'Investment', foreign: 'Foreign resident',
      down: 'Down payment', years: 'Years', rate: 'Interest rate (example)', minDown: (n) => `Minimum for this buyer: ${n}% (Bank of Israel)`,
      monthly: 'Monthly payment', perMonth: '/ month', cash: 'Cash needed up front', loan: 'Mortgage', interest: 'Total interest', loanL: 'Loan', interestL: 'Interest over the term',
      mortNote: 'An estimate, not an offer or advice. Israeli mortgages usually mix several tracks, and banks also check income.',
      status: 'This will be my', only: 'Only home in Israel', extra: 'Additional home / foreign resident',
      taxL: 'Purchase tax', ofPrice: (p) => `${p}% of the price`, band: (r) => `${r}% band`, lawyer: 'Lawyer (example %)', lawyerVat: 'Lawyer incl. VAT (example)', allIn: 'All-in, before agency fee',
      taxNote: '2026 brackets. An estimate only: olim and some others get different rates, and your lawyer confirms the final figure.',
      rent: 'Monthly rent', mgmt: 'Management (% of rent)', vacancy: 'Empty months per year', other: 'Other yearly costs', netReturn: 'Net yearly return', gross: (g) => `Gross ${g}% before costs`,
      rentYear: 'Rent per year', costsYear: 'Costs per year', netYear: 'Net income per year', yieldNote: 'Before income tax and mortgage costs.',
      salesTitle: 'Recent sales nearby', salesSub: (d) => `Apartments sold within about 250 m, as registered with the Israel Tax Authority. Updated ${d}.`,
      cDate: 'Date', cRooms: 'Rooms', cSize: 'm²', cFloor: 'Floor', cPrice: 'Price', cPpm: '₪ per m²', ground: 'Ground',
      hoodMedian: (h, v, n) => `Typical price in ${h}: ${v} per m² (median of ${n} sales in the last 12 months).`,
      marketTitle: 'Jerusalem market', marketSub: 'News and real sale prices, updated regularly.',
      newsTitle: 'Latest news', ppmTitle: 'Price per m² by neighborhood', ppmSub: (n) => `Median of registered apartment sales over the last 12 months (${n} sales). Source: Israel Tax Authority.`,
      read: 'Read', sales: 'sales',
      isNew: 'New', reduced: 'Price reduced', was: 'Was',
    },
    projectsTitle: 'New Projects',
    projUnits: (n) => `${n} ${n === 1 ? 'home' : 'homes'} available`,
    priceFrom: 'From',
    projAvailable: 'Available in this project',
    projAbout: 'About the project',
    delivery: 'Expected delivery',
    condition: 'Condition',
    unitsLabel: 'Available',
    unitCol: 'Home',
    viewUnit: 'View',
    partOf: 'Part of a new project',
    letter: [
      'Jerusalem isn\u2019t one market. It\u2019s dozens of small ones, street by street: the quiet lanes of Talbiya, the Bauhaus blocks of Rehavia, the new towers of the City Center.',
      'We help buyers, sellers, tenants and investors find their place in it, and we look after their homes long after the keys change hands.',
      'If you\u2019re thinking about a move, I\u2019d be glad to walk the city with you.',
    ],
    exChoose: 'Choose a floor',
    exHint: 'Gold floors have homes for sale. Tap a floor to see them.',
    seeProject: 'See all homes in this project',
    allProjects: 'All projects',
    waProject: (g) => `Hi, I'm interested in the ${g.name.en} project on your website.`,
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
    svcKicker: 'What we do',
    svcTitle: 'Our Services',
    svcSub: 'At Holy City Jerusalem Real Estate we look after every part of your property journey.',
    services: [
      ['sale', 'Property Sales', 'Guiding you through every step of buying or selling, with dedication and care.'],
      ['rent', 'Property Rentals', 'Connecting tenants and owners for smooth rentals, for months or for years.'],
      ['manage', 'Property Management', 'Professional care that keeps your property well maintained and profitable.'],
      ['projects', 'New Projects', "Exclusive access to new developments across Jerusalem's real estate market."],
      ['renewal', 'Urban Renewal', 'Helping owners navigate and benefit from urban-renewal projects across the city.'],
    ],
    testimonialTitle: 'What clients say',
    prevReview: 'Previous review',
    nextReview: 'Next review',
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
    waProperty: (p) => `Hi, I'm interested in "${p.title.en}" (No. ${propNo(p.id)}) on your website.`,
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
    budget: 'תקציב',
    budgetBuy: 'לקנייה',
    budgetRent: 'להשכרה, לחודש',
    budgetStay: 'לטווח קצר, ללילה',
    upTo: 'עד',
    status: { sale: 'למכירה', rent: 'להשכרה', 'short-term': 'השכרה לטווח קצר' },
    offMarket: { sale: 'נמכר', rent: 'הושכר', 'short-term': 'הושכר' },
    neighborhood: 'שכונה',
    type: 'סוג נכס',
    bedrooms: 'חדרי שינה',
    rooms: 'חדרים',
    roomsHint: 'כולל סלון',
    fxLabel: 'הצגת מחירים גם ב-',
    size: 'שטח',
    balcony: 'מרפסת',
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
    tools: {
      calcTitle: 'עלויות ומשכנתא',
      calcSub: 'הערכה מהירה לנכס הזה. אפשר לשנות כל נתון.',
      tabMortgage: 'משכנתא', tabTax: 'מס רכישה', tabYield: 'תשואה למשקיע',
      price: 'מחיר הנכס', buyer: 'מי קונה', first: 'דירה ראשונה', replace: 'דירה חלופית', invest: 'השקעה', foreign: 'תושב חוץ',
      down: 'הון עצמי', years: 'שנים', rate: 'ריבית (לדוגמה)', minDown: (n) => `מינימום לרוכש זה: ${n}% (בנק ישראל)`,
      monthly: 'החזר חודשי', perMonth: '/ לחודש', cash: 'הון עצמי נדרש', loan: 'סכום המשכנתא', interest: 'סך הריבית', loanL: 'הלוואה', interestL: 'ריבית לאורך התקופה',
      mortNote: 'הערכה בלבד ולא הצעה או ייעוץ. משכנתא בישראל משלבת בדרך כלל כמה מסלולים, והבנק בודק גם הכנסות.',
      status: 'הדירה תהיה', only: 'דירה יחידה בישראל', extra: 'דירה נוספת / תושב חוץ',
      taxL: 'מס רכישה', ofPrice: (p) => `${p}% מהמחיר`, band: (r) => `מדרגת ${r}%`, lawyer: 'עורך דין (% לדוגמה)', lawyerVat: 'עו״ד כולל מע״מ (לדוגמה)', allIn: 'סה״כ, לפני דמי תיווך',
      taxNote: 'מדרגות 2026. הערכה בלבד: לעולים חדשים ולאחרים יש הקלות, ועורך הדין מאשר את הסכום הסופי.',
      rent: 'שכר דירה חודשי', mgmt: 'ניהול (% משכר הדירה)', vacancy: 'חודשים ריקים בשנה', other: 'הוצאות שנתיות נוספות', netReturn: 'תשואה שנתית נטו', gross: (g) => `${g}% ברוטו לפני הוצאות`,
      rentYear: 'שכר דירה לשנה', costsYear: 'הוצאות לשנה', netYear: 'הכנסה נטו לשנה', yieldNote: 'לפני מס הכנסה ועלויות משכנתא.',
      salesTitle: 'עסקאות אחרונות בסביבה', salesSub: (d) => `דירות שנמכרו במרחק של כ־250 מטר, כפי שדווחו לרשות המסים. עודכן ${d}.`,
      cDate: 'תאריך', cRooms: 'חדרים', cSize: 'מ״ר', cFloor: 'קומה', cPrice: 'מחיר', cPpm: '₪ למ״ר', ground: 'קרקע',
      hoodMedian: (h, v, n) => `מחיר טיפוסי ב${h}: ${v} למ״ר (חציון של ${n} עסקאות ב־12 החודשים האחרונים).`,
      marketTitle: 'שוק הנדל״ן בירושלים', marketSub: 'חדשות ומחירי עסקאות אמיתיים, מתעדכנים באופן שוטף.',
      newsTitle: 'חדשות אחרונות', ppmTitle: 'מחיר למ״ר לפי שכונה', ppmSub: (n) => `חציון עסקאות הדירות שדווחו ב־12 החודשים האחרונים (${n} עסקאות). מקור: רשות המסים.`,
      read: 'לקריאה', sales: 'עסקאות',
      isNew: 'חדש', reduced: 'המחיר ירד', was: 'במקום',
    },
    projectsTitle: 'פרויקטים חדשים',
    projUnits: (n) => (n === 1 ? 'דירה אחת זמינה' : `${n} דירות זמינות`),
    priceFrom: 'החל מ־',
    projAvailable: 'הדירות בפרויקט',
    projAbout: 'על הפרויקט',
    delivery: 'מסירה צפויה',
    condition: 'מצב',
    unitsLabel: 'זמינות',
    unitCol: 'דירה',
    viewUnit: 'לצפייה',
    partOf: 'חלק מפרויקט חדש',
    letter: [
      'ירושלים היא לא שוק אחד. היא עשרות שווקים קטנים, רחוב אחר רחוב: הסמטאות השקטות של טלביה, בנייני הבאוהאוס של רחביה והמגדלים החדשים של מרכז העיר.',
      'אנחנו מלווים קונים, מוכרים, שוכרים ומשקיעים במציאת המקום שלהם בעיר, וממשיכים לדאוג לנכס גם הרבה אחרי שהמפתחות עוברים ידיים.',
      'אם אתם חושבים על מעבר, אשמח לצאת איתכם לסיור בעיר.',
    ],
    exChoose: 'בחרו קומה',
    exHint: 'בקומות המוזהבות יש דירות למכירה. לחצו על קומה כדי לראות אותן.',
    seeProject: 'לכל הדירות בפרויקט',
    allProjects: 'לכל הפרויקטים',
    waProject: (g) => `שלום, אשמח לפרטים על פרויקט ${g.name.he} שראיתי באתר.`,
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
    svcKicker: 'מה אנחנו עושים',
    svcTitle: 'השירותים שלנו',
    svcSub: 'בהעיר הקדושה נדל״ן ירושלים אנחנו מלווים אתכם בכל שלב בדרך לנכס.',
    services: [
      ['sale', 'מכירת נכסים', 'ליווי מקצועי בכל שלב בקנייה או במכירה של הנכס, במסירות ובקפידה.'],
      ['rent', 'השכרת נכסים', 'מחברים בין שוכרים לבעלי נכסים להשכרה חלקה – לחודשים או לשנים.'],
      ['manage', 'ניהול נכסים', 'טיפול מקצועי ששומר על הנכס שלכם מתוחזק ורווחי.'],
      ['projects', 'פרויקטים חדשים', 'גישה בלעדית לפרויקטים חדשים ולהזדמנויות בשוק הנדל״ן בירושלים.'],
      ['renewal', 'התחדשות עירונית', 'מלווים בעלי נכסים בפרויקטים של התחדשות עירונית ברחבי העיר.'],
    ],
    testimonialTitle: 'לקוחות ממליצים',
    prevReview: 'ההמלצה הקודמת',
    nextReview: 'ההמלצה הבאה',
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
    waProperty: (p) => `שלום, אשמח לפרטים נוספים על הנכס "${p.title.he || p.title.en}" (מס׳ ${propNo(p.id)}) שראיתי באתר.`,
    similar: 'נכסים נוספים שעשויים לעניין אותך',
    back: 'לכל הנכסים',
    contactTitle: 'צור קשר',
    contactSub: 'מחפשים נכס, מוכרים או זקוקים לייעוץ מקצועי – נשמח לעמוד לשירותכם.',
    office: 'המשרד',
    rights: 'כל הזכויות שמורות.',
  },
};

// Client reviews (all real, confirmed by Aryeh 2026-10-08). Shown in a rotating quote box.
export const testimonials = [
  {
    name: { en: 'Shula M.', he: 'שולה מ.' },
    text: {
      en: 'I would highly recommend Aryeh. He is responsive, reliable and patient. No question is too big or too small. I really felt that Aryeh wanted to help me find the right home, and the experience from start to finish was pleasant and smooth.',
      he: 'ממליצה בחום על אריה. זמין, אמין וסבלני – אין שאלה גדולה או קטנה מדי. הרגשתי שאריה באמת רוצה לעזור לי למצוא את הבית הנכון, והתהליך כולו, מההתחלה ועד הסוף, היה נעים וחלק.',
    },
  },
  {
    name: { en: 'Daniel K.', he: 'דניאל ק.' },
    text: {
      en: 'Honestly expected the usual broker runaround. Instead we got straight answers, including being told one place was overpriced. That’s why we trusted him on the one we bought.',
      he: 'האמת שציפיתי לסחרור הרגיל של מתווכים. במקום זה קיבלנו תשובות ישירות – כולל שאמרו לנו שדירה אחת מתומחרת ביוקר. בגלל זה סמכנו עליו בדירה שקנינו.',
    },
  },
  {
    name: { en: 'Chaim R.', he: 'חיים ר.' },
    text: {
      en: 'Sold our parents’ apartment after they made aliyah to the kids. Aryeh was patient with all of us, which was not easy. Got a better price than we expected.',
      he: 'מכרנו את הדירה של ההורים אחרי שהם עלו ארצה אל הילדים. אריה היה סבלני עם כולנו, וזה לא היה פשוט. קיבלנו מחיר טוב יותר ממה שציפינו.',
    },
  },
  {
    name: { en: 'Shira S.', he: 'שירה ש.' },
    text: {
      en: 'Quick, responsive, knows the buildings. Found us a rental with a sukkah balcony in under two weeks.',
      he: 'מהיר, זמין ומכיר את הבניינים. מצא לנו דירה להשכרה עם מרפסת סוכה בפחות משבועיים.',
    },
  },
  {
    name: { en: 'Yair K.', he: 'יאיר ק.' },
    text: {
      en: 'Second time using Holy City. The first time they helped us rent when we were new in the city, and when we were ready to buy, there was no question who we’d call. They remembered what we liked and didn’t waste our time on places that didn’t fit. Wouldn’t go anywhere else in Jerusalem.',
      he: 'זו הפעם השנייה שלנו עם העיר הקדושה. בפעם הראשונה הם עזרו לנו לשכור כשהיינו חדשים בעיר, וכשהיינו מוכנים לקנות – לא הייתה שאלה למי נתקשר. הם זכרו מה אהבנו ולא בזבזו לנו זמן על דירות שלא התאימו. לא הייתי הולך לאף אחד אחר בירושלים.',
    },
  },
];
export const testimonial = testimonials[0];

// Optimized photos are stored as "/photos/<id>" → pick a size. External links pass through.
export const img = (src, size = 800) => (src && src.startsWith('/photos/') ? `${src}-${size}.webp` : src);
