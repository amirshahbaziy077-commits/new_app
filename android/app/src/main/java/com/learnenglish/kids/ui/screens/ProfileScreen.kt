package com.learnenglish.kids.ui.screens

import android.app.DatePickerDialog
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.learnenglish.kids.ui.components.FantasyBackground
import com.learnenglish.kids.ui.components.FantasyTheme
import com.learnenglish.kids.ui.components.KidScreenTopBar
import com.learnenglish.kids.ui.components.RtlPersianText
import kotlinx.coroutines.delay
import java.util.Calendar

private val PROFILE_AVATARS = listOf(
    "🦊", "🐱", "🐶", "🦁", "🐼",
    "🦄", "🦸‍♂️", "🤖", "🚀", "🌟",
    "⚽", "🎨", "🍕", "👽", "🐸"
)

private val ENGLISH_NAME_REGEX = Regex("^[a-zA-Z\\s]+\$")
private const val ENGLISH_ERROR_HELPER = "Please write in English / لطفاً به انگلیسی بنویسید"

private fun calculateAgeFromCalendar(year: Int, monthZeroBased: Int, dayOfMonth: Int): Int {
    val today = Calendar.getInstance()
    var age = today.get(Calendar.YEAR) - year
    val currentMonth = today.get(Calendar.MONTH)
    val currentDay = today.get(Calendar.DAY_OF_MONTH)
    if (currentMonth < monthZeroBased || (currentMonth == monthZeroBased && currentDay < dayOfMonth)) {
        age -= 1
    }
    return age.coerceAtLeast(0)
}

private fun calculateAgeFromSlashDate(slashDate: String): Int? {
    val parts = slashDate.split("/")
    if (parts.size != 3) return null
    val y = parts[0].toIntOrNull() ?: return null
    val m = parts[1].toIntOrNull() ?: return null
    val d = parts[2].toIntOrNull() ?: return null
    return calculateAgeFromCalendar(y, (m - 1).coerceIn(0, 11), d)
}

private fun toPersianDigits(number: Int): String {
    val map = charArrayOf('۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹')
    return number.toString().map { ch ->
        if (ch in '0'..'9') map[ch - '0'] else ch
    }.joinToString("")
}

