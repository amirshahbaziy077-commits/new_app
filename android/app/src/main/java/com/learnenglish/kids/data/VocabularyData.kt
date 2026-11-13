package com.learnenglish.kids.data

import androidx.compose.ui.graphics.Color

enum class CategoryId {
    ANIMALS, FRUITS, COLORS, NUMBERS, OBJECTS
}

data class WordItem(
    val id: String,
    val english: String,
    val persian: String,
    val emoji: String,
    val categoryId: CategoryId
)

data class CategoryInfo(
    val id: CategoryId,
    val title: String,
    val persianTitle: String,
    val emoji: String,
    val gradientStart: Color,
    val gradientEnd: Color,
    val accentColor: Color,
    val words: List<WordItem>
)

data class AlphabetItem(
    val letter: String,
    val pair: String,
    val word: String,
    val persian: String,
    val emoji: String
)

data class RewardBadge(
    val id: String,
    val title: String,
    val persianTitle: String,
    val description: String,
    val emoji: String,
    val requiredStars: Int? = null,
    val requiredAlphabetCount: Int? = null,
    val requiredGamesPlayed: Int? = null
)

object VocabularyRepository {

    private fun buildUniqueWords(
        categoryId: CategoryId,
        entries: List<Triple<String, String, String>>
    ): List<WordItem> {
        val seenEn = mutableSetOf<String>()
        val seenFa = mutableSetOf<String>()
        return entries
            .filter { (en, fa, _) ->
                seenEn.add(en.trim().lowercase()) && seenFa.add(fa.trim())
            }
            .take(50)
            .mapIndexed { index, (en, fa, emoji) ->
                WordItem(
                    id = "${categoryId.name.lowercase()}_${index + 1}",
                    english = en,
                    persian = fa,
                    emoji = emoji,
                    categoryId = categoryId
                )
            }
    }

    private val animalEntries = listOf(
        Triple("Dog", "سگ", "🐶"),
        Triple("Cat", "گربه", "🐱"),
        Triple("Elephant", "فیل", "🐘"),
        Triple("Lion", "شیر", "🦁"),
        Triple("Rabbit", "خرگوش", "🐰"),
        Triple("Bear", "خرس", "🐻"),
        Triple("Tiger", "ببر", "🐯"),
        Triple("Monkey", "میمون", "🐵"),
        Triple("Giraffe", "زرافه", "🦒"),
        Triple("Zebra", "گورخر", "🦓"),
        Triple("Horse", "اسب", "🐴"),
        Triple("Cow", "گاو", "🐮"),
        Triple("Sheep", "گوسفند", "🐑"),
        Triple("Goat", "بز", "🐐"),
        Triple("Duck", "اردک", "🦆"),
        Triple("Chicken", "مرغ", "🐔"),
        Triple("Turkey", "بوقلمون", "🦃"),
        Triple("Seal", "فک", "🦭"),
        Triple("Frog", "قورباغه", "🐸"),
        Triple("Turtle", "لاک‌پشت", "🐢"),
        Triple("Fish", "ماهی", "🐟"),
        Triple("Whale", "نهنگ", "🐳"),
        Triple("Dolphin", "دلفین", "🐬"),
        Triple("Shark", "کوسه", "🦈"),
        Triple("Octopus", "هشت‌پا", "🐙"),
        Triple("Crab", "خرچنگ", "🦀"),
        Triple("Butterfly", "پروانه", "🦋"),
        Triple("Bee", "زنبور", "🐝"),
        Triple("Ladybug", "کفشدوزک", "🐞"),
        Triple("Ant", "مورچه", "🐜"),
        Triple("Spider", "عنکبوت", "🕷️"),
        Triple("Snail", "حلزون", "🐌"),
        Triple("Owl", "جغد", "🦉"),
        Triple("Eagle", "عقاب", "🦅"),
        Triple("Parrot", "طوطی", "🦜"),
        Triple("Penguin", "پنگوئن", "🐧"),
        Triple("Flamingo", "فلامینگو", "🦩"),
        Triple("Swan", "قو", "🦢"),
        Triple("Peacock", "طاووس", "🦚"),
        Triple("Camel", "شتر", "🐫"),
        Triple("Fox", "روباه", "🦊"),
        Triple("Wolf", "گرگ", "🐺"),
        Triple("Deer", "آهو", "🦌"),
        Triple("Kangaroo", "کانگورو", "🦘"),
        Triple("Koala", "کوآلا", "🐨"),
        Triple("Panda", "پاندا", "🐼"),
        Triple("Crocodile", "تمساح", "🐊"),
        Triple("Hippo", "اسب آبی", "🦛"),
        Triple("Rhino", "کرگدن", "🦏"),
        Triple("Squirrel", "سنجاب", "🐿️")
    )

