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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
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
import com.learnenglish.kids.data.CategoryInfo
import com.learnenglish.kids.data.VocabularyRepository
import com.learnenglish.kids.ui.components.AnimatedScoreChip
import com.learnenglish.kids.ui.components.FantasyBackground
import com.learnenglish.kids.ui.components.FantasyTheme
import com.learnenglish.kids.ui.components.RtlPersianText
import com.learnenglish.kids.ui.components.bouncyPress
import java.util.Calendar

private fun resolveHomeAge(birthDate: String, savedAge: Int): Int? {
    if (birthDate.isNotBlank()) {
        val parts = birthDate.split("/")
        if (parts.size == 3) {
            val y = parts[0].toIntOrNull()
            val m = parts[1].toIntOrNull()
            val d = parts[2].toIntOrNull()
            if (y != null && m != null && d != null) {
                val today = Calendar.getInstance()
                val curY = today.get(Calendar.YEAR)
                val curM = today.get(Calendar.MONTH) + 1
                val curD = today.get(Calendar.DAY_OF_MONTH)
                var age = curY - y
                if (curM < m || (curM == m && curD < d)) {
                    age -= 1
                }
                return age.coerceAtLeast(0)
            }
        }
    }
    return if (savedAge >= 0) savedAge else null
}

@Composable
fun HomeScreen(
    totalScore: Int,
    unlockedBadgeCount: Int,
    challengeBestScore: Int,
    profileFirstName: String,
    profileLastName: String,
    profileAvatar: String,
    profileBirthDate: String,
    profileAge: Int,
    onOpenCategory: (CategoryId) -> Unit,
    onOpenAlphabet: () -> Unit,
    onOpenRewards: () -> Unit,
    onOpenParents: () -> Unit,
    onOpenProfile: () -> Unit,
    onSpeakAge: (Int) -> Unit,
    onOpenChallenge: () -> Unit,
    onOpenGuessWord: () -> Unit,
    onOpenMatchPairs: () -> Unit,
    onOpenTapRightOne: () -> Unit,
    onOpenSpellWord: () -> Unit
) {
    val scrollState = rememberScrollState()
    val rewardsInteraction = remember { MutableInteractionSource() }
    val parentsInteraction = remember { MutableInteractionSource() }
    val profileInteraction = remember { MutableInteractionSource() }
    val ageInteraction = remember { MutableInteractionSource() }
    val hasProfile = profileFirstName.isNotBlank()
    val resolvedAge = if (hasProfile) resolveHomeAge(profileBirthDate, profileAge) else null

    FantasyBackground(theme = FantasyTheme.HOME) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
        // Top Row: Animated Global Star Score, My Rewards, Parents
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                AnimatedScoreChip(score = totalScore)

                Button(
                    onClick = onOpenRewards,
                    interactionSource = rewardsInteraction,
                    modifier = Modifier.bouncyPress(rewardsInteraction),
                    shape = RoundedCornerShape(18.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF59E0B))
                ) {
                    Text(
                        text = "My Rewards 🏆 ($unlockedBadgeCount)",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White
                    )
                }
            }

            Button(
                onClick = onOpenParents,
                interactionSource = parentsInteraction,
                modifier = Modifier.bouncyPress(parentsInteraction),
                shape = RoundedCornerShape(18.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color.White,
                    contentColor = Color(0xFF334155)
                ),
                elevation = ButtonDefaults.buttonElevation(defaultElevation = 3.dp)
            ) {
                Icon(Icons.Default.Settings, contentDescription = "Parents")
                Spacer(modifier = Modifier.width(4.dp))
                Text("Parents", fontSize = 13.sp, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Compact User Profile Welcome Bar + Clickable TTS Age Badge
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            color = Color.White,
            shadowElevation = 4.dp
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    modifier = Modifier
                        .weight(1f)
                        .bouncyPress(profileInteraction)
                        .clip(RoundedCornerShape(14.dp))
                        .clickable(
                            interactionSource = profileInteraction,
                            indication = null,
                            onClick = onOpenProfile
                        )
                        .padding(vertical = 2.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(profileAvatar.ifBlank { "🦊" }, fontSize = 28.sp)
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = if (hasProfile) {
                            "Hi ${profileFirstName.trim()}!"
                        } else {
                            "My Profile (Tap to customize)"
                        },
                        fontSize = 17.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color(0xFF4338CA)
                    )
                }

                if (resolvedAge != null) {
                    Surface(
                        modifier = Modifier
                            .bouncyPress(ageInteraction)
                            .clip(RoundedCornerShape(14.dp))
                            .clickable(
                                interactionSource = ageInteraction,
                                indication = null,
                                onClick = { onSpeakAge(resolvedAge) }
                            ),
                        shape = RoundedCornerShape(14.dp),
                        color = Color(0xFF10B981)
                    ) {
                        Text(
                            text = "🔊 $resolvedAge Years",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color.White,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
                        )
                    }
                } else {
                    RtlPersianText(
                        text = "پروفایل من",
                        fontSize = 14.sp,
                        color = Color(0xFF64748B)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        RtlPersianText(
            text = "به کلاس زبان انگلیسی خوش آمدید",
            fontSize = 32.sp,
            color = Color(0xFF4F46E5),
            fontWeight = FontWeight.ExtraBold,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(20.dp))

        GameButtonCard(
            emoji = "🔤",
            title = "Alphabet 🔤",
            persian = "الفبای انگلیسی (A–Z)",
            colors = listOf(Color(0xFF6366F1), Color(0xFF0EA5E9)),
            index = 0,
            onClick = onOpenAlphabet
        )

        Spacer(modifier = Modifier.height(20.dp))

        // 5 Category Cards (Animals, Fruits, Colors, Numbers, Objects) with floating emojis
        val categories = VocabularyRepository.categories
        Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                CategoryCard(categories[0], 0, Modifier.weight(1f)) {
                    onOpenCategory(categories[0].id)
                }
                CategoryCard(categories[1], 1, Modifier.weight(1f)) {
                    onOpenCategory(categories[1].id)
                }
            }
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                CategoryCard(categories[2], 2, Modifier.weight(1f)) {
                    onOpenCategory(categories[2].id)
                }
                CategoryCard(categories[3], 3, Modifier.weight(1f)) {
                    onOpenCategory(categories[3].id)
                }
            }
            CategoryCard(categories[4], 4, Modifier.fillMaxWidth()) {
                onOpenCategory(categories[4].id)
            }
        }

        Spacer(modifier = Modifier.height(22.dp))

        GameButtonCard(
            emoji = "🏆",
            title = "Challenge Mode 🏆",
            persian = "سوالات سخت · رکورد: $challengeBestScore/10",
            colors = listOf(Color(0xFFF43F5E), Color(0xFFF59E0B)),
            index = 0,
            onClick = onOpenChallenge
        )

        Spacer(modifier = Modifier.height(22.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Games",
                fontSize = 28.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color(0xFF1E293B)
            )
            RtlPersianText(text = "بازی‌ها", fontSize = 20.sp, color = Color(0xFF475569))
        }

        Spacer(modifier = Modifier.height(14.dp))

        Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
            GameButtonCard(
                emoji = "🎮",
                title = "Guess the Word",
                persian = "حدس کلمه",
                colors = listOf(Color(0xFF8B5CF6), Color(0xFF7C3AED)),
                index = 0,
                onClick = onOpenGuessWord
            )
            GameButtonCard(
                emoji = "🧩",
                title = "Match the Pairs",
                persian = "جفت‌ها را پیدا کن",
                colors = listOf(Color(0xFF2DD4BF), Color(0xFF059669)),
                index = 1,
                onClick = onOpenMatchPairs
            )
            GameButtonCard(
                emoji = "🎯",
                title = "Tap the Right One",
                persian = "گوش کن و بزن",
                colors = listOf(Color(0xFF0EA5E9), Color(0xFF2563EB)),
                index = 2,
                onClick = onOpenTapRightOne
            )
            GameButtonCard(
                emoji = "🔤",
                title = "Spell the Word",
                persian = "املای کلمه",
                colors = listOf(Color(0xFFFBBF24), Color(0xFFF97316)),
                index = 3,
                onClick = onOpenSpellWord
            )
        }
        }
    }
}

