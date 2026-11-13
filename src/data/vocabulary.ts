export type CategoryId = 'animals' | 'fruits' | 'colors' | 'numbers' | 'objects';

export interface WordItem {
  id: string;
  english: string;
  persian: string;
  emoji: string;
  categoryId: CategoryId;
}

export interface CategoryMeta {
  id: CategoryId;
  title: string;
  persianTitle: string;
  emoji: string;
  cardGradient: string;
  screenGradient: string;
  accentHex: string;
  accentTextClass: string;
  buttonBgClass: string;
  words: WordItem[];
}

export interface AlphabetItem {
  letter: string;
  pair: string;
  word: string;
  persian: string;
  emoji: string;
}

export interface BadgeDefinition {
  id: string;
  title: string;
  persianTitle: string;
  description: string;
  emoji: string;
  requiredStars?: number;
  requiredAlphabetCount?: number;
  requiredGamesPlayed?: number;
}

function buildUniqueCategoryWords(
  categoryId: CategoryId,
  rawEntries: ReadonlyArray<readonly [string, string, string]>
): WordItem[] {
  const seenEnglish = new Set<string>();
  const seenPersian = new Set<string>();
  const uniqueEntries: Array<readonly [string, string, string]> = [];

  for (const entry of rawEntries) {
    const enKey = entry[0].trim().toLowerCase();
    const faKey = entry[1].trim();
    if (!seenEnglish.has(enKey) && !seenPersian.has(faKey)) {
      seenEnglish.add(enKey);
      seenPersian.add(faKey);
      uniqueEntries.push(entry);
    }
  }

  return uniqueEntries.slice(0, 50).map(([english, persian, emoji], index) => ({
    id: `${categoryId}-${index + 1}-${english.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    english,
    persian,
    emoji,
    categoryId,
  }));
}

const ANIMAL_ENTRIES: ReadonlyArray<readonly [string, string, string]> = [
  ['Dog', 'سگ', '🐶'],
  ['Cat', 'گربه', '🐱'],
  ['Elephant', 'فیل', '🐘'],
  ['Lion', 'شیر', '🦁'],
  ['Rabbit', 'خرگوش', '🐰'],
  ['Bear', 'خرس', '🐻'],
  ['Tiger', 'ببر', '🐯'],
  ['Monkey', 'میمون', '🐵'],
  ['Giraffe', 'زرافه', '🦒'],
  ['Zebra', 'گورخر', '🦓'],
  ['Horse', 'اسب', '🐴'],
  ['Cow', 'گاو', '🐮'],
  ['Sheep', 'گوسفند', '🐑'],
  ['Goat', 'بز', '🐐'],
  ['Duck', 'اردک', '🦆'],
  ['Chicken', 'مرغ', '🐔'],
  ['Turkey', 'بوقلمون', '🦃'],
  ['Seal', 'فک', '🦭'],
  ['Frog', 'قورباغه', '🐸'],
  ['Turtle', 'لاک‌پشت', '🐢'],
  ['Fish', 'ماهی', '🐟'],
  ['Whale', 'نهنگ', '🐳'],
  ['Dolphin', 'دلفین', '🐬'],
  ['Shark', 'کوسه', '🦈'],
  ['Octopus', 'هشت‌پا', '🐙'],
  ['Crab', 'خرچنگ', '🦀'],
  ['Butterfly', 'پروانه', '🦋'],
  ['Bee', 'زنبور', '🐝'],
  ['Ladybug', 'کفشدوزک', '🐞'],
  ['Ant', 'مورچه', '🐜'],
  ['Spider', 'عنکبوت', '🕷️'],
  ['Snail', 'حلزون', '🐌'],
  ['Owl', 'جغد', '🦉'],
  ['Eagle', 'عقاب', '🦅'],
  ['Parrot', 'طوطی', '🦜'],
  ['Penguin', 'پنگوئن', '🐧'],
  ['Flamingo', 'فلامینگو', '🦩'],
  ['Swan', 'قو', '🦢'],
  ['Peacock', 'طاووس', '🦚'],
  ['Camel', 'شتر', '🐫'],
  ['Fox', 'روباه', '🦊'],
  ['Wolf', 'گرگ', '🐺'],
  ['Deer', 'آهو', '🦌'],
  ['Kangaroo', 'کانگورو', '🦘'],
  ['Koala', 'کوآلا', '🐨'],
  ['Panda', 'پاندا', '🐼'],
  ['Crocodile', 'تمساح', '🐊'],
  ['Hippo', 'اسب آبی', '🦛'],
  ['Rhino', 'کرگدن', '🦏'],
  ['Squirrel', 'سنجاب', '🐿️'],
];

const FRUIT_ENTRIES: ReadonlyArray<readonly [string, string, string]> = [
  ['Apple', 'سیب', '🍎'],
  ['Green Apple', 'سیب سبز', '🍏'],
  ['Banana', 'موز', '🍌'],
  ['Grapes', 'انگور', '🍇'],
  ['Orange', 'پرتقال', '🍊'],
  ['Watermelon', 'هندوانه', '🍉'],
  ['Strawberry', 'توت‌فرنگی', '🍓'],
  ['Cherry', 'گیلاس', '🍒'],
  ['Peach', 'هلو', '🍑'],
  ['Pear', 'گلابی', '🍐'],
  ['Pineapple', 'آناناس', '🍍'],
  ['Mango', 'انبه', '🥭'],
  ['Kiwi', 'کیوی', '🥝'],
  ['Lemon', 'لیموترش', '🍋'],
  ['Lime', 'لیموسبز', '🍋‍🟩'],
  ['Melon', 'طالبی', '🍈'],
  ['Coconut', 'نارگیل', '🥥'],
  ['Blueberry', 'بلوبری', '🫐'],
  ['Avocado', 'آووکادو', '🥑'],
  ['Tomato', 'گوجه‌فرنگی', '🍅'],
  ['Olive', 'زیتون', '🫒'],
  ['Eggplant', 'بادمجان', '🍆'],
  ['Carrot', 'هویج', '🥕'],
  ['Corn', 'ذرت', '🌽'],
  ['Cucumber', 'خیار', '🥒'],
  ['Bell Pepper', 'فلفل دلمه‌ای', '🫑'],
  ['Potato', 'سیب‌زمینی', '🥔'],
  ['Sweet Potato', 'سیب‌زمینی شیرین', '🍠'],
  ['Broccoli', 'کلم بروکلی', '🥦'],
  ['Lettuce', 'کاهو', '🥬'],
  ['Mushroom', 'قارچ', '🍄'],
  ['Onion', 'پیاز', '🧅'],
  ['Garlic', 'سیر', '🧄'],
  ['Peas', 'نخودفرنگی', '🫛'],
  ['Beans', 'لوبیا', '🫘'],
  ['Peanut', 'بادام‌زمینی', '🥜'],
  ['Chestnut', 'شاه‌بلوط', '🌰'],
  ['Pumpkin', 'کدو حلوایی', '🎃'],
  ['Chili Pepper', 'فلفل تند', '🌶️'],
  ['Ginger', 'زنجبیل', '🫚'],
  ['Tangerine', 'نارنگی', '🍊'],
  ['Plum', 'آلو', '🟣'],
  ['Pomegranate', 'انار', '❤️'],
  ['Apricot', 'زردآلو', '🟠'],
  ['Fig', 'انجیر', '🟤'],
  ['Date', 'خرما', '🌴'],
  ['Papaya', 'پاپایا', '🥭'],
  ['Blackberry', 'شاه‌توت', '🫐'],
  ['Raspberry', 'تمشک', '🍓'],
  ['Cranberry', 'کرن‌بری', '🍒'],
];

const COLOR_ENTRIES: ReadonlyArray<readonly [string, string, string]> = [
  ['Red', 'قرمز', '🔴'],
  ['Blue', 'آبی', '🔵'],
  ['Green', 'سبز', '🟢'],
  ['Yellow', 'زرد', '🟡'],
  ['Black', 'مشکی', '⚫'],
  ['White', 'سفید', '⚪'],
  ['Orange', 'نارنجی', '🟠'],
  ['Purple', 'بنفش', '🟣'],
  ['Brown', 'قهوه‌ای', '🟤'],
  ['Pink', 'صورتی', '🩷'],
  ['Gray', 'خاکستری', '🩶'],
  ['Light Blue', 'آبی روشن', '🩵'],
  ['Gold', 'طلایی', '🪙'],
  ['Silver', 'نقره‌ای', '🥈'],
  ['Rainbow', 'رنگین‌کمان', '🌈'],
  ['Crimson', 'زرشکی', '❤️'],
  ['Sky Blue', 'آبی آسمانی', '🩵'],
  ['Navy Blue', 'سرمه‌ای', '💙'],
  ['Dark Green', 'سبز تیره', '🌲'],
  ['Light Green', 'سبز روشن', '🌱'],
  ['Mint', 'نعنایی', '🌿'],
  ['Lime Green', 'سبز لیمویی', '🍏'],
  ['Lemon Yellow', 'زرد لیمویی', '🍋'],
  ['Amber', 'کهربایی', '🧡'],
  ['Coral', 'مرجانی', '🪸'],
  ['Peach', 'هلویی', '🍑'],
  ['Rose', 'گلی', '🌹'],
  ['Magenta', 'سرخابی', '🌺'],
  ['Violet', 'بنفشه', '💜'],
  ['Lavender', 'یاسی', '🪻'],
  ['Indigo', 'نیلی', '🟦'],
  ['Turquoise', 'فیروزه‌ای', '💎'],
  ['Teal', 'سبز آبی', '🦚'],
  ['Olive', 'زیتونی', '🫒'],
  ['Beige', 'بژ', '🟨'],
  ['Cream', 'کرمی', '🍦'],
  ['Ivory', 'عاجی', '🤍'],
  ['Tan', 'برنزه', '🟫'],
  ['Chocolate', 'شکلاتی', '🍫'],
  ['Charcoal', 'ذغالی', '⬛'],
  ['Bronze', 'برنزی', '🥉'],
  ['Copper', 'مسی', '🟠'],
  ['Emerald', 'زمردی', '💚'],
  ['Ruby', 'یاقوتی', '♦️'],
  ['Sapphire', 'کبود', '🔷'],
  ['Pearl', 'مرواریدی', '🫧'],
  ['Maroon', 'عنابی', '🟥'],
  ['Cyan', 'فیروزه‌ای روشن', '💧'],
  ['Mustard', 'خردلی', '🟡'],
  ['Plum', 'آلویی', '🟪'],
];

const OBJECT_ENTRIES: ReadonlyArray<readonly [string, string, string]> = [
  ['Chair', 'صندلی', '🪑'],
  ['Bed', 'تخت‌خواب', '🛏️'],
  ['Sofa', 'مبل', '🛋️'],
  ['Door', 'در', '🚪'],
  ['Window', 'پنجره', '🪟'],
  ['Key', 'کلید', '🔑'],
  ['Clock', 'ساعت', '⏰'],
  ['Lamp', 'لامپ', '💡'],
  ['Book', 'کتاب', '📖'],
  ['Notebook', 'دفتر', '📓'],
  ['Pencil', 'مداد', '✏️'],
  ['Pen', 'خودکار', '🖊️'],
  ['Scissors', 'قیچی', '✂️'],
  ['Ruler', 'خط‌کش', '📏'],
  ['Backpack', 'کوله‌پشتی', '🎒'],
  ['Phone', 'تلفن', '📱'],
  ['Laptop', 'لپ‌تاپ', '💻'],
  ['Television', 'تلویزیون', '📺'],
  ['Camera', 'دوربین', '📷'],
  ['Radio', 'رادیو', '📻'],
  ['Mirror', 'آینه', '🪞'],
  ['Toothbrush', 'مسواک', '🪥'],
  ['Soap', 'صابون', '🧼'],
  ['Broom', 'جارو', '🧹'],
  ['Basket', 'سبد', '🧺'],
  ['Spoon', 'قاشق', '🥄'],
  ['Fork', 'چنگال', '🍴'],
  ['Knife', 'چاقو', '🔪'],
  ['Plate', 'بشقاب', '🍽️'],
  ['Cup', 'لیوان', '🥤'],
  ['Mug', 'فنجان', '☕'],
  ['Bottle', 'بطری', '🍼'],
  ['Teapot', 'قوری', '🫖'],
  ['Hammer', 'چکش', '🔨'],
  ['Wrench', 'آچار', '🔧'],
  ['Umbrella', 'چتر', '☂️'],
  ['Glasses', 'عینک', '👓'],
  ['Hat', 'کلاه', '👒'],
  ['Shoe', 'کفش', '👟'],
  ['Sock', 'جوراب', '🧦'],
  ['Shirt', 'پیراهن', '👕'],
  ['Dress', 'لباس', '👗'],
  ['Coat', 'کت', '🧥'],
  ['Ball', 'توپ', '⚽'],
  ['Car', 'ماشین', '🚗'],
  ['Train', 'قطار', '🚂'],
  ['Airplane', 'هواپیما', '✈️'],
  ['Bicycle', 'دوچرخه', '🚲'],
  ['Boat', 'قایق', '⛵'],
  ['Gift', 'هدیه', '🎁'],
];

const NUMBER_WORDS_1_TO_19 = [
  'One', 'Two', 'Three', 'Four', 'Five',
  'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
  'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
];

const NUMBER_TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty'];

const PERSIAN_UNITS = [
  '', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه',
];

const PERSIAN_TEENS = [
  'ده', 'یازده', 'دوازده', 'سیزده', 'چهارده',
  'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده',
];

const PERSIAN_TENS = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه'];

const KEYCAP_DIGITS = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

function numberToEnglish(n: number): string {
  if (n <= 19) return NUMBER_WORDS_1_TO_19[n - 1];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones === 0
    ? NUMBER_TENS[tens]
    : `${NUMBER_TENS[tens]}-${NUMBER_WORDS_1_TO_19[ones - 1].toLowerCase()}`;
}

function numberToPersian(n: number): string {
  if (n < 10) return PERSIAN_UNITS[n];
  if (n < 20) return PERSIAN_TEENS[n - 10];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones === 0
    ? PERSIAN_TENS[tens]
    : `${PERSIAN_TENS[tens]} و ${PERSIAN_UNITS[ones]}`;
}

function numberToEmoji(n: number): string {
  if (n === 10) return '🔟';
  if (n < 10) return KEYCAP_DIGITS[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return `${KEYCAP_DIGITS[tens]}${KEYCAP_DIGITS[ones]}`;
}

function generateNumberWords(count = 50): WordItem[] {
  return Array.from({ length: count }, (_, idx) => {
    const n = idx + 1;
    return {
      id: `numbers-${n}`,
      english: numberToEnglish(n),
      persian: numberToPersian(n),
      emoji: numberToEmoji(n),
      categoryId: 'numbers',
    };
  });
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'animals',
    title: 'Animals',
    persianTitle: 'حیوانات',
    emoji: '🐾',
    cardGradient: 'from-amber-400 to-orange-500',
    screenGradient: 'from-amber-50 via-orange-50 to-yellow-100',
    accentHex: '#EA580C',
    accentTextClass: 'text-orange-600',
    buttonBgClass: 'bg-orange-500 hover:bg-orange-600',
    words: buildUniqueCategoryWords('animals', ANIMAL_ENTRIES),
  },
  {
    id: 'fruits',
    title: 'Fruits',
    persianTitle: 'میوه‌ها',
    emoji: '🍎',
    cardGradient: 'from-rose-400 to-pink-500',
    screenGradient: 'from-rose-50 via-pink-50 to-red-100',
    accentHex: '#E11D48',
    accentTextClass: 'text-rose-600',
    buttonBgClass: 'bg-rose-500 hover:bg-rose-600',
    words: buildUniqueCategoryWords('fruits', FRUIT_ENTRIES),
  },
  {
    id: 'colors',
    title: 'Colors',
    persianTitle: 'رنگ‌ها',
    emoji: '🎨',
    cardGradient: 'from-sky-400 to-indigo-500',
    screenGradient: 'from-sky-50 via-indigo-50 to-blue-100',
    accentHex: '#2563EB',
    accentTextClass: 'text-blue-600',
    buttonBgClass: 'bg-blue-500 hover:bg-blue-600',
    words: buildUniqueCategoryWords('colors', COLOR_ENTRIES),
  },
  {
    id: 'numbers',
    title: 'Numbers',
    persianTitle: 'اعداد',
    emoji: '🔢',
    cardGradient: 'from-emerald-400 to-teal-500',
    screenGradient: 'from-emerald-50 via-teal-50 to-cyan-100',
    accentHex: '#059669',
    accentTextClass: 'text-emerald-600',
    buttonBgClass: 'bg-emerald-500 hover:bg-emerald-600',
    words: generateNumberWords(50),
  },
  {
    id: 'objects',
    title: 'Objects',
    persianTitle: 'اشیا',
    emoji: '🪑',
    cardGradient: 'from-purple-400 to-fuchsia-500',
    screenGradient: 'from-purple-50 via-fuchsia-50 to-pink-100',
    accentHex: '#9333EA',
    accentTextClass: 'text-purple-600',
    buttonBgClass: 'bg-purple-600 hover:bg-purple-700',
    words: buildUniqueCategoryWords('objects', OBJECT_ENTRIES),
  },
];

export const ALL_WORDS: WordItem[] = CATEGORIES.flatMap((category) => category.words);

export const ALPHABET_ITEMS: AlphabetItem[] = [
  { letter: 'A', pair: 'Aa', word: 'Apple', persian: 'سیب', emoji: '🍎' },
  { letter: 'B', pair: 'Bb', word: 'Ball', persian: 'توپ', emoji: '⚽' },
  { letter: 'C', pair: 'Cc', word: 'Cat', persian: 'گربه', emoji: '🐱' },
  { letter: 'D', pair: 'Dd', word: 'Dog', persian: 'سگ', emoji: '🐶' },
  { letter: 'E', pair: 'Ee', word: 'Elephant', persian: 'فیل', emoji: '🐘' },
  { letter: 'F', pair: 'Ff', word: 'Fish', persian: 'ماهی', emoji: '🐟' },
  { letter: 'G', pair: 'Gg', word: 'Grapes', persian: 'انگور', emoji: '🍇' },
  { letter: 'H', pair: 'Hh', word: 'House', persian: 'خانه', emoji: '🏠' },
  { letter: 'I', pair: 'Ii', word: 'Ice Cream', persian: 'بستنی', emoji: '🍦' },
  { letter: 'J', pair: 'Jj', word: 'Juice', persian: 'آبمیوه', emoji: '🧃' },
  { letter: 'K', pair: 'Kk', word: 'Kite', persian: 'بادبادک', emoji: '🪁' },
  { letter: 'L', pair: 'Ll', word: 'Lion', persian: 'شیر', emoji: '🦁' },
  { letter: 'M', pair: 'Mm', word: 'Monkey', persian: 'میمون', emoji: '🐵' },
  { letter: 'N', pair: 'Nn', word: 'Nest', persian: 'لانه', emoji: '🪹' },
  { letter: 'O', pair: 'Oo', word: 'Orange', persian: 'پرتقال', emoji: '🍊' },
  { letter: 'P', pair: 'Pp', word: 'Panda', persian: 'پاندا', emoji: '🐼' },
  { letter: 'Q', pair: 'Qq', word: 'Queen', persian: 'ملکه', emoji: '👑' },
  { letter: 'R', pair: 'Rr', word: 'Rabbit', persian: 'خرگوش', emoji: '🐰' },
  { letter: 'S', pair: 'Ss', word: 'Sun', persian: 'خورشید', emoji: '☀️' },
  { letter: 'T', pair: 'Tt', word: 'Tiger', persian: 'ببر', emoji: '🐯' },
  { letter: 'U', pair: 'Uu', word: 'Umbrella', persian: 'چتر', emoji: '☂️' },
  { letter: 'V', pair: 'Vv', word: 'Violin', persian: 'ویولن', emoji: '🎻' },
  { letter: 'W', pair: 'Ww', word: 'Whale', persian: 'نهنگ', emoji: '🐳' },
  { letter: 'X', pair: 'Xx', word: 'Xylophone', persian: 'زیلوفون', emoji: '🎶' },
  { letter: 'Y', pair: 'Yy', word: 'Yellow', persian: 'زرد', emoji: '🟡' },
  { letter: 'Z', pair: 'Zz', word: 'Zebra', persian: 'گورخر', emoji: '🦓' },
];

export const REWARD_BADGES: BadgeDefinition[] = [
  {
    id: 'first_star',
    title: 'First Star',
    persianTitle: 'اولین ستاره',
    description: 'Earn your very first star in any game!',
    emoji: '🌟',
    requiredStars: 1,
  },
  {
    id: 'first_10_stars',
    title: 'First 10 Stars',
    persianTitle: '۱۰ ستاره اول',
    description: 'Collect 10 stars across games!',
    emoji: '⭐',
    requiredStars: 10,
  },
  {
    id: 'alphabet_explorer',
    title: 'Alphabet Explorer',
    persianTitle: 'کاشف الفبا',
    description: 'Listen to at least 10 letters in Alphabet A–Z!',
    emoji: '🔤',
    requiredAlphabetCount: 10,
  },
  {
    id: 'game_master',
    title: 'Game Master',
    persianTitle: 'استاد بازی‌ها',
    description: 'Earn stars in all 4 learning games!',
    emoji: '🎮',
    requiredGamesPlayed: 4,
  },
  {
    id: 'super_star_50',
    title: 'Super Star',
    persianTitle: 'ابَرستاره',
    description: 'Collect 50 stars!',
    emoji: '🏅',
    requiredStars: 50,
  },
  {
    id: 'english_champion',
    title: 'English Champion',
    persianTitle: 'قهرمان انگلیسی',
    description: 'Collect 100 stars!',
    emoji: '👑',
    requiredStars: 100,
  },
];

export type GameCategoryFilter = CategoryId | 'all';

export function getVocabularyPool(categoryFilter: GameCategoryFilter): WordItem[] {
  if (categoryFilter === 'all') return ALL_WORDS;
  const found = CATEGORIES.find((category) => category.id === categoryFilter);
  return found ? found.words : ALL_WORDS;
}

export function getCategoryFilterLabel(categoryFilter: GameCategoryFilter): {
  title: string;
  persian: string;
  emoji: string;
} {
  if (categoryFilter === 'all') {
    return { title: 'All Words', persian: 'همه کلمات', emoji: '🌟' };
  }
  const found = CATEGORIES.find((category) => category.id === categoryFilter);
  return found
    ? { title: found.title, persian: found.persianTitle, emoji: found.emoji }
    : { title: 'All Words', persian: 'همه کلمات', emoji: '🌟' };
}

export function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
