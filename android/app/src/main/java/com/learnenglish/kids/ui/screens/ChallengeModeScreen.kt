package com.learnenglish.kids.ui.screens

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.learnenglish.kids.data.VocabularyRepository
import com.learnenglish.kids.data.WordItem
import com.learnenglish.kids.ui.components.ConfettiOverlay
import com.learnenglish.kids.ui.components.FantasyBackground
import com.learnenglish.kids.ui.components.FantasyTheme
import com.learnenglish.kids.ui.components.KidScreenTopBar
import com.learnenglish.kids.ui.components.RtlPersianText
import com.learnenglish.kids.ui.components.StarPopBanner
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private const val CHALLENGE_TOTAL_QUESTIONS = 10
private const val CHALLENGE_TIME_LIMIT_SECONDS = 120
private const val CHALLENGE_PERFECT_BONUS_STARS = 5

private enum class ChallengeQuestionKind {
    PERSIAN_TO_ENGLISH,
    SCRAMBLED_SPELLING,
    AUDIO_TO_EMOJI,
    MISSING_LETTER
}

private sealed interface ChallengeQuestion {
    val word: WordItem

    data class PersianToEnglish(
        override val word: WordItem,
        val options: List<WordItem>
    ) : ChallengeQuestion

    data class ScrambledSpelling(
        override val word: WordItem
    ) : ChallengeQuestion

    data class AudioToEmoji(
        override val word: WordItem,
        val options: List<WordItem>
    ) : ChallengeQuestion

    data class MissingLetter(
        override val word: WordItem,
        val missingIndex: Int,
        val missingChar: Char,
        val letterOptions: List<Char>
    ) : ChallengeQuestion
}

private data class ChallengeTile(
    val index: Int,
    val char: Char,
    val used: Boolean = false
)

private data class ChallengeTierOutcome(
    val emoji: String,
    val headline: String,
    val persianNote: String,
    val accentColor: Color
)

private val CHALLENGE_WORD_REGEX = Regex("^[A-Za-z]{4,10}$")
private val CHALLENGE_FALLBACK_WORD_REGEX = Regex("^[A-Za-z]{3,10}$")
private val CHALLENGE_ALPHABET = ('A'..'Z').toList()

private fun pickFourChallengeOptions(
    target: WordItem,
    allWords: List<WordItem>,
    requireDistinctEmoji: Boolean
): List<WordItem> {
    val sameCat = allWords.filter {
        it.id != target.id &&
            it.categoryId == target.categoryId &&
            !it.english.equals(target.english, ignoreCase = true)
    }.shuffled()
    val otherCat = allWords.filter {
        it.id != target.id &&
            it.categoryId != target.categoryId &&
            !it.english.equals(target.english, ignoreCase = true)
    }.shuffled()

    val distractors = mutableListOf<WordItem>()
    val seenEn = mutableSetOf(target.english.lowercase())
    val seenEmojis = mutableSetOf(target.emoji)

    for (candidate in sameCat + otherCat) {
        val key = candidate.english.lowercase()
        if (key in seenEn) continue
        if (requireDistinctEmoji && candidate.emoji in seenEmojis) continue
        seenEn.add(key)
        seenEmojis.add(candidate.emoji)
        distractors.add(candidate)
        if (distractors.size == 3) break
    }

    return (listOf(target) + distractors).shuffled()
}

private fun buildMissingLetterQuestion(word: WordItem): ChallengeQuestion.MissingLetter {
    val upper = word.english.uppercase()
    val interiorIndices = if (upper.length > 2) (1 until upper.length - 1).toList() else upper.indices.toList()
    val missingIndex = interiorIndices.random()
    val missingChar = upper[missingIndex]
    val wrongLetters = CHALLENGE_ALPHABET.filter { it != missingChar }.shuffled().take(2)
    return ChallengeQuestion.MissingLetter(
        word = word,
        missingIndex = missingIndex,
        missingChar = missingChar,
        letterOptions = (listOf(missingChar) + wrongLetters).shuffled()
    )
}

