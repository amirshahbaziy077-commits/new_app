package com.learnenglish.kids.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin
import kotlin.random.Random

@Composable
fun KidsLightTheme(content: @Composable () -> Unit) {
    val colorScheme = lightColorScheme(
        primary = Color(0xFF0284C7),
        secondary = Color(0xFFF59E0B),
        background = Color(0xFFF0F9FF),
        surface = Color.White,
        onPrimary = Color.White,
        onBackground = Color(0xFF0F172A),
        onSurface = Color(0xFF0F172A)
    )
    MaterialTheme(colorScheme = colorScheme, content = content)
}

enum class FantasyTheme(
    val gradientColors: List<Color>,
    val orbColors: List<Color>,
    val bubbleColor: Color,
    val starGlowColor: Color
) {
    HOME(
        gradientColors = listOf(Color(0xFFE9D5FF), Color(0xFFFCE7F3), Color(0xFFDBEAFE)),
        orbColors = listOf(Color(0x66C084FC), Color(0x55F472B6), Color(0x667DD3FC)),
        bubbleColor = Color(0x66C4B5FD),
        starGlowColor = Color(0x88FACC15)
    ),
    ALPHABET(
        gradientColors = listOf(Color(0xFFE0E7FF), Color(0xFFE0F2FE), Color(0xFFF3E8FF)),
        orbColors = listOf(Color(0x55818CF8), Color(0x5538BDF8), Color(0x55D8B4FE)),
        bubbleColor = Color(0x6693C5FD),
        starGlowColor = Color(0x88818CF8)
    ),
    FLASHCARDS(
        gradientColors = listOf(Color(0xFFF3E8FF), Color(0xFFFCE7F3), Color(0xFFE0F2FE)),
        orbColors = listOf(Color(0x55D8B4FE), Color(0x55F9A8D4), Color(0x5593C5FD)),
        bubbleColor = Color(0x66DDD6FE),
        starGlowColor = Color(0x88F472B6)
    ),
    REWARDS(
        gradientColors = listOf(Color(0xFFFEF3C7), Color(0xFFFCE7F3), Color(0xFFEDE9FE)),
        orbColors = listOf(Color(0x55FBBF24), Color(0x44F472B6), Color(0x55C4B5FD)),
        bubbleColor = Color(0x66FDE68A),
        starGlowColor = Color(0x99F59E0B)
    ),
    PARENTS(
        gradientColors = listOf(Color(0xFFE0F2FE), Color(0xFFEDE9FE), Color(0xFFF1F5F9)),
        orbColors = listOf(Color(0x4D7DD3FC), Color(0x4DC4B5FD), Color(0x44F9A8D4)),
        bubbleColor = Color(0x55BAE6FD),
        starGlowColor = Color(0x7760A5FA)
    ),
    GUESS_WORD(
        gradientColors = listOf(Color(0xFFEDE9FE), Color(0xFFFAE8FF), Color(0xFFE0F2FE)),
        orbColors = listOf(Color(0x60A78BFA), Color(0x50E879F9), Color(0x557DD3FC)),
        bubbleColor = Color(0x66DDD6FE),
        starGlowColor = Color(0x88C084FC)
    ),
    MATCH_PAIRS(
        gradientColors = listOf(Color(0xFFCCFBF1), Color(0xFFE0F2FE), Color(0xFFF3E8FF)),
        orbColors = listOf(Color(0x555EEAD4), Color(0x557DD3FC), Color(0x50D8B4FE)),
        bubbleColor = Color(0x6699F6E4),
        starGlowColor = Color(0x882DD4BF)
    ),
    TAP_RIGHT_ONE(
        gradientColors = listOf(Color(0xFFDBEAFE), Color(0xFFCFFAFE), Color(0xFFEDE9FE)),
        orbColors = listOf(Color(0x5560A5FA), Color(0x5567E8F9), Color(0x55C4B5FD)),
        bubbleColor = Color(0x66BAE6FD),
        starGlowColor = Color(0x8838BDF8)
    ),
    SPELL_WORD(
        gradientColors = listOf(Color(0xFFFEF3C7), Color(0xFFFCE7F3), Color(0xFFEDE9FE)),
        orbColors = listOf(Color(0x55FDBA74), Color(0x55F9A8D4), Color(0x50C4B5FD)),
        bubbleColor = Color(0x66FED7AA),
        starGlowColor = Color(0x88FB923C)
    ),
    CHALLENGE(
        gradientColors = listOf(Color(0xFFFFE4E6), Color(0xFFFEF3C7), Color(0xFFF3E8FF)),
        orbColors = listOf(Color(0x55FB7185), Color(0x55FBBF24), Color(0x55C084FC)),
        bubbleColor = Color(0x66FECDD3),
        starGlowColor = Color(0x88F43F5E)
    ),
    PROFILE(
        gradientColors = listOf(Color(0xFFE0E7FF), Color(0xFFFCE7F3), Color(0xFFCCFBF1)),
        orbColors = listOf(Color(0x55818CF8), Color(0x55F472B6), Color(0x552DD4BF)),
        bubbleColor = Color(0x66C7D2FE),
        starGlowColor = Color(0x886366F1)
    )
}

