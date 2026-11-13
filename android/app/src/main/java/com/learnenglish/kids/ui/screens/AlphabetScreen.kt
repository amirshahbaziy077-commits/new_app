package com.learnenglish.kids.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.learnenglish.kids.data.VocabularyRepository
import com.learnenglish.kids.ui.components.FantasyBackground
import com.learnenglish.kids.ui.components.FantasyTheme
import com.learnenglish.kids.ui.components.KidScreenTopBar
import com.learnenglish.kids.ui.components.RtlPersianText

@Composable
fun AlphabetScreen(
    exploredLetters: Set<String>,
    onExploreLetter: (String) -> Unit,
    onSpeakAlphabet: (String, String) -> Unit,
    onBack: () -> Unit
) {
    var activeLetter by remember { mutableStateOf<String?>(null) }

    FantasyBackground(theme = FantasyTheme.ALPHABET) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp)
        ) {
        KidScreenTopBar(
            title = "🔤 Alphabet A–Z",
            onBack = onBack
        )

        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(VocabularyRepository.alphabetItems) { item ->
                val isSelected = activeLetter == item.letter
                val isExplored = exploredLetters.contains(item.letter)

                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(24.dp))
                        .clickable {
                            activeLetter = item.letter
                            onExploreLetter(item.letter)
                            onSpeakAlphabet(item.letter, item.word)
                        },
                    shape = RoundedCornerShape(24.dp),
                    color = if (isSelected) Color(0xFFEEF2FF) else Color.White,
                    border = BorderStroke(
                        width = 2.dp,
                        color = when {
                            isSelected -> Color(0xFF6366F1)
                            isExplored -> Color(0xFFA7F3D0)
                            else -> Color.White
                        }
                    ),
                    shadowElevation = 4.dp
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = item.pair,
                                fontSize = 26.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color(0xFF4F46E5)
                            )
                            Text("🔊", fontSize = 18.sp)
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(item.emoji, fontSize = 48.sp)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = item.word,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF0F172A)
                        )
                        RtlPersianText(text = item.persian, fontSize = 16.sp)
                    }
                }
            }
        }
        }
    }
}