private fun generateHardQuestions(): List<ChallengeQuestion> {
    val all = VocabularyRepository.allWords
    val baseKinds = ChallengeQuestionKind.entries.toList()
    val extraKinds = baseKinds.shuffled().take(2)
    val plannedKinds = (baseKinds + baseKinds + extraKinds).shuffled().take(CHALLENGE_TOTAL_QUESTIONS)

    val emojiCounts = all.groupingBy { it.emoji }.eachCount()
    val singleWordPool = all.filter { CHALLENGE_WORD_REGEX.matches(it.english) }.shuffled()
    val singleFallbackPool = all.filter { CHALLENGE_FALLBACK_WORD_REGEX.matches(it.english) }.shuffled()
    val uniqueEmojiPool = all.filter { (emojiCounts[it.emoji] ?: 0) == 1 }.shuffled()
    val generalPool = all.shuffled()

    val usedWordIds = mutableSetOf<String>()

    fun takeWord(vararg pools: List<WordItem>): WordItem {
        for (pool in pools) {
            val match = pool.firstOrNull { it.id !in usedWordIds }
            if (match != null) {
                usedWordIds.add(match.id)
                return match
            }
        }
        val fallback = all.firstOrNull { it.id !in usedWordIds } ?: all.first()
        usedWordIds.add(fallback.id)
        return fallback
    }

    return plannedKinds.map { kind ->
        when (kind) {
            ChallengeQuestionKind.SCRAMBLED_SPELLING -> {
                val target = takeWord(singleWordPool, singleFallbackPool, generalPool)
                ChallengeQuestion.ScrambledSpelling(target)
            }
            ChallengeQuestionKind.MISSING_LETTER -> {
                val target = takeWord(singleWordPool, singleFallbackPool, generalPool)
                buildMissingLetterQuestion(target)
            }
            ChallengeQuestionKind.AUDIO_TO_EMOJI -> {
                val target = takeWord(uniqueEmojiPool, generalPool)
                ChallengeQuestion.AudioToEmoji(
                    word = target,
                    options = pickFourChallengeOptions(target, all, requireDistinctEmoji = true)
                )
            }
            ChallengeQuestionKind.PERSIAN_TO_ENGLISH -> {
                val target = takeWord(generalPool)
                ChallengeQuestion.PersianToEnglish(
                    word = target,
                    options = pickFourChallengeOptions(target, all, requireDistinctEmoji = false)
                )
            }
        }
    }
}

private fun makeScrambledChallengeTiles(word: String): List<ChallengeTile> {
    val upper = word.uppercase()
    var chars = upper.toList().shuffled()
    if (chars.size > 1 && chars.joinToString("") == upper) {
        chars = chars.drop(1) + chars.first()
    }
    return chars.mapIndexed { idx, c -> ChallengeTile(index = idx, char = c) }
}

private fun formatTimer(seconds: Int): String {
    val m = seconds / 60
    val s = seconds % 60
    return "$m:${s.toString().padStart(2, '0')}"
}

private fun tierOutcomeForScore(score: Int): ChallengeTierOutcome = when (score) {
    10 -> ChallengeTierOutcome(
        emoji = "🏆",
        headline = "Champion! 10 / 10!",
        persianNote = "فوق‌العاده! قهرمان سوالات سخت شدی! (+۵ ستاره جایزه)",
        accentColor = Color(0xFFDC2626)
    )
    9 -> ChallengeTierOutcome("🌟", "Amazing Job!", "عالی بود! فقط یک قدم تا نمره کامل!", Color(0xFFD97706))
    8 -> ChallengeTierOutcome("😃", "Great Work!", "آفرین! خیلی خوب جواب دادی!", Color(0xFF059669))
    7 -> ChallengeTierOutcome("😊", "Nice Effort!", "خوب بود! ادامه بده!", Color(0xFF0284C7))
    6 -> ChallengeTierOutcome("😐", "Not Bad!", "بد نبود، دفعه بعد بهتر می‌شی!", Color(0xFF4F46E5))
    5 -> ChallengeTierOutcome("🫤", "Halfway There!", "نصف سوال‌ها رو درست زدی، تمرین بیشتر کن!", Color(0xFFB45309))
    4 -> ChallengeTierOutcome("😕", "Keep Practicing!", "می‌تونی خیلی بهتر از این بشی!", Color(0xFFEA580C))
    3 -> ChallengeTierOutcome("😢", "Tricky Challenge!", "سوالات سخت بودن، دوباره امتحان کن!", Color(0xFFE11D48))
    2 -> ChallengeTierOutcome("🥺", "Almost Got It!", "ناامید نشو، یه بار دیگه بازی کن!", Color(0xFFE11D48))
    1 -> ChallengeTierOutcome("🫠", "Tough Round!", "کلمه‌ها رو مرور کن و دوباره برگرد!", Color(0xFFBE123C))
    else -> ChallengeTierOutcome("💪", "Keep Going!", "بیشتر تلاش کن", Color(0xFFBE123C))
}