    private val fruitEntries = listOf(
        Triple("Apple", "سیب", "🍎"),
        Triple("Green Apple", "سیب سبز", "🍏"),
        Triple("Banana", "موز", "🍌"),
        Triple("Grapes", "انگور", "🍇"),
        Triple("Orange", "پرتقال", "🍊"),
        Triple("Watermelon", "هندوانه", "🍉"),
        Triple("Strawberry", "توت‌فرنگی", "🍓"),
        Triple("Cherry", "گیلاس", "🍒"),
        Triple("Peach", "هلو", "🍑"),
        Triple("Pear", "گلابی", "🍐"),
        Triple("Pineapple", "آناناس", "🍍"),
        Triple("Mango", "انبه", "🥭"),
        Triple("Kiwi", "کیوی", "🥝"),
        Triple("Lemon", "لیموترش", "🍋"),
        Triple("Lime", "لیموسبز", "🍋"),
        Triple("Melon", "طالبی", "🍈"),
        Triple("Coconut", "نارگیل", "🥥"),
        Triple("Blueberry", "بلوبری", "🫐"),
        Triple("Avocado", "آووکادو", "🥑"),
        Triple("Tomato", "گوجه‌فرنگی", "🍅"),
        Triple("Olive", "زیتون", "🫒"),
        Triple("Eggplant", "بادمجان", "🍆"),
        Triple("Carrot", "هویج", "🥕"),
        Triple("Corn", "ذرت", "🌽"),
        Triple("Cucumber", "خیار", "🥒"),
        Triple("Bell Pepper", "فلفل دلمه‌ای", "🫑"),
        Triple("Potato", "سیب‌زمینی", "🥔"),
        Triple("Sweet Potato", "سیب‌زمینی شیرین", "🍠"),
        Triple("Broccoli", "کلم بروکلی", "🥦"),
        Triple("Lettuce", "کاهو", "🥬"),
        Triple("Mushroom", "قارچ", "🍄"),
        Triple("Onion", "پیاز", "🧅"),
        Triple("Garlic", "سیر", "🧄"),
        Triple("Peas", "نخودفرنگی", "🫛"),
        Triple("Beans", "لوبیا", "🫘"),
        Triple("Peanut", "بادام‌زمینی", "🥜"),
        Triple("Chestnut", "شاه‌بلوط", "🌰"),
        Triple("Pumpkin", "کدو حلوایی", "🎃"),
        Triple("Chili Pepper", "فلفل تند", "🌶️"),
        Triple("Ginger", "زنجبیل", "🫚"),
        Triple("Tangerine", "نارنگی", "🍊"),
        Triple("Plum", "آلو", "🟣"),
        Triple("Pomegranate", "انار", "❤️"),
        Triple("Apricot", "زردآلو", "🟠"),
        Triple("Fig", "انجیر", "🟤"),
        Triple("Date", "خرما", "🌴"),
        Triple("Papaya", "پاپایا", "🥭"),
        Triple("Blackberry", "شاه‌توت", "🫐"),
        Triple("Raspberry", "تمشک", "🍓"),
        Triple("Cranberry", "کرن‌بری", "🍒")
    )