@Composable
private fun CategoryCard(
    category: CategoryInfo,
    index: Int,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    val interactionSource = remember { MutableInteractionSource() }
    val infiniteTransition = rememberInfiniteTransition(label = "float_${category.id}")
    val floatOffset by infiniteTransition.animateFloat(
        initialValue = -6f,
        targetValue = 6f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 960 + index * 60, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "emojiFloat"
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
                .background(Brush.linearGradient(listOf(category.gradientStart, category.gradientEnd)))
                .padding(14.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = category.emoji,
                    fontSize = 50.sp,
                    modifier = Modifier.offset(y = floatOffset.dp)
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = category.title,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color.White
                )
                RtlPersianText(
                    text = category.persianTitle,
                    fontSize = 16.sp,
                    color = Color.White
                )
                Text(
                    text = "${category.words.size} words",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White.copy(alpha = 0.88f)
                )
            }
        }
    }
}

@Composable
private fun GameButtonCard(
    emoji: String,
    title: String,
    persian: String,
    colors: List<Color>,
    index: Int,
    onClick: () -> Unit
) {
    val interactionSource = remember { MutableInteractionSource() }
    val infiniteTransition = rememberInfiniteTransition(label = "float_game_${title}_$index")
    val floatOffset by infiniteTransition.animateFloat(
        initialValue = -6f,
        targetValue = 6f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 960 + index * 60, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "gameEmojiFloat"
    )

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .bouncyPress(interactionSource)
            .clip(RoundedCornerShape(26.dp))
            .clickable(interactionSource = interactionSource, indication = null, onClick = onClick),
        shape = RoundedCornerShape(26.dp),
        shadowElevation = 6.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Brush.horizontalGradient(colors))
                .padding(horizontal = 20.dp, vertical = 18.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(64.dp)
                    .background(Color.White.copy(alpha = 0.22f), RoundedCornerShape(18.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = emoji,
                    fontSize = 38.sp,
                    modifier = Modifier.offset(y = floatOffset.dp)
                )
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color.White
                )
                RtlPersianText(text = persian, fontSize = 16.sp, color = Color.White)
            }
        }
    }
}
