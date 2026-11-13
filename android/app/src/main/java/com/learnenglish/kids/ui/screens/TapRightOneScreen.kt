package com.learnenglish.kids.ui.screens

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.math.roundToInt

private const val TOTAL_LISTEN_ROUNDS = 30

private data class ListenRound(
    val target: WordItem,
    val options: List<WordItem>
)

private fun buildListenSession(categoryId: CategoryId?): List<ListenRound> {
    val pool = VocabularyRepository.wordsForFilter(categoryId)
    return pool.shuffled().take(TOTAL_LISTEN_ROUNDS).map { target ->
        val distractors = pool.filter { it.id != target.id }.shuffled().take(3)
        ListenRound(target = target, options = (listOf(target) + distractors).shuffled())
    }
}

@Composable
fun TapRightOneScreen(
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
    var rounds by remember(categoryId) { mutableStateOf(buildListenSession(categoryId)) }
    var roundIndex by remember { mutableIntStateOf(0) }
    var sessionStars by remember { mutableIntStateOf(0) }
    var correctId by remember { mutableStateOf<String?>(null) }
    var shakingId by remember { mutableStateOf<String?>(null) }
    var feedback by remember { mutableStateOf<String?>(null) }
    var showStar by remember { mutableStateOf(false) }
    var gameComplete by remember { mutableStateOf(false) }

    val shakeOffset = remember { Animatable(0f) }
    val round = rounds[roundIndex]
    val completedCount = if (gameComplete) TOTAL_LISTEN_ROUNDS else roundIndex

    LaunchedEffect(roundIndex, gameComplete, rounds) {
        if (!gameComplete) {
            delay(200)
            onSpeakWord(round.target.english)
        }
    }

    FantasyBackground(theme = FantasyTheme.TAP_RIGHT_ONE) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            KidScreenTopBar(title = "🎯 Tap the Right One", score = score, onBack = onBack)

            LinearProgressIndicator(
                progress = { completedCount / TOTAL_LISTEN_ROUNDS.toFloat() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(14.dp)
                    .clip(RoundedCornerShape(10.dp)),
                color = Color(0xFF0284C7),
                trackColor = Color.White
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "Round ${minOf(roundIndex + 1, TOTAL_LISTEN_ROUNDS)} / $TOTAL_LISTEN_ROUNDS · ${VocabularyRepository.filterTitle(categoryId)}",
                fontWeight = FontWeight.Bold,
                color = Color(0xFF475569)
            )

            Spacer(modifier = Modifier.height(14.dp))

            if (gameComplete) {
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
                            color = Color(0xFF0369A1)
                        )
                        RtlPersianText("آفرین! هر ۳۰ کلمه شنیداری را انجام دادی!", fontSize = 20.sp)
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "Final Score: $sessionStars / $TOTAL_LISTEN_ROUNDS · ⭐ +$sessionStars",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFD97706)
                        )
                        Spacer(modifier = Modifier.height(24.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            Button(
                                onClick = {
                                    rounds = buildListenSession(categoryId)
                                    roundIndex = 0
                                    sessionStars = 0
                                    correctId = null
                                    shakingId = null
                                    feedback = null
                                    gameComplete = false
                                },
                                shape = RoundedCornerShape(20.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0284C7)),
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
                    shape = RoundedCornerShape(28.dp),
                    color = Color.White,
                    shadowElevation = 6.dp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Listen and tap the matching emoji!",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF0F172A)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(
                            onClick = { onSpeakWord(round.target.english) },
                            shape = RoundedCornerShape(18.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0284C7)),
                            modifier = Modifier.height(52.dp)
                        ) {
                            Text("🔊 Hear Again", fontSize = 20.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))
                StarPopBanner(visible = showStar, label = "${round.target.english}! +1 ⭐")
                if (feedback != null) {
                    Text(
                        text = feedback!!,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFE11D48)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    round.options.chunked(2).forEach { rowOptions ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            rowOptions.forEach { option ->
                                val isCorrect = correctId == option.id
                                val isShaking = shakingId == option.id
                                Surface(
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(132.dp)
                                        .offset {
                                            IntOffset(
                                                if (isShaking) shakeOffset.value.roundToInt() else 0,
                                                0
                                            )
                                        }
                                        .clip(RoundedCornerShape(28.dp))
                                        .clickable(enabled = correctId == null) {
                                            if (option.id == round.target.id) {
                                                correctId = option.id
                                                feedback = null
                                                onPlayDing()
                                                onSpeakWord(round.target.english)
                                                onAddScore()
                                                sessionStars += 1
                                                showStar = true
                                                scope.launch {
                                                    delay(1000)
                                                    showStar = false
                                                    correctId = null
                                                    if (roundIndex + 1 >= TOTAL_LISTEN_ROUNDS) {
                                                        gameComplete = true
                                                        onPlayWin()
                                                    } else {
                                                        roundIndex += 1
                                                    }
                                                }
                                            } else {
                                                shakingId = option.id
                                                feedback = "Try again"
                                                onPlayWrong()
                                                scope.launch {
                                                    shakeOffset.snapTo(0f)
                                                    listOf(-22f, 22f, -14f, 14f, 0f).forEach { target ->
                                                        shakeOffset.animateTo(target, tween(55))
                                                    }
                                                    shakingId = null
                                                }
                                            }
                                        },
                                    shape = RoundedCornerShape(28.dp),
                                    color = if (isCorrect) Color(0xFFD1FAE5) else Color.White,
                                    shadowElevation = 6.dp
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Text(option.emoji, fontSize = 68.sp)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        ConfettiOverlay(active = gameComplete)
    }
}
