package com.learnenglish.kids.ui.screens

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.learnenglish.kids.data.CategoryId
import com.learnenglish.kids.data.VocabularyRepository
import com.learnenglish.kids.data.WordItem
import com.learnenglish.kids.ui.components.ConfettiOverlay
import com.learnenglish.kids.ui.components.FantasyBackground
import com.learnenglish.kids.ui.components.FantasyTheme
import com.learnenglish.kids.ui.components.KidScreenTopBar
import com.learnenglish.kids.ui.components.RtlPersianText
import com.learnenglish.kids.ui.components.StarPopBanner
import com.learnenglish.kids.ui.components.bouncyPress
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.math.roundToInt

private const val TOTAL_GUESS_ROUNDS = 30

private data class GuessQuestion(
    val target: WordItem,
    val options: List<WordItem>
)

private fun buildGuessSession(categoryId: CategoryId?): List<GuessQuestion> {
    val pool = VocabularyRepository.wordsForFilter(categoryId)
    return pool.shuffled().take(TOTAL_GUESS_ROUNDS).map { target ->
        val distractors = pool.filter { it.id != target.id }.shuffled().take(3)
        GuessQuestion(target = target, options = (listOf(target) + distractors).shuffled())
    }
}

@Composable
fun GuessWordScreen(
    categoryId: CategoryId?,
    score: Int,
    onAddScore: () -> Unit,
    onSpeakWord: (String) -> Unit,
    onPlayDing: () -> Unit,
    onPlayWrong: () -> Unit,
    onPlayWin: () -> Unit,
    onBack: () -> Unit,
    onGoHome: () -> Unit
) {
    val scope = rememberCoroutineScope()
    var sessionQuestions by remember(categoryId) { mutableStateOf(buildGuessSession(categoryId)) }
    var roundIndex by remember { mutableIntStateOf(0) }
    var sessionStars by remember { mutableIntStateOf(0) }
    var correctSelectedId by remember { mutableStateOf<String?>(null) }
    val wrongIds = remember { mutableStateListOf<String>() }
    var shakingId by remember { mutableStateOf<String?>(null) }
    var feedback by remember { mutableStateOf<String?>(null) }
    var showStar by remember { mutableStateOf(false) }
    var celebrating by remember { mutableStateOf(false) }
    val shakeOffset = remember { Animatable(0f) }

    val question = sessionQuestions[roundIndex]
    val completedCount = if (celebrating) TOTAL_GUESS_ROUNDS else roundIndex

    FantasyBackground(theme = FantasyTheme.GUESS_WORD) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            KidScreenTopBar(title = "🎮 Guess the Word", score = score, onBack = onBack)

            LinearProgressIndicator(
                progress = { completedCount / TOTAL_GUESS_ROUNDS.toFloat() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(14.dp)
                    .clip(RoundedCornerShape(10.dp)),
                color = Color(0xFF10B981),
                trackColor = Color.White
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "Round ${minOf(roundIndex + 1, TOTAL_GUESS_ROUNDS)} / $TOTAL_GUESS_ROUNDS · ${VocabularyRepository.filterTitle(categoryId)}",
                fontWeight = FontWeight.Bold,
                color = Color(0xFF475569)
            )

            Spacer(modifier = Modifier.height(18.dp))

            if (celebrating) {
                Surface(
                    shape = RoundedCornerShape(30.dp),
                    color = Color.White,
                    shadowElevation = 10.dp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("🏆", fontSize = 84.sp)
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            "You Win!",
                            fontSize = 36.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color(0xFF6D28D9)
                        )
                        RtlPersianText("آفرین! هر ۳۰ مرحله را تمام کردی!", fontSize = 20.sp)
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "Final Score: $sessionStars / $TOTAL_GUESS_ROUNDS · ⭐ +$sessionStars",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFD97706)
                        )
                        Spacer(modifier = Modifier.height(24.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            Button(
                                onClick = {
                                    sessionQuestions = buildGuessSession(categoryId)
                                    roundIndex = 0
                                    sessionStars = 0
                                    celebrating = false
                                    correctSelectedId = null
                                    wrongIds.clear()
                                    feedback = null
                                },
                                shape = RoundedCornerShape(20.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),
                                modifier = Modifier.height(54.dp)
                            ) {
                                Text("Play Again", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                            }
                            Button(
                                onClick = onGoHome,
                                shape = RoundedCornerShape(20.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = Color(0xFFF1F5F9),
                                    contentColor = Color(0xFF0F172A)
                                ),
                                modifier = Modifier.height(54.dp)
                            ) {
                                Text("Home", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            } else {
                Surface(
                    shape = RoundedCornerShape(30.dp),
                    color = Color.White,
                    shadowElevation = 8.dp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(28.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(question.target.emoji, fontSize = 96.sp)
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))
                StarPopBanner(visible = showStar, label = "Great! +1 ⭐")
                if (feedback != null) {
                    Text(
                        text = feedback!!,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFE11D48)
                    )
                }

                Spacer(modifier = Modifier.height(18.dp))

                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    question.options.forEach { option ->
                        val interactionSource = remember(option.id) { MutableInteractionSource() }
                        val isCorrect = correctSelectedId == option.id
                        val isWrong = wrongIds.contains(option.id)
                        val isShaking = shakingId == option.id
                        val bgColor = when {
                            isCorrect -> Color(0xFF10B981)
                            isWrong -> Color(0xFFEF4444)
                            else -> Color.White
                        }
                        val textColor = if (isCorrect || isWrong) Color.White else Color(0xFF0F172A)

                        Button(
                            onClick = {
                                if (correctSelectedId != null) return@Button
                                if (option.id == question.target.id) {
                                    correctSelectedId = option.id
                                    feedback = null
                                    shakingId = null
                                    onPlayDing()
                                    onSpeakWord(question.target.english)
                                    onAddScore()
                                    sessionStars += 1
                                    showStar = true
                                    scope.launch {
                                        delay(950)
                                        showStar = false
                                        if (roundIndex + 1 >= TOTAL_GUESS_ROUNDS) {
                                            celebrating = true
                                            onPlayWin()
                                        } else {
                                            roundIndex += 1
                                            correctSelectedId = null
                                            wrongIds.clear()
                                        }
                                    }
                                } else {
                                    if (!wrongIds.contains(option.id)) wrongIds.add(option.id)
                                    shakingId = option.id
                                    feedback = "Try again"
                                    onPlayWrong()
                                    scope.launch {
                                        shakeOffset.snapTo(0f)
                                        listOf(-20f, 20f, -12f, 12f, 0f).forEach { target ->
                                            shakeOffset.animateTo(target, tween(50))
                                        }
                                        shakingId = null
                                    }
                                }
                            },
                            interactionSource = interactionSource,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(68.dp)
                                .offset {
                                    IntOffset(
                                        if (isShaking) shakeOffset.value.roundToInt() else 0,
                                        0
                                    )
                                }
                                .bouncyPress(interactionSource),
                            shape = RoundedCornerShape(22.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = bgColor),
                            elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp)
                        ) {
                            Text(
                                text = option.english,
                                fontSize = 24.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = textColor
                            )
                        }
                    }
                }
            }
        }
        ConfettiOverlay(active = celebrating)
    }
}
