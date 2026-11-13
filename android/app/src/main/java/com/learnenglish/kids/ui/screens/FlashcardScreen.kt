package com.learnenglish.kids.ui.screens

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalDensity
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

@Composable
fun FlashcardScreen(
    categoryId: CategoryId,
    onSpeakWord: (String) -> Unit,
    onBack: () -> Unit
) {
    val category = VocabularyRepository.categories.first { it.id == categoryId }
    var currentIndex by remember(categoryId) { mutableIntStateOf(0) }
    var isFlipped by remember(categoryId) { mutableStateOf(false) }
    var showAllList by remember(categoryId) { mutableStateOf(false) }
    val word = category.words[currentIndex]
    val density = LocalDensity.current.density

    val rotationY by animateFloatAsState(
        targetValue = if (isFlipped) 180f else 0f,
        animationSpec = tween(durationMillis = 480),
        label = "flashcard3DFlip"
    )

    val categoryPastels = when (category.id) {
        CategoryId.ANIMALS -> listOf(Color(0xFFFEF3C7), Color(0xFFFCE7F3), Color(0xFFEDE9FE))
        CategoryId.FRUITS -> listOf(Color(0xFFFFE4E6), Color(0xFFFCE7F3), Color(0xFFE0E7FF))
        CategoryId.COLORS -> listOf(Color(0xFFDBEAFE), Color(0xFFEDE9FE), Color(0xFFFCE7F3))
        CategoryId.NUMBERS -> listOf(Color(0xFFD1FAE5), Color(0xFFE0F2FE), Color(0xFFF3E8FF))
        CategoryId.OBJECTS -> listOf(Color(0xFFF3E8FF), Color(0xFFFCE7F3), Color(0xFFDBEAFE))
    }

    FantasyBackground(
        theme = FantasyTheme.FLASHCARDS,
        customGradientColors = categoryPastels
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
        KidScreenTopBar(
            title = "${category.emoji} ${category.title}",
            onBack = onBack
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Button(
                onClick = { showAllList = false },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (!showAllList) category.accentColor else Color.White,
                    contentColor = if (!showAllList) Color.White else Color(0xFF1E293B)
                )
            ) {
                Text("Flashcard (${currentIndex + 1}/${category.words.size})", fontWeight = FontWeight.Bold)
            }
            Button(
                onClick = { showAllList = true },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (showAllList) category.accentColor else Color.White,
                    contentColor = if (showAllList) Color.White else Color(0xFF1E293B)
                )
            ) {
                Text("All ${category.words.size} Words", fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        if (showAllList) {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                itemsIndexed(category.words) { index, item ->
                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(22.dp))
                            .clickable {
                                currentIndex = index
                                isFlipped = false
                                onSpeakWord(item.english)
                            },
                        shape = RoundedCornerShape(22.dp),
                        color = Color.White,
                        shadowElevation = 3.dp
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 18.dp, vertical = 14.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(item.emoji, fontSize = 38.sp)
                                Column(modifier = Modifier.padding(start = 14.dp)) {
                                    Text(
                                        text = item.english,
                                        fontSize = 22.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        color = category.accentColor
                                    )
                                    RtlPersianText(text = item.persian, fontSize = 18.sp)
                                }
                            }
                            Text("🔊", fontSize = 24.sp)
                        }
                    }
                }
            }
        } else {
            Spacer(modifier = Modifier.weight(1f))

            AnimatedContent(
                targetState = word,
                transitionSpec = {
                    (scaleIn(
                        initialScale = 0.82f,
                        animationSpec = spring(
                            dampingRatio = Spring.DampingRatioMediumBouncy,
                            stiffness = Spring.StiffnessMediumLow
                        )
                    ) + fadeIn()) togetherWith fadeOut()
                },
                label = "flashcardSpring"
            ) { currentWord ->
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .graphicsLayer {
                            this.rotationY = rotationY
                            cameraDistance = 12f * density
                        }
                        .clip(RoundedCornerShape(32.dp))
                        .clickable { isFlipped = !isFlipped },
                    shape = RoundedCornerShape(32.dp),
                    color = if (rotationY <= 90f) Color.White else Color(0xFFFFFBEB),
                    shadowElevation = 10.dp
                ) {
                    if (rotationY <= 90f) {
                        Column(
                            modifier = Modifier.padding(horizontal = 24.dp, vertical = 34.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(text = currentWord.emoji, fontSize = 100.sp)
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = currentWord.english,
                                fontSize = 40.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = category.accentColor
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Tap card to flip for Persian",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF94A3B8)
                            )
                            Spacer(modifier = Modifier.height(20.dp))
                            Button(
                                onClick = { onSpeakWord(currentWord.english) },
                                shape = RoundedCornerShape(20.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = category.accentColor),
                                modifier = Modifier.height(58.dp)
                            ) {
                                Text(
                                    text = "🔊 Listen",
                                    fontSize = 22.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            }
                        }
                    } else {
                        Column(
                            modifier = Modifier
                                .graphicsLayer { this.rotationY = 180f }
                                .padding(horizontal = 24.dp, vertical = 48.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(text = currentWord.emoji, fontSize = 84.sp)
                            Spacer(modifier = Modifier.height(16.dp))
                            RtlPersianText(
                                text = currentWord.persian,
                                fontSize = 36.sp,
                                color = Color(0xFF0F172A)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = currentWord.english,
                                fontSize = 22.sp,
                                fontWeight = FontWeight.Bold,
                                color = category.accentColor
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "Tap card to flip back",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF64748B)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            val prevInteraction = remember { MutableInteractionSource() }
            val nextInteraction = remember { MutableInteractionSource() }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Button(
                    onClick = {
                        isFlipped = false
                        currentIndex = (currentIndex - 1 + category.words.size) % category.words.size
                    },
                    interactionSource = prevInteraction,
                    modifier = Modifier
                        .weight(1f)
                        .height(60.dp)
                        .bouncyPress(prevInteraction),
                    shape = RoundedCornerShape(20.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color.White,
                        contentColor = Color(0xFF1E293B)
                    ),
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp)
                ) {
                    Text("Previous", fontSize = 20.sp, fontWeight = FontWeight.Bold)
                }

                Button(
                    onClick = {
                        isFlipped = false
                        currentIndex = (currentIndex + 1) % category.words.size
                    },
                    interactionSource = nextInteraction,
                    modifier = Modifier
                        .weight(1f)
                        .height(60.dp)
                        .bouncyPress(nextInteraction),
                    shape = RoundedCornerShape(20.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color.White,
                        contentColor = Color(0xFF1E293B)
                    ),
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp)
                ) {
                    Text("Next", fontSize = 20.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
        }
    }
}