@Composable
private fun RedTrophyBadge() {
    val transition = rememberInfiniteTransition(label = "redTrophyAnim")
    val bounceY by transition.animateFloat(
        initialValue = 0f,
        targetValue = -10f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 700, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "redTrophyBounce"
    )
    val glowScale by transition.animateFloat(
        initialValue = 0.94f,
        targetValue = 1.12f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 850, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "redTrophyGlow"
    )

    Box(
        modifier = Modifier
            .size(148.dp)
            .offset(y = bounceY.dp),
        contentAlignment = Alignment.Center
    ) {
        // Glowing red aura
        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .graphicsLayer {
                    scaleX = glowScale
                    scaleY = glowScale
                }
        ) {
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(Color(0x99EF4444), Color(0x44F59E0B), Color.Transparent)
                ),
                radius = size.minDimension / 2f
            )
        }

        // Ruby-red circular medallion + painted Red Trophy
        Box(
            modifier = Modifier
                .size(118.dp)
                .clip(CircleShape)
                .background(
                    Brush.linearGradient(
                        listOf(Color(0xFFEF4444), Color(0xFFE11D48), Color(0xFF991B1B))
                    )
                )
                .border(4.dp, Color(0xFFFECACA), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Canvas(modifier = Modifier.size(74.dp)) {
                val w = size.width
                val h = size.height

                // Left & right handles
                drawArc(
                    color = Color(0xFFFECACA),
                    startAngle = 90f,
                    sweepAngle = 180f,
                    useCenter = false,
                    topLeft = Offset(w * 0.06f, h * 0.16f),
                    size = Size(w * 0.24f, h * 0.28f),
                    style = Stroke(width = 7f, cap = StrokeCap.Round)
                )
                drawArc(
                    color = Color(0xFFFECACA),
                    startAngle = -90f,
                    sweepAngle = 180f,
                    useCenter = false,
                    topLeft = Offset(w * 0.70f, h * 0.16f),
                    size = Size(w * 0.24f, h * 0.28f),
                    style = Stroke(width = 7f, cap = StrokeCap.Round)
                )

                // Red Trophy Cup body
                val cupPath = Path().apply {
                    moveTo(w * 0.24f, h * 0.14f)
                    lineTo(w * 0.76f, h * 0.14f)
                    lineTo(w * 0.76f, h * 0.36f)
                    cubicTo(w * 0.76f, h * 0.56f, w * 0.62f, h * 0.66f, w * 0.50f, h * 0.66f)
                    cubicTo(w * 0.38f, h * 0.66f, w * 0.24f, h * 0.56f, w * 0.24f, h * 0.36f)
                    close()
                }
                drawPath(
                    path = cupPath,
                    brush = Brush.linearGradient(listOf(Color(0xFFFCA5A5), Color(0xFFDC2626)))
                )
                drawPath(
                    path = cupPath,
                    color = Color(0xFFFEE2E2),
                    style = Stroke(width = 4f, join = StrokeJoin.Round)
                )

                // Stem and base
                drawRoundRect(
                    color = Color(0xFFFECACA),
                    topLeft = Offset(w * 0.43f, h * 0.65f),
                    size = Size(w * 0.14f, h * 0.14f),
                    cornerRadius = CornerRadius(4f, 4f)
                )
                drawRoundRect(
                    color = Color(0xFFFEF2F2),
                    topLeft = Offset(w * 0.28f, h * 0.78f),
                    size = Size(w * 0.44f, h * 0.12f),
                    cornerRadius = CornerRadius(8f, 8f)
                )
            }

            Text(
                text = "🏆",
                fontSize = 26.sp,
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(4.dp)
            )
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ChallengeModeScreen(
    totalStars: Int,
    bestScore: Int,
    onAddChallengeStars: (Int) -> Unit,
    onUpdateBestScore: (Int) -> Unit,
    onSpeakWord: (String) -> Unit,
    onPlayDing: () -> Unit,
    onPlayWrong: () -> Unit,
    onPlayWin: () -> Unit,
    onBack: () -> Unit
) {
    val scope = rememberCoroutineScope()
    val scrollState = rememberScrollState()

    var attemptId by remember { mutableIntStateOf(0) }
    var questions by remember { mutableStateOf(generateHardQuestions()) }
    var questionIndex by remember { mutableIntStateOf(0) }
    var challengeScore by remember { mutableIntStateOf(0) }
    var timeLeft by remember { mutableIntStateOf(CHALLENGE_TIME_LIMIT_SECONDS) }
    var isFinished by remember { mutableStateOf(false) }
    var isTimeUp by remember { mutableStateOf(false) }
    var isNewRecord by remember { mutableStateOf(false) }
    var bonusAwarded by remember { mutableStateOf(false) }

    var selectedOptionId by remember { mutableStateOf<String?>(null) }
    var selectedMissingLetter by remember { mutableStateOf<Char?>(null) }
    var roundOutcome by remember { mutableStateOf("idle") } // idle, correct, wrong
    var showStar by remember { mutableStateOf(false) }

    val currentQuestion = questions[questionIndex]
    var tiles by remember(attemptId, questionIndex) {
        mutableStateOf(
            if (currentQuestion is ChallengeQuestion.ScrambledSpelling) {
                makeScrambledChallengeTiles(currentQuestion.word.english)
            } else {
                emptyList()
            }
        )
    }
    var boxes by remember(attemptId, questionIndex) {
        mutableStateOf(
            if (currentQuestion is ChallengeQuestion.ScrambledSpelling) {
                List<Int?>(currentQuestion.word.english.length) { null }
            } else {
                emptyList()
            }
        )
    }

    // 2-minute countdown timer driven by LaunchedEffect
    LaunchedEffect(attemptId, isFinished) {
        if (isFinished) return@LaunchedEffect
        while (timeLeft > 0 && !isFinished) {
            delay(1000L)
            if (isFinished) break
            timeLeft -= 1
            if (timeLeft <= 0) {
                isTimeUp = true
                isFinished = true
                showStar = false
                onPlayWrong()
                if (challengeScore > bestScore) {
                    isNewRecord = true
                    onUpdateBestScore(challengeScore)
                }
            }
        }
    }

    // Auto-play English audio on Audio Recognition questions
    LaunchedEffect(attemptId, questionIndex, isFinished) {
        if (isFinished || isTimeUp || timeLeft <= 0) return@LaunchedEffect
        val q = questions.getOrNull(questionIndex)
        if (q is ChallengeQuestion.AudioToEmoji) {
            delay(220L)
            if (!isFinished && !isTimeUp && timeLeft > 0) {
                onSpeakWord(q.word.english)
            }
        }
    }

    fun finalizeChallenge(finalScore: Int) {
        isTimeUp = false
        isFinished = true
        showStar = false
        if (finalScore > bestScore) {
            isNewRecord = true
            onUpdateBestScore(finalScore)
        }
        if (finalScore == CHALLENGE_TOTAL_QUESTIONS) {
            bonusAwarded = true
            onAddChallengeStars(CHALLENGE_PERFECT_BONUS_STARS)
            onPlayWin()
        } else if (finalScore >= 7) {
            onPlayWin()
        }
    }

    fun moveToNextOrFinish(updatedScore: Int) {
        scope.launch {
            delay(950L)
            if (isFinished || timeLeft <= 0) return@launch
            showStar = false
            selectedOptionId = null
            selectedMissingLetter = null
            roundOutcome = "idle"
            if (questionIndex + 1 >= CHALLENGE_TOTAL_QUESTIONS) {
                finalizeChallenge(updatedScore)
            } else {
                questionIndex += 1
            }
        }
    }

    val controlsEnabled = !isFinished && !isTimeUp && timeLeft > 0
    val displayedBest = maxOf(bestScore, if (isFinished) challengeScore else 0)
    val isPerfectScore = isFinished && challengeScore == CHALLENGE_TOTAL_QUESTIONS
    val tier = tierOutcomeForScore(challengeScore)
    val completedProgress = if (isFinished) 1f else questionIndex / CHALLENGE_TOTAL_QUESTIONS.toFloat()

    FantasyBackground(theme = FantasyTheme.CHALLENGE) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            KidScreenTopBar(
                title = "🏆 Challenge Mode",
                score = totalStars,
                onBack = onBack
            )

            // Best Score & Timer Bar
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = Color.White,
                shadowElevation = 4.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 14.dp, vertical = 10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = Color(0xFFFEF3C7)
                    ) {
                        Text(
                            text = "🏆 Best Score: $displayedBest/10",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color(0xFF92400E),
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                        )
                    }

                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = when {
                            timeLeft <= 15 -> Color(0xFFFFE4E6)
                            timeLeft <= 30 -> Color(0xFFFEF3C7)
                            else -> Color(0xFFE0E7FF)
                        }
                    ) {
                        Text(
                            text = "⏱ ${formatTimer(timeLeft)}",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = when {
                                timeLeft <= 15 -> Color(0xFFBE123C)
                                timeLeft <= 30 -> Color(0xFFB45309)
                                else -> Color(0xFF3730A3)
                            },
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            LinearProgressIndicator(
                progress = { completedProgress },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(14.dp)
                    .clip(RoundedCornerShape(10.dp)),
                color = Color(0xFFE11D48),
                trackColor = Color.White
            )
            Spacer(modifier = Modifier.height(6.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Question ${minOf(questionIndex + 1, CHALLENGE_TOTAL_QUESTIONS)} / $CHALLENGE_TOTAL_QUESTIONS",
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF334155)
                )
                Text(
                    text = "Score: $challengeScore / $CHALLENGE_TOTAL_QUESTIONS",
                    fontWeight = FontWeight.ExtraBold,
                    color = Color(0xFFBE123C)
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            if (isFinished) {
                Surface(
                    shape = RoundedCornerShape(30.dp),
                    color = Color.White,
                    shadowElevation = 10.dp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(26.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        if (isTimeUp) {
                            Surface(
                                shape = RoundedCornerShape(16.dp),
                                color = Color(0xFFFFE4E6),
                                modifier = Modifier.padding(bottom = 12.dp)
                            ) {
                                Column(
                                    modifier = Modifier.padding(horizontal = 18.dp, vertical = 8.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Text(
                                        text = "⏰ Time's Up!",
                                        fontSize = 22.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        color = Color(0xFFBE123C)
                                    )
                                    RtlPersianText(
                                        text = "وقت تمام شد!",
                                        fontSize = 15.sp,
                                        color = Color(0xFFE11D48)
                                    )
                                }
                            }
                        }

                        if (isPerfectScore) {
                            RedTrophyBadge()
                        } else {
                            Text(text = tier.emoji, fontSize = 88.sp)
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        Text(
                            text = tier.headline,
                            fontSize = 30.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = tier.accentColor
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Surface(
                            shape = RoundedCornerShape(16.dp),
                            color = Color(0xFFF1F5F9)
                        ) {
                            Text(
                                text = "$challengeScore / $CHALLENGE_TOTAL_QUESTIONS",
                                fontSize = 28.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color(0xFF0F172A),
                                modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        RtlPersianText(
                            text = tier.persianNote,
                            fontSize = 22.sp,
                            color = Color(0xFF1E293B),
                            modifier = Modifier.fillMaxWidth()
                        )

                        if (bonusAwarded) {
                            Spacer(modifier = Modifier.height(12.dp))
                            Surface(
                                shape = RoundedCornerShape(16.dp),
                                color = Color(0xFFEF4444)
                            ) {
                                Text(
                                    text = "⭐ +$CHALLENGE_PERFECT_BONUS_STARS Bonus Stars Added!",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = Color.White,
                                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Surface(
                                shape = RoundedCornerShape(14.dp),
                                color = Color(0xFFFEF3C7)
                            ) {
                                Text(
                                    text = "🏆 Best Score: $displayedBest/10",
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF92400E),
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 7.dp)
                                )
                            }
                            if (isNewRecord) {
                                Surface(
                                    shape = RoundedCornerShape(14.dp),
                                    color = Color(0xFFD1FAE5)
                                ) {
                                    Text(
                                        text = "🎉 New Record!",
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFF047857),
                                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 7.dp)
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(22.dp))

                        Button(
                            onClick = {
                                questions = generateHardQuestions()
                                questionIndex = 0
                                challengeScore = 0
                                timeLeft = CHALLENGE_TIME_LIMIT_SECONDS
                                isFinished = false
                                isTimeUp = false
                                isNewRecord = false
                                bonusAwarded = false
                                selectedOptionId = null
                                selectedMissingLetter = null
                                roundOutcome = "idle"
                                showStar = false
                                attemptId += 1
                            },
                            shape = RoundedCornerShape(20.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE11D48)),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(56.dp)
                        ) {
                            Text(
                                text = "Play Again · دوباره بازی کن",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color.White
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Button(
                            onClick = onBack,
                            shape = RoundedCornerShape(20.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFFF1F5F9),
                                contentColor = Color(0xFF0F172A)
                            ),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(52.dp)
                        ) {
                            Text("Home", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            } else {
                val categoryInfo = VocabularyRepository.categories.first {
                    it.id == currentQuestion.word.categoryId
                }

                Surface(
                    shape = RoundedCornerShape(28.dp),
                    color = when (roundOutcome) {
                        "correct" -> Color(0xFFD1FAE5)
                        "wrong" -> Color(0xFFFFE4E6)
                        else -> Color.White
                    },
                    shadowElevation = 8.dp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(22.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = Color(0xFFE0E7FF)
                            ) {
                                Text(
                                    text = "${categoryInfo.emoji} ${categoryInfo.title}",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF3730A3),
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                                )
                            }
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = Color(0xFFFFE4E6)
                            ) {
                                Text(
                                    text = when (currentQuestion) {
                                        is ChallengeQuestion.PersianToEnglish -> "Reverse Translation"
                                        is ChallengeQuestion.ScrambledSpelling -> "Scrambled Letters"
                                        is ChallengeQuestion.AudioToEmoji -> "Audio Recognition"
                                        is ChallengeQuestion.MissingLetter -> "Missing Letter"
                                    },
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFFBE123C),
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        when (currentQuestion) {
                            is ChallengeQuestion.PersianToEnglish -> {
                                RtlPersianText(
                                    text = currentQuestion.word.persian,
                                    fontSize = 36.sp,
                                    color = Color(0xFF0F172A),
                                    fontWeight = FontWeight.ExtraBold,
                                    modifier = Modifier.fillMaxWidth()
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = "Pick the matching English word!",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF64748B)
                                )
                            }

                            is ChallengeQuestion.ScrambledSpelling -> {
                                Text(
                                    text = currentQuestion.word.emoji,
                                    fontSize = 68.sp
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                RtlPersianText(
                                    text = currentQuestion.word.persian,
                                    fontSize = 30.sp,
                                    color = Color(0xFF0F172A),
                                    fontWeight = FontWeight.ExtraBold,
                                    modifier = Modifier.fillMaxWidth()
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = "Tap the scrambled letters in the right order!",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF64748B)
                                )
                            }

                            is ChallengeQuestion.AudioToEmoji -> {
                                Button(
                                    onClick = {
                                        if (controlsEnabled) {
                                            onSpeakWord(currentQuestion.word.english)
                                        }
                                    },
                                    enabled = controlsEnabled,
                                    shape = RoundedCornerShape(20.dp),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = Color(0xFF0284C7),
                                        contentColor = Color.White
                                    ),
                                    modifier = Modifier.height(62.dp)
                                ) {
                                    Text(
                                        text = "🔊 Listen & Pick Emoji",
                                        fontSize = 20.sp,
                                        fontWeight = FontWeight.ExtraBold
                                    )
                                }
                                Spacer(modifier = Modifier.height(10.dp))
                                RtlPersianText(
                                    text = "به تلفظ گوش بده و شکل درست را انتخاب کن!",
                                    fontSize = 17.sp,
                                    color = Color(0xFF475569),
                                    modifier = Modifier.fillMaxWidth()
                                )
                            }

                            is ChallengeQuestion.MissingLetter -> {
                                Text(
                                    text = currentQuestion.word.emoji,
                                    fontSize = 68.sp
                                )
                                Spacer(modifier = Modifier.height(10.dp))
                                FlowRow(
                                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                                    verticalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    currentQuestion.word.english.uppercase().forEachIndexed { idx, ch ->
                                        val isBlank = idx == currentQuestion.missingIndex
                                        val revealed = isBlank && (roundOutcome == "correct" || roundOutcome == "wrong")
                                        Box(
                                            modifier = Modifier
                                                .size(width = 40.dp, height = 48.dp)
                                                .clip(RoundedCornerShape(12.dp))
                                                .background(
                                                    when {
                                                        isBlank && roundOutcome == "correct" -> Color(0xFF10B981)
                                                        isBlank && roundOutcome == "wrong" -> Color(0xFFEF4444)
                                                        isBlank -> Color(0xFFFEF3C7)
                                                        else -> Color(0xFFF1F5F9)
                                                    }
                                                )
                                                .border(
                                                    width = 2.dp,
                                                    color = when {
                                                        isBlank && roundOutcome == "correct" -> Color(0xFF059669)
                                                        isBlank && roundOutcome == "wrong" -> Color(0xFFDC2626)
                                                        isBlank -> Color(0xFFF59E0B)
                                                        else -> Color(0xFFCBD5E1)
                                                    },
                                                    shape = RoundedCornerShape(12.dp)
                                                ),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Text(
                                                text = if (isBlank && !revealed) "_" else ch.toString(),
                                                fontSize = 22.sp,
                                                fontWeight = FontWeight.ExtraBold,
                                                color = if (isBlank && (roundOutcome == "correct" || roundOutcome == "wrong")) {
                                                    Color.White
                                                } else if (isBlank) {
                                                    Color(0xFFB45309)
                                                } else {
                                                    Color(0xFF0F172A)
                                                }
                                            )
                                        }
                                    }
                                }
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = "Tap the missing letter!",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF64748B)
                                )
                            }
                        }

                        if (roundOutcome == "wrong") {
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = if (currentQuestion is ChallengeQuestion.AudioToEmoji) {
                                    "Correct Answer: ${currentQuestion.word.emoji} ${currentQuestion.word.english}"
                                } else {
                                    "Correct Answer: ${currentQuestion.word.english}"
                                },
                                fontSize = 18.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color(0xFFBE123C)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))
                StarPopBanner(visible = showStar, label = "${currentQuestion.word.english}! +1 ⭐")
                Spacer(modifier = Modifier.height(10.dp))

                when (currentQuestion) {
                    is ChallengeQuestion.PersianToEnglish -> {
                        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            currentQuestion.options.chunked(2).forEach { rowOptions ->
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                                ) {
                                    rowOptions.forEach { option ->
                                        val isAnswer = option.id == currentQuestion.word.id
                                        val isPicked = selectedOptionId == option.id
                                        val bgColor = when {
                                            roundOutcome == "idle" -> Color.White
                                            isAnswer -> Color(0xFF10B981)
                                            isPicked -> Color(0xFFEF4444)
                                            else -> Color(0xFFF1F5F9)
                                        }
                                        val fgColor = if (roundOutcome != "idle" && (isAnswer || isPicked)) {
                                            Color.White
                                        } else {
                                            Color(0xFF0F172A)
                                        }

                                        Button(
                                            onClick = {
                                                if (!controlsEnabled || roundOutcome != "idle") return@Button
                                                selectedOptionId = option.id
                                                if (isAnswer) {
                                                    val nextScore = challengeScore + 1
                                                    challengeScore = nextScore
                                                    roundOutcome = "correct"
                                                    showStar = true
                                                    onPlayDing()
                                                    onSpeakWord(currentQuestion.word.english)
                                                    onAddChallengeStars(1)
                                                    moveToNextOrFinish(nextScore)
                                                } else {
                                                    roundOutcome = "wrong"
                                                    onPlayWrong()
                                                    moveToNextOrFinish(challengeScore)
                                                }
                                            },
                                            enabled = controlsEnabled && roundOutcome == "idle",
                                            shape = RoundedCornerShape(22.dp),
                                            colors = ButtonDefaults.buttonColors(
                                                containerColor = bgColor,
                                                contentColor = fgColor,
                                                disabledContainerColor = bgColor,
                                                disabledContentColor = fgColor
                                            ),
                                            elevation = ButtonDefaults.buttonElevation(defaultElevation = 6.dp),
                                            modifier = Modifier
                                                .weight(1f)
                                                .height(78.dp)
                                        ) {
                                            Text(
                                                text = option.english,
                                                fontSize = 20.sp,
                                                fontWeight = FontWeight.ExtraBold
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }

                    is ChallengeQuestion.AudioToEmoji -> {
                        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            currentQuestion.options.chunked(2).forEach { rowOptions ->
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                                ) {
                                    rowOptions.forEach { option ->
                                        val isAnswer = option.id == currentQuestion.word.id
                                        val isPicked = selectedOptionId == option.id
                                        val bgColor = when {
                                            roundOutcome == "idle" -> Color.White
                                            isAnswer -> Color(0xFF10B981)
                                            isPicked -> Color(0xFFEF4444)
                                            else -> Color(0xFFF1F5F9)
                                        }

                                        Button(
                                            onClick = {
                                                if (!controlsEnabled || roundOutcome != "idle") return@Button
                                                selectedOptionId = option.id
                                                if (isAnswer) {
                                                    val nextScore = challengeScore + 1
                                                    challengeScore = nextScore
                                                    roundOutcome = "correct"
                                                    showStar = true
                                                    onPlayDing()
                                                    onSpeakWord(currentQuestion.word.english)
                                                    onAddChallengeStars(1)
                                                    moveToNextOrFinish(nextScore)
                                                } else {
                                                    roundOutcome = "wrong"
                                                    onPlayWrong()
                                                    moveToNextOrFinish(challengeScore)
                                                }
                                            },
                                            enabled = controlsEnabled && roundOutcome == "idle",
                                            shape = RoundedCornerShape(24.dp),
                                            colors = ButtonDefaults.buttonColors(
                                                containerColor = bgColor,
                                                disabledContainerColor = bgColor
                                            ),
                                            elevation = ButtonDefaults.buttonElevation(defaultElevation = 6.dp),
                                            modifier = Modifier
                                                .weight(1f)
                                                .height(106.dp)
                                        ) {
                                            Text(
                                                text = option.emoji,
                                                fontSize = 52.sp
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }

                    is ChallengeQuestion.MissingLetter -> {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            currentQuestion.letterOptions.forEach { letter ->
                                val isAnswer = letter == currentQuestion.missingChar
                                val isPicked = selectedMissingLetter == letter
                                val bgColor = when {
                                    roundOutcome == "idle" -> Color.White
                                    isAnswer -> Color(0xFF10B981)
                                    isPicked -> Color(0xFFEF4444)
                                    else -> Color(0xFFF1F5F9)
                                }
                                val fgColor = if (roundOutcome != "idle" && (isAnswer || isPicked)) {
                                    Color.White
                                } else {
                                    Color(0xFF0F172A)
                                }

                                Button(
                                    onClick = {
                                        if (!controlsEnabled || roundOutcome != "idle") return@Button
                                        selectedMissingLetter = letter
                                        if (isAnswer) {
                                            val nextScore = challengeScore + 1
                                            challengeScore = nextScore
                                            roundOutcome = "correct"
                                            showStar = true
                                            onPlayDing()
                                            onSpeakWord(currentQuestion.word.english)
                                            onAddChallengeStars(1)
                                            moveToNextOrFinish(nextScore)
                                        } else {
                                            roundOutcome = "wrong"
                                            onPlayWrong()
                                            moveToNextOrFinish(challengeScore)
                                        }
                                    },
                                    enabled = controlsEnabled && roundOutcome == "idle",
                                    shape = RoundedCornerShape(22.dp),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = bgColor,
                                        contentColor = fgColor,
                                        disabledContainerColor = bgColor,
                                        disabledContentColor = fgColor
                                    ),
                                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 6.dp),
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(84.dp)
                                ) {
                                    Text(
                                        text = letter.toString(),
                                        fontSize = 32.sp,
                                        fontWeight = FontWeight.ExtraBold
                                    )
                                }
                            }
                        }
                    }

                    is ChallengeQuestion.ScrambledSpelling -> {
                        FlowRow(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            boxes.forEachIndexed { boxIdx, tileIdx ->
                                val char = tileIdx?.let { idx -> tiles.firstOrNull { it.index == idx }?.char }
                                Box(
                                    modifier = Modifier
                                        .size(width = 44.dp, height = 54.dp)
                                        .clip(RoundedCornerShape(14.dp))
                                        .background(
                                            when (roundOutcome) {
                                                "correct" -> Color(0xFF10B981)
                                                "wrong" -> Color(0xFFFFE4E6)
                                                else -> Color.White
                                            }
                                        )
                                        .border(2.dp, Color(0xFFE11D48), RoundedCornerShape(14.dp))
                                        .clickable(enabled = controlsEnabled && roundOutcome == "idle" && tileIdx != null) {
                                            if (tileIdx != null) {
                                                tiles = tiles.map {
                                                    if (it.index == tileIdx) it.copy(used = false) else it
                                                }
                                                boxes = boxes.toMutableList().apply { this[boxIdx] = null }
                                            }
                                        },
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = char?.toString() ?: "_",
                                        fontSize = 24.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        color = if (roundOutcome == "correct") Color.White else Color(0xFF0F172A)
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(18.dp))

                        FlowRow(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            tiles.forEach { tile ->
                                Button(
                                    onClick = {
                                        if (!controlsEnabled || tile.used || roundOutcome != "idle") return@Button
                                        val nextSlot = boxes.indexOfFirst { it == null }
                                        if (nextSlot == -1) return@Button

                                        val updatedTiles = tiles.map {
                                            if (it.index == tile.index) it.copy(used = true) else it
                                        }
                                        val updatedBoxes = boxes.toMutableList().apply { this[nextSlot] = tile.index }
                                        tiles = updatedTiles
                                        boxes = updatedBoxes

                                        if (updatedBoxes.none { it == null }) {
                                            val spelled = updatedBoxes.map { idx ->
                                                updatedTiles.first { it.index == idx }.char
                                            }.joinToString("")

                                            if (spelled == currentQuestion.word.english.uppercase()) {
                                                val nextScore = challengeScore + 1
                                                challengeScore = nextScore
                                                roundOutcome = "correct"
                                                showStar = true
                                                onPlayDing()
                                                onSpeakWord(currentQuestion.word.english)
                                                onAddChallengeStars(1)
                                                moveToNextOrFinish(nextScore)
                                            } else {
                                                roundOutcome = "wrong"
                                                onPlayWrong()
                                                moveToNextOrFinish(challengeScore)
                                            }
                                        }
                                    },
                                    enabled = controlsEnabled && !tile.used && roundOutcome == "idle",
                                    shape = RoundedCornerShape(14.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE11D48)),
                                    modifier = Modifier.size(width = 50.dp, height = 54.dp)
                                ) {
                                    Text(
                                        text = tile.char.toString(),
                                        fontSize = 22.sp,
                                        fontWeight = FontWeight.ExtraBold
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Button(
                            onClick = {
                                if (!controlsEnabled || roundOutcome != "idle") return@Button
                                tiles = tiles.map { it.copy(used = false) }
                                boxes = List(currentQuestion.word.english.length) { null }
                            },
                            enabled = controlsEnabled && roundOutcome == "idle",
                            shape = RoundedCornerShape(18.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color.White,
                                contentColor = Color(0xFF1E293B)
                            ),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(52.dp)
                        ) {
                            Text("Clear Letters", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
        ConfettiOverlay(active = isPerfectScore)
    }
}