@Composable
fun FantasyBackground(
    theme: FantasyTheme,
    customGradientColors: List<Color>? = null,
    modifier: Modifier = Modifier,
    content: @Composable BoxScope.() -> Unit
) {
    val infiniteTransition = rememberInfiniteTransition(label = "fantasyBackground")
    val phase by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = (2f * PI).toFloat(),
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 12000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "fantasyPhase"
    )
    val twinkle by infiniteTransition.animateFloat(
        initialValue = 0.72f,
        targetValue = 1.18f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 2200),
            repeatMode = RepeatMode.Reverse
        ),
        label = "starTwinkle"
    )

    val activeGradient = customGradientColors ?: theme.gradientColors

    Box(modifier = modifier.fillMaxSize()) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            // Base pastel fantasy linear gradient
            drawRect(
                brush = Brush.linearGradient(
                    colors = activeGradient,
                    start = Offset.Zero,
                    end = Offset(size.width, size.height)
                )
            )

            // Soft radial pastel nebula glows
            val orbCenters = listOf(
                Offset(
                    x = size.width * 0.18f + cos(phase) * 32f,
                    y = size.height * 0.22f + sin(phase) * 24f
                ),
                Offset(
                    x = size.width * 0.82f + sin(phase * 0.8f) * 28f,
                    y = size.height * 0.32f + cos(phase * 0.9f) * 24f
                ),
                Offset(
                    x = size.width * 0.50f + cos(phase + 1.4f) * 36f,
                    y = size.height * 0.82f + sin(phase + 1.1f) * 20f
                )
            )
            orbCenters.forEachIndexed { idx, center ->
                val orbColor = theme.orbColors[idx % theme.orbColors.size]
                val orbRadius = maxOf(size.width, size.height) * 0.36f
                drawCircle(
                    brush = Brush.radialGradient(
                        colors = listOf(orbColor, Color.Transparent),
                        center = center,
                        radius = orbRadius
                    ),
                    radius = orbRadius,
                    center = center
                )
            }

            // Floating soft clouds
            val cloudSpecs = listOf(
                Triple(0.16f, 0.14f, 1.0f),
                Triple(0.80f, 0.12f, 0.88f),
                Triple(0.50f, 0.29f, 0.76f),
                Triple(0.18f, 0.68f, 0.92f),
                Triple(0.84f, 0.76f, 1.05f)
            )
            cloudSpecs.forEachIndexed { idx, (xf, yf, scale) ->
                val cx = size.width * xf + sin(phase + idx * 1.2f) * 26f
                val cy = size.height * yf + cos(phase + idx * 0.9f) * 10f
                val cloudColor = Color.White.copy(alpha = 0.72f)
                val puffs = listOf(
                    Triple(-38f, 8f, 26f),
                    Triple(-10f, -8f, 34f),
                    Triple(24f, 2f, 28f),
                    Triple(44f, 12f, 20f),
                    Triple(4f, 14f, 26f)
                )
                puffs.forEach { (dx, dy, r) ->
                    drawCircle(
                        color = cloudColor,
                        radius = r * scale,
                        center = Offset(cx + dx * scale, cy + dy * scale)
                    )
                }
            }

            // Gentle floating bubbles
            val bubbleSpecs = listOf(
                Triple(0.22f, 0.34f, 22f),
                Triple(0.74f, 0.38f, 28f),
                Triple(0.45f, 0.58f, 18f),
                Triple(0.10f, 0.80f, 24f),
                Triple(0.60f, 0.76f, 20f),
                Triple(0.90f, 0.64f, 23f),
                Triple(0.34f, 0.18f, 16f)
            )
            bubbleSpecs.forEachIndexed { idx, (xf, yf, radius) ->
                val bx = size.width * xf + cos(phase + idx * 0.9f) * 18f
                val by = size.height * yf + sin(phase + idx * 1.1f) * 22f
                val center = Offset(bx, by)
                drawCircle(
                    brush = Brush.radialGradient(
                        colors = listOf(
                            Color.White.copy(alpha = 0.75f),
                            theme.bubbleColor,
                            Color.White.copy(alpha = 0.20f)
                        ),
                        center = Offset(bx - radius * 0.3f, by - radius * 0.3f),
                        radius = radius * 1.3f
                    ),
                    radius = radius,
                    center = center
                )
                drawCircle(
                    color = Color.White.copy(alpha = 0.65f),
                    radius = radius,
                    center = center,
                    style = Stroke(width = 2f)
                )
                drawCircle(
                    color = Color.White.copy(alpha = 0.85f),
                    radius = radius * 0.22f,
                    center = Offset(bx - radius * 0.34f, by - radius * 0.34f)
                )
            }

            // Glowing twinkling stars
            val starSpecs = listOf(
                Triple(0.09f, 0.22f, 15f),
                Triple(0.30f, 0.10f, 13f),
                Triple(0.62f, 0.16f, 16f),
                Triple(0.90f, 0.26f, 14f),
                Triple(0.12f, 0.48f, 12f),
                Triple(0.88f, 0.52f, 15f),
                Triple(0.36f, 0.84f, 14f),
                Triple(0.72f, 0.88f, 13f)
            )
            starSpecs.forEachIndexed { idx, (xf, yf, baseR) ->
                val sx = size.width * xf + sin(phase * 0.7f + idx) * 8f
                val sy = size.height * yf + cos(phase * 0.8f + idx) * 10f
                val pulse = if (idx % 2 == 0) twinkle else (1.90f - twinkle)
                val r = baseR * pulse
                val haloR = r * 2.5f

                drawCircle(
                    brush = Brush.radialGradient(
                        colors = listOf(theme.starGlowColor, Color.Transparent),
                        center = Offset(sx, sy),
                        radius = haloR
                    ),
                    radius = haloR,
                    center = Offset(sx, sy)
                )

                val starPath = Path().apply {
                    val inner = r * 0.34f
                    for (i in 0 until 8) {
                        val angle = (i * PI / 4.0).toFloat()
                        val dist = if (i % 2 == 0) r else inner
                        val px = sx + cos(angle) * dist
                        val py = sy + sin(angle) * dist
                        if (i == 0) moveTo(px, py) else lineTo(px, py)
                    }
                    close()
                }
                drawPath(path = starPath, color = Color(0xFFFEF08A).copy(alpha = 0.95f))
            }
        }

        // Semi-transparent overlay for crisp text and button readability
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.White.copy(alpha = 0.40f))
        )

        content()
    }
}