@Composable
fun ProfileScreen(
    initialFirstName: String,
    initialLastName: String,
    initialAvatar: String,
    initialBirthDate: String,
    initialAge: Int,
    totalStars: Int,
    onSaveProfile: (firstName: String, lastName: String, avatar: String, birthDate: String, age: Int) -> Unit,
    onPlaySaveSound: () -> Unit,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()

    var firstName by remember { mutableStateOf(initialFirstName) }
    var lastName by remember { mutableStateOf(initialLastName) }
    var selectedAvatar by remember { mutableStateOf(initialAvatar.ifBlank { "🦊" }) }
    var birthDate by remember { mutableStateOf(initialBirthDate) }
    var calculatedAge by remember {
        mutableIntStateOf(
            calculateAgeFromSlashDate(initialBirthDate) ?: initialAge
        )
    }
    var showSavedBanner by remember { mutableStateOf(false) }

    val firstHasError = firstName.isNotEmpty() && !ENGLISH_NAME_REGEX.matches(firstName)
    val lastHasError = lastName.isNotEmpty() && !ENGLISH_NAME_REGEX.matches(lastName)

    val firstValid = ENGLISH_NAME_REGEX.matches(firstName) && firstName.trim().isNotEmpty()
    val lastValid = ENGLISH_NAME_REGEX.matches(lastName) && lastName.trim().isNotEmpty()
    val canSave = firstValid && lastValid

    LaunchedEffect(showSavedBanner) {
        if (showSavedBanner) {
            delay(2500L)
            showSavedBanner = false
        }
    }

    fun openBirthDatePicker() {
        val cal = Calendar.getInstance()
        val parsed = birthDate.split("/")
        val initYear: Int
        val initMonth: Int
        val initDay: Int

        if (parsed.size == 3 && parsed[0].toIntOrNull() != null && parsed[1].toIntOrNull() != null && parsed[2].toIntOrNull() != null) {
            initYear = parsed[0].toInt()
            initMonth = (parsed[1].toInt() - 1).coerceIn(0, 11)
            initDay = parsed[2].toInt().coerceIn(1, 31)
        } else {
            initYear = cal.get(Calendar.YEAR) - 6
            initMonth = cal.get(Calendar.MONTH)
            initDay = cal.get(Calendar.DAY_OF_MONTH)
        }

        val dialog = DatePickerDialog(
            context,
            { _, selectedYear, selectedMonthZeroBased, selectedDay ->
                val formatted = String.format(
                    "%04d/%02d/%02d",
                    selectedYear,
                    selectedMonthZeroBased + 1,
                    selectedDay
                )
                birthDate = formatted
                calculatedAge = calculateAgeFromCalendar(
                    selectedYear,
                    selectedMonthZeroBased,
                    selectedDay
                )
                showSavedBanner = false
            },
            initYear,
            initMonth,
            initDay
        )
        // Prevent selecting any future date
        dialog.datePicker.maxDate = System.currentTimeMillis()
        dialog.show()
    }

    FantasyBackground(theme = FantasyTheme.PROFILE) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            KidScreenTopBar(
                title = "👤 User Profile",
                score = totalStars,
                onBack = onBack
            )

            // Live Profile Header Preview
            Surface(
                shape = RoundedCornerShape(26.dp),
                shadowElevation = 8.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.horizontalGradient(
                                listOf(Color(0xFF6366F1), Color(0xFFA855F7), Color(0xFFEC4899))
                            )
                        )
                        .padding(18.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    val previewScale by animateFloatAsState(
                        targetValue = 1f,
                        animationSpec = spring(
                            dampingRatio = Spring.DampingRatioMediumBouncy,
                            stiffness = Spring.StiffnessMedium
                        ),
                        label = "previewBounce"
                    )
                    Box(
                        modifier = Modifier
                            .size(82.dp)
                            .graphicsLayer {
                                scaleX = previewScale
                                scaleY = previewScale
                            }
                            .clip(RoundedCornerShape(22.dp))
                            .background(Color.White.copy(alpha = 0.25f))
                            .border(3.dp, Color.White.copy(alpha = 0.55f), RoundedCornerShape(22.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(selectedAvatar, fontSize = 48.sp)
                    }

                    Spacer(modifier = Modifier.width(16.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = if (firstValid || lastValid) {
                                "${firstName.trim()} ${lastName.trim()}".trim()
                            } else {
                                "Your English Name"
                            },
                            fontSize = 24.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color.White
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = if (calculatedAge >= 0) {
                                "🎂 $calculatedAge years old · ⭐ $totalStars Stars"
                            } else {
                                "⭐ $totalStars Total Stars"
                            },
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White.copy(alpha = 0.92f)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // Main Form Surface
            Surface(
                shape = RoundedCornerShape(28.dp),
                color = Color.White,
                shadowElevation = 8.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Choose Avatar (${PROFILE_AVATARS.size})",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color(0xFF0F172A)
                        )
                        RtlPersianText(
                            text = "آواتار خودت را انتخاب کن",
                            fontSize = 15.sp,
                            color = Color(0xFF475569)
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Clean 5x3 LazyVerticalGrid of 15 kid-friendly emojis
                    Surface(
                        shape = RoundedCornerShape(22.dp),
                        color = Color(0xFFF8FAFC),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(216.dp)
                            .border(2.dp, Color(0xFFE0E7FF), RoundedCornerShape(22.dp))
                    ) {
                        LazyVerticalGrid(
                            columns = GridCells.Fixed(5),
                            contentPadding = PaddingValues(12.dp),
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            items(PROFILE_AVATARS) { emoji ->
                                val isSelected = selectedAvatar == emoji
                                val avatarScale by animateFloatAsState(
                                    targetValue = if (isSelected) 1.15f else 1f,
                                    animationSpec = spring(
                                        dampingRatio = Spring.DampingRatioMediumBouncy,
                                        stiffness = Spring.StiffnessMedium
                                    ),
                                    label = "avatarScale_$emoji"
                                )

                                Box(
                                    modifier = Modifier
                                        .aspectRatio(1f)
                                        .graphicsLayer {
                                            scaleX = avatarScale
                                            scaleY = avatarScale
                                        }
                                        .clip(RoundedCornerShape(18.dp))
                                        .background(if (isSelected) Color(0xFFE0E7FF) else Color.White)
                                        .border(
                                            width = if (isSelected) 4.dp else 1.5.dp,
                                            color = if (isSelected) Color(0xFF4F46E5) else Color(0xFFE2E8F0),
                                            shape = RoundedCornerShape(18.dp)
                                        )
                                        .clickable { selectedAvatar = emoji },
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(text = emoji, fontSize = 32.sp)
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // First Name (نام) - Strict ASCII English input
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "First Name",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF1E293B)
                        )
                        RtlPersianText(text = "نام", fontSize = 15.sp, color = Color(0xFF475569))
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    OutlinedTextField(
                        value = firstName,
                        onValueChange = {
                            firstName = it
                            showSavedBanner = false
                        },
                        placeholder = { Text("e.g., Ali", color = Color(0xFF94A3B8)) },
                        singleLine = true,
                        isError = firstHasError,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Ascii),
                        supportingText = {
                            if (firstHasError) {
                                Text(
                                    text = ENGLISH_ERROR_HELPER,
                                    color = Color(0xFFDC2626),
                                    fontWeight = FontWeight.Bold
                                )
                            } else {
                                Text(
                                    text = "English letters only (A–Z)",
                                    color = Color(0xFF64748B)
                                )
                            }
                        },
                        shape = RoundedCornerShape(18.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF6366F1),
                            unfocusedBorderColor = Color(0xFFCBD5E1),
                            errorBorderColor = Color(0xFFDC2626),
                            errorContainerColor = Color(0xFFFEF2F2)
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    // Last Name (نام خانوادگی) - Strict ASCII English input
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Last Name",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF1E293B)
                        )
                        RtlPersianText(
                            text = "نام خانوادگی",
                            fontSize = 15.sp,
                            color = Color(0xFF475569)
                        )
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    OutlinedTextField(
                        value = lastName,
                        onValueChange = {
                            lastName = it
                            showSavedBanner = false
                        },
                        placeholder = { Text("e.g., Rezaei", color = Color(0xFF94A3B8)) },
                        singleLine = true,
                        isError = lastHasError,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Ascii),
                        supportingText = {
                            if (lastHasError) {
                                Text(
                                    text = ENGLISH_ERROR_HELPER,
                                    color = Color(0xFFDC2626),
                                    fontWeight = FontWeight.Bold
                                )
                            } else {
                                Text(
                                    text = "English letters only (A–Z)",
                                    color = Color(0xFF64748B)
                                )
                            }
                        },
                        shape = RoundedCornerShape(18.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF6366F1),
                            unfocusedBorderColor = Color(0xFFCBD5E1),
                            errorBorderColor = Color(0xFFDC2626),
                            errorContainerColor = Color(0xFFFEF2F2)
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    // Date of Birth (تاریخ تولد) Picker Trigger + Auto Age Display
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Date of Birth",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF1E293B)
                        )
                        RtlPersianText(
                            text = "تاریخ تولد",
                            fontSize = 15.sp,
                            color = Color(0xFF475569)
                        )
                    }
                    Spacer(modifier = Modifier.height(6.dp))

                    Surface(
                        shape = RoundedCornerShape(18.dp),
                        color = if (birthDate.isNotBlank()) Color(0xFFEEF2FF) else Color(0xFFF8FAFC),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(18.dp))
                            .border(
                                width = 1.5.dp,
                                color = if (birthDate.isNotBlank()) Color(0xFF6366F1) else Color(0xFFCBD5E1),
                                shape = RoundedCornerShape(18.dp)
                            )
                            .clickable { openBirthDatePicker() }
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.DateRange,
                                    contentDescription = "Select Date of Birth",
                                    tint = Color(0xFF4F46E5)
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Text(
                                    text = if (birthDate.isNotBlank()) birthDate else "YYYY/MM/DD · Tap to select",
                                    fontSize = 17.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (birthDate.isNotBlank()) Color(0xFF0F172A) else Color(0xFF94A3B8)
                                )
                            }
                            Text(
                                text = "📅",
                                fontSize = 20.sp
                            )
                        }
                    }

                    if (calculatedAge >= 0) {
                        Spacer(modifier = Modifier.height(10.dp))
                        Surface(
                            shape = RoundedCornerShape(16.dp),
                            color = Color(0xFFE0E7FF),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "🎂 Age: $calculatedAge years old / سن: ${toPersianDigits(calculatedAge)} سال",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color(0xFF3730A3),
                                modifier = Modifier.padding(horizontal = 16.dp, vertical = 11.dp)
                            )
                        }
                    }

                    AnimatedVisibility(visible = showSavedBanner) {
                        Surface(
                            shape = RoundedCornerShape(16.dp),
                            color = Color(0xFFD1FAE5),
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 12.dp, bottom = 4.dp)
                        ) {
                            Text(
                                text = "✓ Profile Saved! · پروفایل ذخیره شد",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color(0xFF047857),
                                modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(18.dp))

                    Button(
                        onClick = {
                            if (!canSave) return@Button
                            val cleanFirst = firstName.trim().replace(Regex("\\s+"), " ")
                            val cleanLast = lastName.trim().replace(Regex("\\s+"), " ")
                            onSaveProfile(cleanFirst, cleanLast, selectedAvatar, birthDate, calculatedAge)
                            onPlaySaveSound()
                            showSavedBanner = true
                        },
                        enabled = canSave,
                        shape = RoundedCornerShape(20.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF6366F1),
                            disabledContainerColor = Color(0xFFCBD5E1),
                            disabledContentColor = Color(0xFF64748B)
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(58.dp)
                    ) {
                        Text(
                            text = "Save Profile / ذخیره",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.ExtraBold
                        )
                    }
                }
            }
        }
    }
}