    private val colorEntries = listOf(
        Triple("Red", "قرمز", "🔴"),
        Triple("Blue", "آبی", "🔵"),
        Triple("Green", "سبز", "🟢"),
        Triple("Yellow", "زرد", "🟡"),
        Triple("Black", "مشکی", "⚫"),
        Triple("White", "سفید", "⚪"),
        Triple("Orange", "نارنجی", "🟠"),
        Triple("Purple", "بنفش", "🟣"),
        Triple("Brown", "قهوه‌ای", "🟤"),
        Triple("Pink", "صورتی", "🩷"),
        Triple("Gray", "خاکستری", "🩶"),
        Triple("Light Blue", "آبی روشن", "🩵"),
        Triple("Gold", "طلایی", "🪙"),
        Triple("Silver", "نقره‌ای", "🥈"),
        Triple("Rainbow", "رنگین‌کمان", "🌈"),
        Triple("Crimson", "زرشکی", "❤️"),
        Triple("Sky Blue", "آبی آسمانی", "🩵"),
        Triple("Navy Blue", "سرمه‌ای", "💙"),
        Triple("Dark Green", "سبز تیره", "🌲"),
        Triple("Light Green", "سبز روشن", "🌱"),
        Triple("Mint", "نعنایی", "🌿"),
        Triple("Lime Green", "سبز لیمویی", "🍏"),
        Triple("Lemon Yellow", "زرد لیمویی", "🍋"),
        Triple("Amber", "کهربایی", "🧡"),
        Triple("Coral", "مرجانی", "🪸"),
        Triple("Peach", "هلویی", "🍑"),
        Triple("Rose", "گلی", "🌹"),
        Triple("Magenta", "سرخابی", "🌺"),
        Triple("Violet", "بنفشه", "💜"),
        Triple("Lavender", "یاسی", "🪻"),
        Triple("Indigo", "نیلی", "🟦"),
        Triple("Turquoise", "فیروزه‌ای", "💎"),
        Triple("Teal", "سبز آبی", "🦚"),
        Triple("Olive", "زیتونی", "🫒"),
        Triple("Beige", "بژ", "🟨"),
        Triple("Cream", "کرمی", "🍦"),
        Triple("Ivory", "عاجی", "🤍"),
        Triple("Tan", "برنزه", "🟫"),
        Triple("Chocolate", "شکلاتی", "🍫"),
        Triple("Charcoal", "ذغالی", "⬛"),
        Triple("Bronze", "برنزی", "🥉"),
        Triple("Copper", "مسی", "🟠"),
        Triple("Emerald", "زمردی", "💚"),
        Triple("Ruby", "یاقوتی", "♦️"),
        Triple("Sapphire", "کبود", "🔷"),
        Triple("Pearl", "مرواریدی", "🫧"),
        Triple("Maroon", "عنابی", "🟥"),
        Triple("Cyan", "فیروزه‌ای روشن", "💧"),
        Triple("Mustard", "خردلی", "🟡"),
        Triple("Plum", "آلویی", "🟪")
    )

    private val objectEntries = listOf(
        Triple("Chair", "صندلی", "🪑"),
        Triple("Bed", "تخت‌خواب", "🛏️"),
        Triple("Sofa", "مبل", "🛋️"),
        Triple("Door", "در", "🚪"),
        Triple("Window", "پنجره", "🪟"),
        Triple("Key", "کلید", "🔑"),
        Triple("Clock", "ساعت", "⏰"),
        Triple("Lamp", "لامپ", "💡"),
        Triple("Book", "کتاب", "📖"),
        Triple("Notebook", "دفتر", "📓"),
        Triple("Pencil", "مداد", "✏️"),
        Triple("Pen", "خودکار", "🖊️"),
        Triple("Scissors", "قیچی", "✂️"),
        Triple("Ruler", "خط‌کش", "📏"),
        Triple("Backpack", "کوله‌پشتی", "🎒"),
        Triple("Phone", "تلفن", "📱"),
        Triple("Laptop", "لپ‌تاپ", "💻"),
        Triple("Television", "تلویزیون", "📺"),
        Triple("Camera", "دوربین", "📷"),
        Triple("Radio", "رادیو", "📻"),
        Triple("Mirror", "آینه", "🪞"),
        Triple("Toothbrush", "مسواک", "🪥"),
        Triple("Soap", "صابون", "🧼"),
        Triple("Broom", "جارو", "🧹"),
        Triple("Basket", "سبد", "🧺"),
        Triple("Spoon", "قاشق", "🥄"),
        Triple("Fork", "چنگال", "🍴"),
        Triple("Knife", "چاقو", "🔪"),
        Triple("Plate", "بشقاب", "🍽️"),
        Triple("Cup", "لیوان", "🥤"),
        Triple("Mug", "فنجان", "☕"),
        Triple("Bottle", "بطری", "🍼"),
        Triple("Teapot", "قوری", "🫖"),
        Triple("Hammer", "چکش", "🔨"),
        Triple("Wrench", "آچار", "🔧"),
        Triple("Umbrella", "چتر", "☂️"),
        Triple("Glasses", "عینک", "👓"),
        Triple("Hat", "کلاه", "👒"),
        Triple("Shoe", "کفش", "👟"),
        Triple("Sock", "جوراب", "🧦"),
        Triple("Shirt", "پیراهن", "👕"),
        Triple("Dress", "لباس", "👗"),
        Triple("Coat", "کت", "🧥"),
        Triple("Ball", "توپ", "⚽"),
        Triple("Car", "ماشین", "🚗"),
        Triple("Train", "قطار", "🚂"),
        Triple("Airplane", "هواپیما", "✈️"),
        Triple("Bicycle", "دوچرخه", "🚲"),
        Triple("Boat", "قایق", "⛵"),
        Triple("Gift", "هدیه", "🎁")
    )