/**
 * Spring bounce scale modifier when pressing any interactive card or button.
 */
fun Modifier.bouncyPress(interactionSource: MutableInteractionSource): Modifier = composed {
    val isPressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.93f else 1f,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessMedium
        ),
        label = "bouncyPress"
    )
    this.graphicsLayer {
        scaleX = scale
        scaleY = scale
    }
}

@Composable
fun RtlPersianText(
    text: String,
    fontSize: TextUnit = 22.sp,
    color: Color = Color(0xFF334155),
    fontWeight: FontWeight = FontWeight.Bold,
    modifier: Modifier = Modifier
) {
    CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
        Text(
            text = text,
            fontSize = fontSize,
            fontWeight = fontWeight,
            color = color,
            textAlign = TextAlign.Center,
            modifier = modifier
        )
    }
}

@Composable
fun AnimatedScoreChip(score: Int) {
    var previousScore by remember { mutableIntStateOf(score) }
    var bumpActive by remember { mutableStateOf(false) }

    LaunchedEffect(score) {
        if (score > previousScore) {
            bumpActive = true
            delay(450)
            bumpActive = false
        }
        previousScore = score
    }

    val scoreScale by animateFloatAsState(
        targetValue = if (bumpActive) 1.28f else 1f,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessMedium
        ),
        label = "scoreBump"
    )

    Box(contentAlignment = Alignment.TopEnd) {
        Surface(
            shape = RoundedCornerShape(18.dp),
            color = Color.White,
            shadowElevation = 4.dp,
            modifier = Modifier.graphicsLayer {
                scaleX = scoreScale
                scaleY = scoreScale
            }
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("⭐", fontSize = 18.sp)
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "$score",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color(0xFFD97706)
                )
            }
        }

        AnimatedVisibility(
            visible = bumpActive,
            enter = fadeIn() + scaleIn(),
            exit = fadeOut() + scaleOut()
        ) {
            Text(
                text = "+1",
                fontSize = 14.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color(0xFF059669),
                modifier = Modifier.padding(end = 6.dp)
            )
        }
    }
}

