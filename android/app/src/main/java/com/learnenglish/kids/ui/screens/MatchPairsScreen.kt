package com.learnenglish.kids.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
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

private const val TOTAL_MATCH_WORDS = 30

private data class PairCard(
    val uid: String,
    val wordId: String,
    val isEmoji: Boolean,
    val display: String,
    val english: String,
    val matched: Boolean = false
)

private fun buildBoardFromPool(pool: List<WordItem>, offset: Int): List<PairCard> {
    val slice = pool.drop(offset).take(4)
    return slice.flatMap { w ->
        listOf(
            PairCard("$offset-${w.id}-emoji", w.id, true, w.emoji, w.english),
            PairCard("$offset-${w.id}-word", w.id, false, w.english, w.english)
        )
    }.shuffled()
}

@Composable
fun MatchPairsScreen(
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
    var sessionPool by remember(categoryId) {
        mutableStateOf(VocabularyRepository.wordsForFilter(categoryId).shuffled().take(TOTAL_MATCH_WORDS))
    }
    var poolOffset by remember { mutableIntStateOf(0) }
    var deck by remember { mutableStateOf(buildBoardFromPool(sessionPool, 0)) }
    var flippedUids by remember { mutableStateOf<List<String>>(emptyList()) }
    var isLocked by remember { mutableStateOf(false) }
    var matchedTotal by remember { mutableIntStateOf(0) }
    var won by remember { mutableStateOf(false) }
    var starMessage by remember { mutableStateOf<String?>(null) }

    FantasyBackground(theme = FantasyTheme.MATCH_PAIRS) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            KidScreenTopBar(title = "🧩 Match the Pairs", score = score, onBack = onBack)

            LinearProgressIndicator(
                progress = { matchedTotal / TOTAL_MATCH_WORDS.toFloat() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(14.dp)
                    .clip(RoundedCornerShape(10.dp)),
                color = Color(0xFF10B981),
                trackColor = Color.White
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "Words Matched: $matchedTotal / $TOTAL_MATCH_WORDS · ${VocabularyRepository.filterTitle(categoryId)}",
                fontWeight = FontWeight.Bold,
                color = Color(0xFF0F766E)
            )

            Spacer(modifier = Modifier.height(8.dp))
            StarPopBanner(visible = starMessage != null, label = starMessage ?: "")
            Spacer(modifier = Modifier.height(10.dp))

            if (won) {
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
                        Text("🎉", fontSize = 84.sp)
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            "You Win!",
                            fontSize = 40.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color(0xFF059669)
                        )
                        RtlPersianText("آفرین! هر ۳۰ جفت کلمه را پیدا کردی!", fontSize = 20.sp)
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "Final Score: $matchedTotal / $TOTAL_MATCH_WORDS · ⭐ +$matchedTotal",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFD97706)
                        )
                        Spacer(modifier = Modifier.height(24.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            Button(
                                onClick = {
                                    val fresh = VocabularyRepository.wordsForFilter(categoryId).shuffled().take(TOTAL_MATCH_WORDS)
                                    sessionPool = fresh
                                    poolOffset = 0
                                    deck = buildBoardFromPool(fresh, 0)
                                    flippedUids = emptyList()
                                    isLocked = false
                                    matchedTotal = 0
                                    won = false
                                    starMessage = null
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
                Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    deck.chunked(2).forEach { rowCards ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(14.dp)
                        ) {
                            rowCards.forEach { card ->
                                val interactionSource = remember(card.uid) { MutableInteractionSource() }
                                val isFaceUp = card.matched || flippedUids.contains(card.uid)
                                Surface(
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(120.dp)
                                        .bouncyPress(interactionSource)
                                        .clip(RoundedCornerShape(24.dp))
                                        .clickable(
                                            interactionSource = interactionSource,
                                            indication = null,
                                            enabled = !isLocked && !isFaceUp
                                        ) {
                                            val next = flippedUids + card.uid
                                            flippedUids = next
                                            if (next.size == 2) {
                                                val first = deck.first { it.uid == next[0] }
                                                val second = deck.first { it.uid == next[1] }
                                                if (first.wordId == second.wordId) {
                                                    onPlayDing()
                                                    onSpeakWord(first.english)
                                                    onAddScore()
                                                    matchedTotal += 1
                                                    starMessage = "${first.english}! +1 ⭐"
                                                    scope.launch {
                                                        delay(800)
                                                        starMessage = null
                                                    }
                                                    val updated = deck.map {
                                                        if (it.wordId == first.wordId) it.copy(matched = true) else it
                                                    }
                                                    deck = updated
                                                    flippedUids = emptyList()
                                                    if (updated.all { it.matched }) {
                                                        val nextOffset = poolOffset + (updated.size / 2)
                                                        if (nextOffset >= TOTAL_MATCH_WORDS) {
                                                            scope.launch {
                                                                delay(450)
                                                                won = true
                                                                onPlayWin()
                                                            }
                                                        } else {
                                                            isLocked = true
                                                            scope.launch {
                                                                delay(650)
                                                                poolOffset = nextOffset
                                                                deck = buildBoardFromPool(sessionPool, nextOffset)
                                                                flippedUids = emptyList()
                                                                isLocked = false
                                                            }
                                                        }
                                                    }
                                                } else {
                                                    isLocked = true
                                                    onPlayWrong()
                                                    scope.launch {
                                                        delay(1000)
                                                        flippedUids = emptyList()
                                                        isLocked = false
                                                    }
                                                }
                                            }
                                        },
                                    shape = RoundedCornerShape(24.dp),
                                    color = when {
                                        card.matched -> Color(0xFFD1FAE5)
                                        isFaceUp -> Color.White
                                        else -> Color(0xFF14B8A6)
                                    },
                                    shadowElevation = 6.dp
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        if (!isFaceUp) {
                                            Text("❓", fontSize = 42.sp, color = Color.White)
                                        } else if (card.isEmoji) {
                                            Text(card.display, fontSize = 54.sp)
                                        } else {
                                            Text(
                                                text = card.display,
                                                fontSize = 22.sp,
                                                fontWeight = FontWeight.ExtraBold,
                                                color = Color(0xFF0F172A)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        ConfettiOverlay(active = won)
    }
}
