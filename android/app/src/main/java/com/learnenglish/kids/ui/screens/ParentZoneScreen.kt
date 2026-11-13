package com.learnenglish.kids.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.learnenglish.kids.ui.components.FantasyBackground
import com.learnenglish.kids.ui.components.FantasyTheme
import com.learnenglish.kids.ui.components.KidScreenTopBar
import kotlin.random.Random

@Composable
fun ParentZoneScreen(
    soundEnabled: Boolean,
    totalStars: Int,
    onToggleSound: (Boolean) -> Unit,
    onResetProgress: () -> Unit,
    onBack: () -> Unit
) {
    val numA = remember { Random.nextInt(4, 10) }
    val numB = remember { Random.nextInt(3, 10) }
    var unlocked by remember { mutableStateOf(false) }
    var answerText by remember { mutableStateOf("") }
    var errorMsg by remember { mutableStateOf<String?>(null) }
    var resetDone by remember { mutableStateOf(false) }

    FantasyBackground(theme = FantasyTheme.PARENTS) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
        KidScreenTopBar(title = "Parent Zone", onBack = onBack)

        if (!unlocked) {
            Surface(
                shape = RoundedCornerShape(28.dp),
                color = Color.White,
                shadowElevation = 6.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("Parent Check", fontSize = 26.sp, fontWeight = FontWeight.ExtraBold)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Solve this quick math problem to enter:", color = Color(0xFF475569))
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "What is $numA + $numB?",
                        fontSize = 32.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color(0xFF1E293B)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    OutlinedTextField(
                        value = answerText,
                        onValueChange = { answerText = it },
                        label = { Text("Answer") },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                    )
                    if (errorMsg != null) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(errorMsg!!, color = Color(0xFFE11D48), fontWeight = FontWeight.Bold)
                    }
                    Spacer(modifier = Modifier.height(18.dp))
                    Button(
                        onClick = {
                            if (answerText.trim().toIntOrNull() == numA + numB) {
                                unlocked = true
                                errorMsg = null
                            } else {
                                errorMsg = "Incorrect answer. Please try again."
                            }
                        },
                        shape = RoundedCornerShape(18.dp)
                    ) {
                        Text("Enter Settings", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        } else {
            Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                Surface(
                    shape = RoundedCornerShape(24.dp),
                    color = Color.White,
                    shadowElevation = 4.dp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(20.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Sound & Voice", fontSize = 20.sp, fontWeight = FontWeight.Bold)
                            Text("Turn sound effects and TTS ON/OFF", fontSize = 13.sp, color = Color(0xFF64748B))
                        }
                        Switch(checked = soundEnabled, onCheckedChange = onToggleSound)
                    }
                }

                Surface(
                    shape = RoundedCornerShape(24.dp),
                    color = Color.White,
                    shadowElevation = 4.dp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Text("Reset Progress", fontSize = 20.sp, fontWeight = FontWeight.Bold)
                        Text(
                            text = "Current Stars: $totalStars. Reset stars and badges to zero.",
                            fontSize = 13.sp,
                            color = Color(0xFF64748B)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(
                            onClick = {
                                onResetProgress()
                                resetDone = true
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE11D48)),
                            shape = RoundedCornerShape(16.dp)
                        ) {
                            Text("Reset Stars & Badges", fontWeight = FontWeight.Bold)
                        }
                        if (resetDone) {
                            Spacer(modifier = Modifier.height(8.dp))
                            Text("Progress has been reset.", color = Color(0xFF059669), fontWeight = FontWeight.Bold)
                        }
                    }
                }

                Surface(
                    shape = RoundedCornerShape(24.dp),
                    color = Color.White,
                    shadowElevation = 4.dp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Text("About Learn English!", fontSize = 20.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Learn English! helps children ages 3 to 8 learn English vocabulary, A–Z letters, and spelling alongside Persian translations using cheerful visuals, voice pronunciation, and offline progress storage.",
                            fontSize = 14.sp,
                            color = Color(0xFF475569)
                        )
                    }
                }
            }
        }
        }
    }
}