@Composable
fun KidScreenTopBar(
    title: String,
    score: Int? = null,
    onBack: () -> Unit
) {
    val backInteraction = remember { MutableInteractionSource() }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Button(
            onClick = onBack,
            interactionSource = backInteraction,
            modifier = Modifier.bouncyPress(backInteraction),
            shape = RoundedCornerShape(18.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color.White,
                contentColor = Color(0xFF1E293B)
            ),
            elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp)
        ) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
            Spacer(modifier = Modifier.width(6.dp))
            Text("Back", fontSize = 16.sp, fontWeight = FontWeight.Bold)
        }

        Text(
            text = title,
            fontSize = 21.sp,
            fontWeight = FontWeight.ExtraBold,
            color = Color(0xFF0F172A)
        )

        if (score != null) {
            AnimatedScoreChip(score = score)
        } else {
            Spacer(modifier = Modifier.width(72.dp))
        }
    }
}

@Composable
fun StarPopBanner(visible: Boolean, label: String = "Great job!") {
    AnimatedVisibility(
        visible = visible,
        enter = scaleIn(
            animationSpec = spring(
                dampingRatio = Spring.DampingRatioMediumBouncy,
                stiffness = Spring.StiffnessMedium
            )
        ) + fadeIn(),
        exit = scaleOut() + fadeOut()
    ) {
        Surface(
            shape = RoundedCornerShape(24.dp),
            color = Color(0xFFFBBF24),
            shadowElevation = 8.dp
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 24.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("✨ ⭐ ✨", fontSize = 26.sp)
                Spacer(modifier = Modifier.width(10.dp))
                Text(
                    text = label,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color(0xFF0F172A)
                )
            }
        }
    }
}

private data class ConfettiParticle(
    val xFraction: Float,
    val speedMultiplier: Float,
    val size: Float,
    val color: Color,
    val rotationSpeed: Float
)

@Composable
fun ConfettiOverlay(active: Boolean) {
    if (!active) return

    val progress = remember { Animatable(0f) }
    val particles = remember {
        val palette = listOf(
            Color(0xFFF59E0B),
            Color(0xFFEC4899),
            Color(0xFF10B981),
            Color(0xFF3B82F6),
            Color(0xFF8B5CF6),
            Color(0xFFEF4444)
        )
        List(45) {
            ConfettiParticle(
                xFraction = Random.nextFloat(),
                speedMultiplier = 0.7f + Random.nextFloat() * 0.8f,
                size = 16f + Random.nextFloat() * 14f,
                color = palette[it % palette.size],
                rotationSpeed = (if (it % 2 == 0) 1f else -1f) * (180f + Random.nextFloat() * 180f)
            )
        }
    }

    LaunchedEffect(active) {
        progress.snapTo(0f)
        progress.animateTo(1f, animationSpec = tween(durationMillis = 2400))
    }

    Canvas(modifier = Modifier.fillMaxSize()) {
        particles.forEach { p ->
            val y = progress.value * size.height * 1.2f * p.speedMultiplier
            val x = p.xFraction * size.width
            rotate(degrees = progress.value * p.rotationSpeed, pivot = Offset(x, y)) {
                drawRect(
                    color = p.color,
                    topLeft = Offset(x, y),
                    size = Size(p.size, p.size * 0.6f)
                )
            }
        }
    }
}
