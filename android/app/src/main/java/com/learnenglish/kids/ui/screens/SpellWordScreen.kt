package com.learnenglish.kids.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
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
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private const val TOTAL_SPELL_ROUNDS = 30

private data class SpellTile(
    val index: Int,
    val char: Char,
    val used: Boolean = false
)

private val SHORT_ALPHA_REGEX = Regex("^[A-Za-z]{3,7}$")
private val ANY_ALPHA_REGEX = Regex("^[A-Za-z]+$")

private fun buildSpellingSession(categoryId: CategoryId?): List<WordItem> {
    val pool = VocabularyRepository.wordsForFilter(categoryId)
    val shortAlpha = pool.filter { SHORT_ALPHA_REGEX.matches(it.english) }
    if (shortAlpha.size >= TOTAL_SPELL_ROUNDS) {
        return shortAlpha.shuffled().take(TOTAL_SPELL_ROUNDS)
    }

    val allAlpha = pool.filter { ANY_ALPHA_REGEX.matches(it.english) }.shuffled()
    val result = mutableListOf<WordItem>()
    while (result.size < TOTAL_SPELL_ROUNDS && allAlpha.isNotEmpty()) {
        result.addAll(allAlpha.shuffled())
    }
    return result.take(TOTAL_SPELL_ROUNDS)
}

private fun makeShuffledTiles(word: String): List<SpellTile> {
    return word.uppercase().mapIndexed { idx, c -> SpellTile(idx, c) }.shuffled()
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun SpellWordScreen(
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
    var sessionWords by remember(categoryId) { mutableStateOf(buildSpellingSession(categoryId)) }
    var roundIndex by remember { mutableIntStateOf(0) }
    var sessionStars by remember { mutableIntStateOf(0) }
    val word = sessionWords[roundIndex]

    var tiles by remember { mutableStateOf(makeShuffledTiles(word.english)) }
    var boxes by remember { mutableStateOf(List<Int?>(word.english.length) { null }) }
    var isCorrect by remember { mutableStateOf(false) }
    var showStar by remember { mutableStateOf(false) }
    var gameComplete by remember { mutableStateOf(false) }

    val completedCount = if (gameComplete) TOTAL_SPELL_ROUNDS else roundIndex

    FantasyBackground(theme = FantasyTheme.SPELL_WORD) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            KidScreenTopBar(title = "🔤 Spell the Word", score = score, onBack = onBack)

            LinearProgressIndicator(
                progress = { completedCount / TOTAL_SPELL_ROUNDS.toFloat() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(14.dp)
                    .clip(RoundedCornerShape(10.dp)),
                color = Color(0xFFF59E0B),
                trackColor = Color.White
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "Word ${minOf(roundIndex + 1, TOTAL_SPELL_ROUNDS)} / $TOTAL_SPELL_ROUNDS · ${VocabularyRepository.filterTitle(categoryId)}",
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
                            color = Color(0xFFEA580C)
                        )
                        RtlPersianText("آفرین! هر ۳۰ کلمه املا را کامل کردی!", fontSize = 20.sp)
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "Final Score: $sessionStars / $TOTAL_SPELL_ROUNDS · ⭐ +$sessionStars",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFD97706)
                        )
                        Spacer(modifier = Modifier.height(24.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            Button(
                                onClick = {
                                    val fresh = buildSpellingSession(categoryId)
                                    sessionWords = fresh
                                    roundIndex = 0
                                    sessionStars = 0
                                    tiles = makeShuffledTiles(fresh[0].english)
                                    boxes = List(fresh[0].english.length) { null }
                                    isCorrect = false
                                    showStar = false
                                    gameComplete = false
                                },
                                shape = RoundedCornerShape(20.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF59E0B)),
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
                    color = if (isCorrect) Color(0xFFD1FAE5) else Color.White,
                    shadowElevation = 8.dp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(22.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(word.emoji, fontSize = 82.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        RtlPersianText(word.persian, fontSize = 26.sp)
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))
                StarPopBanner(visible = showStar, label = "${word.english}! +1 ⭐")
                Spacer(modifier = Modifier.height(12.dp))

                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    boxes.forEach { tileIdx ->
                        val char = tileIdx?.let { idx -> tiles.first { it.index == idx }.char }
                        Box(
                            modifier = Modifier
                                .size(width = 46.dp, height = 58.dp)
                                .clip(RoundedCornerShape(16.dp))
                                .background(if (isCorrect) Color(0xFF10B981) else Color.White)
                                .border(2.dp, Color(0xFFF59E0B), RoundedCornerShape(16.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = char?.toString() ?: "_",
                                fontSize = 26.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = if (isCorrect) Color.White else Color(0xFF0F172A)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(22.dp))

                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    tiles.forEach { tile ->
                        Button(
                            onClick = {
                                if (tile.used || isCorrect) return@Button
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
                                    if (spelled == word.english.uppercase()) {
                                        isCorrect = true
                                        showStar = true
                                        onPlayDing()
                                        onSpeakWord(word.english)
                                        onAddScore()
                                        sessionStars += 1
                                        scope.launch {
                                            delay(1200)
                                            showStar = false
                                            isCorrect = false
                                            if (roundIndex + 1 >= TOTAL_SPELL_ROUNDS) {
                                                gameComplete = true
                                                onPlayWin()
                                            } else {
                                                val nextIdx = roundIndex + 1
                                                val nextWord = sessionWords[nextIdx]
                                                roundIndex = nextIdx
                                                tiles = makeShuffledTiles(nextWord.english)
                                                boxes = List(nextWord.english.length) { null }
                                            }
                                        }
                                    } else {
                                        onPlayWrong()
                                    }
                                }
                            },
                            enabled = !tile.used && !isCorrect,
                            shape = RoundedCornerShape(16.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF59E0B)),
                            modifier = Modifier.size(width = 54.dp, height = 58.dp)
                        ) {
                            Text(tile.char.toString(), fontSize = 24.sp, fontWeight = FontWeight.ExtraBold)
                        }
                    }
                }

                Spacer(modifier = Modifier.weight(1f))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Button(
                        onClick = {
                            if (isCorrect) return@Button
                            tiles = tiles.map { it.copy(used = false) }
                            boxes = List(word.english.length) { null }
                        },
                        modifier = Modifier
                            .weight(1f)
                            .height(56.dp),
                        shape = RoundedCornerShape(18.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color.White,
                            contentColor = Color(0xFF1E293B)
                        )
                    ) {
                        Text("Clear", fontSize = 20.sp, fontWeight = FontWeight.Bold)
                    }

                    Button(
                        onClick = {
                            if (isCorrect) return@Button
                            val firstChar = word.english.first().uppercaseChar()
                            val firstTile = tiles.first { it.char == firstChar }
                            tiles = tiles.map { it.copy(used = it.index == firstTile.index) }
                            boxes = List(word.english.length) { idx -> if (idx == 0) firstTile.index else null }
                        },
                        modifier = Modifier
                            .weight(1f)
                            .height(56.dp),
                        shape = RoundedCornerShape(18.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFFFBBF24),
                            contentColor = Color(0xFF0F172A)
                        )
                    ) {
                        Text("Hint", fontSize = 20.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
        ConfettiOverlay(active = gameComplete)
    }
}