    private fun generateNumbers(count: Int = 50): List<WordItem> {
        val oneToNineteen = listOf(
            "One", "Two", "Three", "Four", "Five",
            "Six", "Seven", "Eight", "Nine", "Ten",
            "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
            "Sixteen", "Seventeen", "Eighteen", "Nineteen"
        )
        val tensEn = listOf("", "", "Twenty", "Thirty", "Forty", "Fifty")
        val unitsFa = listOf("", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت", "نه")
        val teensFa = listOf(
            "ده", "یازده", "دوازده", "سیزده", "چهارده",
            "پانزده", "شانزده", "هفده", "هجده", "نوزده"
        )
        val tensFa = listOf("", "", "بیست", "سی", "چهل", "پنجاه")
        val digits = listOf("0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣")

        return (1..count).map { n ->
            val en = if (n <= 19) {
                oneToNineteen[n - 1]
            } else {
                val t = n / 10
                val o = n % 10
                if (o == 0) tensEn[t] else "${tensEn[t]}-${oneToNineteen[o - 1].lowercase()}"
            }

            val fa = when {
                n < 10 -> unitsFa[n]
                n < 20 -> teensFa[n - 10]
                else -> {
                    val t = n / 10
                    val o = n % 10
                    if (o == 0) tensFa[t] else "${tensFa[t]} و ${unitsFa[o]}"
                }
            }

            val emoji = when {
                n == 10 -> "🔟"
                n < 10 -> digits[n]
                else -> "${digits[n / 10]}${digits[n % 10]}"
            }

            WordItem(
                id = "numbers_$n",
                english = en,
                persian = fa,
                emoji = emoji,
                categoryId = CategoryId.NUMBERS
            )
        }
    }

    val categories = listOf(
        CategoryInfo(
            id = CategoryId.ANIMALS,
            title = "Animals",
            persianTitle = "حیوانات",
            emoji = "🐾",
            gradientStart = Color(0xFFFBBF24),
            gradientEnd = Color(0xFFF97316),
            accentColor = Color(0xFFEA580C),
            words = buildUniqueWords(CategoryId.ANIMALS, animalEntries)
        ),
        CategoryInfo(
            id = CategoryId.FRUITS,
            title = "Fruits",
            persianTitle = "میوه‌ها",
            emoji = "🍎",
            gradientStart = Color(0xFFFB7185),
            gradientEnd = Color(0xFFEC4899),
            accentColor = Color(0xFFE11D48),
            words = buildUniqueWords(CategoryId.FRUITS, fruitEntries)
        ),
        CategoryInfo(
            id = CategoryId.COLORS,
            title = "Colors",
            persianTitle = "رنگ‌ها",
            emoji = "🎨",
            gradientStart = Color(0xFF38BDF8),
            gradientEnd = Color(0xFF6366F1),
            accentColor = Color(0xFF2563EB),
            words = buildUniqueWords(CategoryId.COLORS, colorEntries)
        ),
        CategoryInfo(
            id = CategoryId.NUMBERS,
            title = "Numbers",
            persianTitle = "اعداد",
            emoji = "🔢",
            gradientStart = Color(0xFF34D399),
            gradientEnd = Color(0xFF14B8A6),
            accentColor = Color(0xFF059669),
            words = generateNumbers(50)
        ),
        CategoryInfo(
            id = CategoryId.OBJECTS,
            title = "Objects",
            persianTitle = "اشیا",
            emoji = "🪑",
            gradientStart = Color(0xFFA855F7),
            gradientEnd = Color(0xFFD946EF),
            accentColor = Color(0xFF9333EA),
            words = buildUniqueWords(CategoryId.OBJECTS, objectEntries)
        )
    )

    val allWords: List<WordItem> = categories.flatMap { it.words }

    fun wordsForFilter(categoryId: CategoryId?): List<WordItem> {
        return if (categoryId == null) {
            allWords
        } else {
            categories.firstOrNull { it.id == categoryId }?.words ?: allWords
        }
    }

    fun filterTitle(categoryId: CategoryId?): String {
        return if (categoryId == null) {
            "🌟 All Words"
        } else {
            val cat = categories.firstOrNull { it.id == categoryId }
            if (cat != null) "${cat.emoji} ${cat.title}" else "🌟 All Words"
        }
    }

    val alphabetItems = listOf(
        AlphabetItem("A", "Aa", "Apple", "سیب", "🍎"),
        AlphabetItem("B", "Bb", "Ball", "توپ", "⚽"),
        AlphabetItem("C", "Cc", "Cat", "گربه", "🐱"),
        AlphabetItem("D", "Dd", "Dog", "سگ", "🐶"),
        AlphabetItem("E", "Ee", "Elephant", "فیل", "🐘"),
        AlphabetItem("F", "Ff", "Fish", "ماهی", "🐟"),
        AlphabetItem("G", "Gg", "Grapes", "انگور", "🍇"),
        AlphabetItem("H", "Hh", "House", "خانه", "🏠"),
        AlphabetItem("I", "Ii", "Ice Cream", "بستنی", "🍦"),
        AlphabetItem("J", "Jj", "Juice", "آبمیوه", "🧃"),
        AlphabetItem("K", "Kk", "Kite", "بادبادک", "🪁"),
        AlphabetItem("L", "Ll", "Lion", "شیر", "🦁"),
        AlphabetItem("M", "Mm", "Monkey", "میمون", "🐵"),
        AlphabetItem("N", "Nn", "Nest", "لانه", "🪹"),
        AlphabetItem("O", "Oo", "Orange", "پرتقال", "🍊"),
        AlphabetItem("P", "Pp", "Panda", "پاندا", "🐼"),
        AlphabetItem("Q", "Qq", "Queen", "ملکه", "👑"),
        AlphabetItem("R", "Rr", "Rabbit", "خرگوش", "🐰"),
        AlphabetItem("S", "Ss", "Sun", "خورشید", "☀️"),
        AlphabetItem("T", "Tt", "Tiger", "ببر", "🐯"),
        AlphabetItem("U", "Uu", "Umbrella", "چتر", "☂️"),
        AlphabetItem("V", "Vv", "Violin", "ویولن", "🎻"),
        AlphabetItem("W", "Ww", "Whale", "نهنگ", "🐳"),
        AlphabetItem("X", "Xx", "Xylophone", "زیلوفون", "🎶"),
        AlphabetItem("Y", "Yy", "Yellow", "زرد", "🟡"),
        AlphabetItem("Z", "Zz", "Zebra", "گورخر", "🦓")
    )

    val rewardBadges = listOf(
        RewardBadge(
            id = "first_star",
            title = "First Star",
            persianTitle = "اولین ستاره",
            description = "Earn your very first star in any game!",
            emoji = "🌟",
            requiredStars = 1
        ),
        RewardBadge(
            id = "first_10_stars",
            title = "First 10 Stars",
            persianTitle = "۱۰ ستاره اول",
            description = "Collect 10 stars across games!",
            emoji = "⭐",
            requiredStars = 10
        ),
        RewardBadge(
            id = "alphabet_explorer",
            title = "Alphabet Explorer",
            persianTitle = "کاشف الفبا",
            description = "Listen to at least 10 letters in Alphabet A–Z!",
            emoji = "🔤",
            requiredAlphabetCount = 10
        ),
        RewardBadge(
            id = "game_master",
            title = "Game Master",
            persianTitle = "استاد بازی‌ها",
            description = "Earn stars in all 4 learning games!",
            emoji = "🎮",
            requiredGamesPlayed = 4
        ),
        RewardBadge(
            id = "super_star_50",
            title = "Super Star",
            persianTitle = "ابَرستاره",
            description = "Collect 50 stars!",
            emoji = "🏅",
            requiredStars = 50
        ),
        RewardBadge(
            id = "english_champion",
            title = "English Champion",
            persianTitle = "قهرمان انگلیسی",
            description = "Collect 100 stars!",
            emoji = "👑",
            requiredStars = 100
        )
    )
}
