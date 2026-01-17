// lib/roseMeanings.ts

export type RoseMeaning = {
  id: string;
  colorName: { en: string; de: string };
  feeling: { en: string; de: string };
  quote: { en: string; de: string };
  occasions: { en: string[]; de: string[] };
  keywords: string[]; // Triggers for the search
};

export const ROSE_DATA: RoseMeaning[] = [
  {
    id: 'ash_grey',
    colorName: { en: 'Ash Grey', de: 'Aschgrau' },
    feeling: { en: 'Neutral, reliable, respectful', de: 'Neutral, zuverlässig, respektvoll' },
    quote: { en: 'Appropriate, without being too personal.', de: 'Passend, ohne zu persönlich zu sein.' },
    occasions: { 
      en: ['Business meetings', 'Colleagues', 'Teachers', 'Thank-you'], 
      de: ['Business Meetings', 'Arbeitskollegen', 'Lehrer:innen', 'Dankeschön-Geschenke'] 
    },
    keywords: ['business', 'work', 'boss', 'teacher', 'colleague', 'neutral', 'formal', 'arbeit', 'chef', 'lehrer']
  },
  {
    id: 'midnight_blue',
    colorName: { en: 'Midnight Blue', de: 'Mitternachtsblau' },
    feeling: { en: 'Trust & reliability', de: 'Vertrauen & Verlässlichkeit' },
    quote: { en: 'A safe and confident choice.', de: 'Eine sichere Wahl.' },
    occasions: { 
      en: ['Friendship', 'Business partners', 'Men', 'Formal'], 
      de: ['Freundschaft', 'Geschäftspartner', 'Männergeschenke', 'Formelle Anlässe'] 
    },
    keywords: ['trust', 'men', 'father', 'husband', 'partner', 'blue', 'vertrauen', 'mann', 'vater']
  },
  {
    id: 'ice_sea_blue',
    colorName: { en: 'Ice Sea Blue', de: 'Eismeerblau' },
    feeling: { en: 'Lightness & positive energy', de: 'Leichtigkeit & positive Energie' },
    quote: { en: 'A gift that brings joy.', de: 'Ein Geschenk, das Freude macht.' },
    occasions: { 
      en: ['Birthdays', 'Baby shower', 'Easter', 'Joy'], 
      de: ['Geburtstage', 'Babyfeiern', 'Ostern', 'Freude'] 
    },
    keywords: ['baby', 'boy', 'birth', 'easter', 'fun', 'light', 'geburt', 'ostern']
  },
  {
    id: 'lavender_dream',
    colorName: { en: 'Lavender Dream', de: 'LavendelTraum' },
    feeling: { en: 'Uniqueness & appreciation', de: 'Besonderheit & Wertschätzung' },
    quote: { en: 'Not ordinary.', de: 'Nicht alltäglich.' },
    occasions: { 
      en: ['Anniversaries', 'Special birthdays', 'Creative', 'Events'], 
      de: ['Jubiläen', 'Besondere Geburtstage', 'Kreative', 'Events'] 
    },
    keywords: ['unique', 'creative', 'purple', 'artist', 'special', 'einzigartig', 'kreativ']
  },
  {
    id: 'pastel_violet',
    colorName: { en: 'Pastel Violet', de: 'Pastellviolett' },
    feeling: { en: 'Warm & friendly', de: 'Herzlich & freundlich' },
    quote: { en: 'From the heart, without being overwhelming.', de: 'Von Herzen, ohne zu aufdringlich zu sein.' },
    occasions: { 
      en: ['Friendship', 'Colleagues', 'Mothers', 'Thank you'], 
      de: ['Freundschaft', 'Kolleg:innen', 'Mütter', 'Dankeschön'] 
    },
    keywords: ['mom', 'mother', 'friend', 'gentle', 'soft', 'mama', 'freundin']
  },
  {
    id: 'cream_white',
    colorName: { en: 'Cream White', de: 'Sahneweiß' },
    feeling: { en: 'Warmth & balance', de: 'Wärme & Ausgeglichenheit' },
    quote: { en: 'Always the right choice.', de: 'Passt immer.' },
    occasions: { 
      en: ['Host gifts', 'Christmas', 'Family', 'Elegant'], 
      de: ['Gastgebergeschenke', 'Weihnachten', 'Familie', 'Elegant'] 
    },
    keywords: ['christmas', 'host', 'home', 'family', 'cozy', 'warm', 'weihnachten', 'familie']
  },
  {
    id: 'snowflake_white',
    colorName: { en: 'Snowflake White', de: 'Schneeflockenweiß' },
    feeling: { en: 'Honesty & new beginnings', de: 'Ehrlichkeit & Neubeginn' },
    quote: { en: 'Classic and meaningful.', de: 'Klassisch & bedeutungsvoll.' },
    occasions: { 
      en: ['Engagements', 'Weddings', 'Christenings', 'Graduation'], 
      de: ['Verlobung', 'Hochzeiten', 'Taufen', 'Abschlussfeiern'] 
    },
    keywords: ['wedding', 'pure', 'bride', 'start', 'holy', 'hochzeit', 'braut', 'taufe']
  },
  {
    id: 'ruby_fire',
    colorName: { en: 'Ruby Fire', de: 'Rubinfeuer' },
    feeling: { en: 'Deep connection', de: 'Tiefe Verbindung' },
    quote: { en: 'For real emotions.', de: 'Für echte Gefühle.' },
    occasions: { 
      en: ['Relationship', 'Engagement', 'Anniversary', 'Valentine'], 
      de: ['Beziehung', 'Verlobung', 'Jahrestage', 'Valentinstag'] 
    },
    keywords: ['love', 'romance', 'wife', 'girlfriend', 'passion', 'red', 'date', 'liebe', 'frau', 'valentinstag']
  },
  {
    id: 'soft_pink',
    colorName: { en: 'Soft Pink', de: 'Zartrosa' },
    feeling: { en: 'Affection & thoughtfulness', de: 'Zuneigung & Aufmerksamkeit' },
    quote: { en: 'I was thinking of you.', de: 'Ich habe an dich gedacht.' },
    occasions: { 
      en: ['Birthdays', 'Mothers Day', 'Friendship', 'Thank you'], 
      de: ['Geburtstage', 'Muttertag', 'Freundschaft', 'Dankeschön'] 
    },
    keywords: ['crush', 'cute', 'girl', 'sweet', 'pink', 'geburtstag', 'süß']
  },
  {
    id: 'rose_kiss',
    colorName: { en: 'Rose Kiss', de: 'Rosenkuss' },
    feeling: { en: 'Closeness & warmth', de: 'Nähe & Herzlichkeit' },
    quote: { en: 'A gift with feeling.', de: 'Ein Geschenk mit Gefühl.' },
    occasions: { 
      en: ['Small gifts', 'Dates', 'Friends', 'Surprise'], 
      de: ['Kleine Geschenke', 'Dates', 'Freund:innen', 'Überraschungen'] 
    },
    keywords: ['kiss', 'dating', 'close', 'friend', 'kuss', 'date']
  },
  {
    id: 'light_rose',
    colorName: { en: 'Light Rose', de: 'Light Rose' },
    feeling: { en: 'Appreciation', de: 'Wertschätzung' },
    quote: { en: 'Stylish and kind.', de: 'Stilvoll & freundlich.' },
    occasions: { 
      en: ['Colleagues', 'Teachers', 'Clients', 'Events'], 
      de: ['Kolleg:innen', 'Lehrer:innen', 'Kundengeschenke', 'Events'] 
    },
    keywords: ['client', 'style', 'office', 'kind', 'kunde', 'büro']
  },
  {
    id: 'night_rose',
    colorName: { en: 'Night Rose', de: 'Nachtrose' },
    feeling: { en: 'Strength & impact', de: 'Stärke & Eindruck' },
    quote: { en: 'Unforgettable.', de: 'Bleibt im Kopf.' },
    occasions: { 
      en: ['Exclusive events', 'Business', 'Statements', 'Luxury'], 
      de: ['Exklusive Events', 'Business-Anlässe', 'Starke Statements'] 
    },
    keywords: ['black', 'strong', 'power', 'luxury', 'exclusive', 'schwarz', 'luxus', 'stark']
  },
  {
    id: 'forest_magic',
    colorName: { en: 'Forest Magic', de: 'Waldzauber' },
    feeling: { en: 'Natural & genuine', de: 'Natürlich & ehrlich' },
    quote: { en: 'Honest and grounding.', de: 'Natürlich & ehrlich.' },
    occasions: { 
      en: ['Christmas', 'Autumn', 'Family', 'Nature'], 
      de: ['Weihnachten', 'Herbstfeste', 'Familie', 'Natur'] 
    },
    keywords: ['nature', 'green', 'fall', 'winter', 'earth', 'natur', 'grün', 'wald']
  }
];

// Helper to find results
export function searchRoseMeanings(term: string) {
  const lowerTerm = term.toLowerCase();
  
  // Return items where keywords, occasions, or feeling match the term
  return ROSE_DATA.filter(item => 
    item.keywords.some(k => k.includes(lowerTerm)) ||
    item.occasions.en.some(o => o.toLowerCase().includes(lowerTerm)) ||
    item.occasions.de.some(o => o.toLowerCase().includes(lowerTerm)) ||
    item.feeling.en.toLowerCase().includes(lowerTerm) ||
    item.feeling.de.toLowerCase().includes(lowerTerm)
  );
}