package com.learnenglish.kids.ui.screens

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
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
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
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
import com.learnenglish.kids.ui.components.FantasyBackground
import com.learnenglish.kids.ui.components.FantasyTheme
import com.learnenglish.kids.ui.components.KidScreenTopBar
import com.learnenglish.kids.ui.components.RtlPersianText
import com.learnenglish.kids.ui.components.bouncyPress

enum class GameKind(
    val title: String,
    val theme: FantasyTheme
) {
    GUESS_WORD("🎮 Guess the Word", FantasyTheme.GUESS_WORD),
    MATCH_PAIRS("🧩 Match the Pairs", FantasyTheme.MATCH_PAIRS),
    TAP_RIGHT_ONE("🎯 Tap the Right One", FantasyTheme.TAP_RIGHT_ONE),
    SPELL_WORD("🔤 Spell the Word", FantasyTheme.SPELL_WORD)
}

@Composable
fun GameCategorySelectScreen(
    gameKind: GameKind,
    score: Int,
    onSelectCategory: (CategoryId?) -> Unit,
    onBack: () -> Unit
) {
    val scrollState = rememberScrollState()
    val categories = VocabularyRepository.categories

    FantasyBackground(theme = gameKind.theme) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            KidScreenTopBar(
                title = gameKind.title,
                score = score,
                onBack = onBack
            )

            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                color = Color.White,
                shadowElevation = 6.dp
            ) {
                Column(
                    modifier = Modifier.padding(horizontal = 20.dp, vertical = 18.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Choose a Topic to Play!",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color(0xFF0F172A)
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    RtlPersianText(
                        text = "یک موضوع برای بازی انتخاب کن!",
                        fontSize = 18.sp,
                        color = Color(0xFF475569)
                    )
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    TopicChoiceCard(
                        emoji = categories[0].emoji,
                        title = categories[0].title,
                        persian = categories[0].persianTitle,
                        subtitle = "${categories[0].words.size} words",
                        colors = listOf(categories[0].gradientStart, categories[0].gradientEnd),
                        index = 0,
                        modifier = Modifier.weight(1f),
                        onClick = { onSelectCategory(categories[0].id) }
                    )
                    TopicChoiceCard(
                        emoji = categories[1].emoji,
                        title = categories[1].title,
                        persian = categories[1].persianTitle,
                        subtitle = "${categories[1].words.size} words",
                        colors = listOf(categories[1].gradientStart, categories[1].gradientEnd),
                        index = 1,
                        modifier = Modifier.weight(1f),
                        onClick = { onSelectCategory(categories[1].id) }
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    TopicChoiceCard(
                        emoji = categories[2].emoji,
                        title = categories[2].title,
                        persian = categories[2].persianTitle,
                        subtitle = "${categories[2].words.size} words",
                        colors = listOf(categories[2].gradientStart, categories[2].gradientEnd),
                        index = 2,
                        modifier = Modifier.weight(1f),
                        onClick = { onSelectCategory(categories[2].id) }
                    )
                    TopicChoiceCard(
                        emoji = categories[3].emoji,
                        title = categories[3].title,
                        persian = categories[3].persianTitle,
                        subtitle = "${categories[3].words.size} words",
                        colors = listOf(categories[3].gradientStart, categories[3].gradientEnd),
                        index = 3,
                        modifier = Modifier.weight(1f),
                        onClick = { onSelectCategory(categories[3].id) }
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    TopicChoiceCard(
                        emoji = categories[4].emoji,
                        title = categories[4].title,
                        persian = categories[4].persianTitle,
                        subtitle = "${categories[4].words.size} words",
                        colors = listOf(categories[4].gradientStart, categories[4].gradientEnd),
                        index = 4,
                        modifier = Modifier.weight(1f),
                        onClick = { onSelectCategory(categories[4].id) }
                    )
                    TopicChoiceCard(
                        emoji = "🌟",
                        title = "All Words",
                        persian = "همه کلمات",
                        subtitle = "${VocabularyRepository.allWords.size} words · Challenge",
                        colors = listOf(Color(0xFF6366F1), Color(0xFFEC4899)),
                        index = 5,
                        modifier = Modifier.weight(1f),
                        onClick = { onSelectCategory(null) }
                    )
                }
            }
        }
    }
}

@Composable
private fun TopicChoiceCard(
    emoji: String,
    title: String,
    persian: String,
    subtitle: String,
    colors: List<Color>,
    index: Int,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    val interactionSource = remember { MutableInteractionSource() }
    val infiniteTransition = rememberInfiniteTransition(label = "topicFloat_$index")
    val floatOffset by infiniteTransition.animateFloat(
        initialValue = -4f,
        targetValue = 4f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1250 + index * 120, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "topicEmojiOffset"
    )

    Surface(
        modifier = modifier
            .height(168.dp)
            .bouncyPress(interactionSource)
            .clip(RoundedCornerShape(26.dp))
            .clickable(interactionSource = interactionSource, indication = null, onClick = onClick),
        shape = RoundedCornerShape(26.dp),
        shadowElevation = 6.dp
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Brush.linearGradient(colors))
                .padding(14.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = emoji,
                    fontSize = 48.sp,
                    modifier = Modifier.offset(y = floatOffset.dp)
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = title,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color.White
                )
                RtlPersianText(
                    text = persian,
                    fontSize = 15.sp,
                    color = Color.White
                )
                Text(
                    text = subtitle,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White.copy(alpha = 0.9f)
                )
            }
        }
    }
}
