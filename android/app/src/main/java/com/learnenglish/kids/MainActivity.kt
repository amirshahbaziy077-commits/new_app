package com.learnenglish.kids

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.togetherWith
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import com.learnenglish.kids.audio.SoundManager
import com.learnenglish.kids.audio.TtsManager
import com.learnenglish.kids.data.CategoryId
import com.learnenglish.kids.data.PersistedProgress
import com.learnenglish.kids.data.ProgressStorage
import com.learnenglish.kids.ui.components.KidsLightTheme
import com.learnenglish.kids.ui.screens.AlphabetScreen
import com.learnenglish.kids.ui.screens.ChallengeModeScreen
import com.learnenglish.kids.ui.screens.FlashcardScreen
import com.learnenglish.kids.ui.screens.GameCategorySelectScreen
import com.learnenglish.kids.ui.screens.GameKind
import com.learnenglish.kids.ui.screens.GuessWordScreen
import com.learnenglish.kids.ui.screens.HomeScreen
import com.learnenglish.kids.ui.screens.MatchPairsScreen
import com.learnenglish.kids.ui.screens.ParentZoneScreen
import com.learnenglish.kids.ui.screens.ProfileScreen
import com.learnenglish.kids.ui.screens.RewardsScreen
import com.learnenglish.kids.ui.screens.SpellWordScreen
import com.learnenglish.kids.ui.screens.TapRightOneScreen

sealed interface AppRoute {
    data object Home : AppRoute
    data class Flashcards(val categoryId: CategoryId) : AppRoute
    data object Alphabet : AppRoute
    data object Rewards : AppRoute
    data object Parents : AppRoute
    data class GameCategorySelect(val gameKind: GameKind) : AppRoute
    data class GuessWord(val categoryId: CategoryId?) : AppRoute
    data class MatchPairs(val categoryId: CategoryId?) : AppRoute
    data class TapRightOne(val categoryId: CategoryId?) : AppRoute
    data class SpellWord(val categoryId: CategoryId?) : AppRoute
    data object Challenge : AppRoute
    data object Profile : AppRoute
}

class MainActivity : ComponentActivity() {
    private lateinit var ttsManager: TtsManager
    private lateinit var soundManager: SoundManager
    private lateinit var storage: ProgressStorage

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ttsManager = TtsManager(this)
        soundManager = SoundManager()
        storage = ProgressStorage(this)

        val initialProgress = storage.load()
        soundManager.isEnabled = initialProgress.soundEnabled
        ttsManager.isEnabled = initialProgress.soundEnabled

        setContent {
            KidsLightTheme {
                LearnEnglishApp(
                    initialProgress = initialProgress,
                    onSaveProgress = { updated ->
                        soundManager.isEnabled = updated.soundEnabled
                        ttsManager.isEnabled = updated.soundEnabled
                        storage.save(updated)
                    },
                    onResetProgress = { keepSound ->
                        storage.reset(keepSound)
                    },
                    onSpeakWord = { ttsManager.speak(it) },
                    onSpeakAge = { age -> ttsManager.speak("I am $age years old.", speechRate = 0.8f) },
                    onSpeakAlphabet = { letter, word -> ttsManager.speakAlphabet(letter, word) },
                    onPlayDing = { soundManager.playCorrectDing() },
                    onPlayWrong = { soundManager.playWrongBuzz() },
                    onPlayWin = { soundManager.playWinFanfare() }
                )
            }
        }
    }

    override fun onDestroy() {
        ttsManager.shutdown()
        super.onDestroy()
    }
}

@Composable
fun LearnEnglishApp(
    initialProgress: PersistedProgress,
    onSaveProgress: (PersistedProgress) -> PersistedProgress,
    onResetProgress: (Boolean) -> PersistedProgress,
    onSpeakWord: (String) -> Unit,
    onSpeakAge: (Int) -> Unit,
    onSpeakAlphabet: (String, String) -> Unit,
    onPlayDing: () -> Unit,
    onPlayWrong: () -> Unit,
    onPlayWin: () -> Unit
) {
    var route by remember { mutableStateOf<AppRoute>(AppRoute.Home) }
    var progress by remember { mutableStateOf(initialProgress) }

    AnimatedContent(
        targetState = route,
        transitionSpec = {
            if (targetState == AppRoute.Home) {
                (slideInHorizontally(animationSpec = tween(260)) { -it / 4 } + fadeIn(tween(220))) togetherWith
                    (slideOutHorizontally(animationSpec = tween(220)) { it / 4 } + fadeOut(tween(180)))
            } else {
                (slideInHorizontally(animationSpec = tween(260)) { it / 4 } + fadeIn(tween(220))) togetherWith
                    (slideOutHorizontally(animationSpec = tween(220)) { -it / 4 } + fadeOut(tween(180)))
            }
        },
        label = "screenSlideFadeTransition"
    ) { current ->
        when (current) {
            AppRoute.Home -> HomeScreen(
                totalScore = progress.totalStars,
                unlockedBadgeCount = progress.unlockedBadges.size,
                challengeBestScore = progress.challengeBestScore,
                profileFirstName = progress.profileFirstName,
                profileLastName = progress.profileLastName,
                profileAvatar = progress.profileAvatar,
                profileBirthDate = progress.profileBirthDate,
                profileAge = progress.profileAge,
                onOpenCategory = { route = AppRoute.Flashcards(it) },
                onOpenAlphabet = { route = AppRoute.Alphabet },
                onOpenRewards = { route = AppRoute.Rewards },
                onOpenParents = { route = AppRoute.Parents },
                onOpenProfile = { route = AppRoute.Profile },
                onSpeakAge = onSpeakAge,
                onOpenChallenge = { route = AppRoute.Challenge },
                onOpenGuessWord = { route = AppRoute.GameCategorySelect(GameKind.GUESS_WORD) },
                onOpenMatchPairs = { route = AppRoute.GameCategorySelect(GameKind.MATCH_PAIRS) },
                onOpenTapRightOne = { route = AppRoute.GameCategorySelect(GameKind.TAP_RIGHT_ONE) },
                onOpenSpellWord = { route = AppRoute.GameCategorySelect(GameKind.SPELL_WORD) }
            )

            is AppRoute.GameCategorySelect -> GameCategorySelectScreen(
                gameKind = current.gameKind,
                score = progress.totalStars,
                onSelectCategory = { selectedCat ->
                    route = when (current.gameKind) {
                        GameKind.GUESS_WORD -> AppRoute.GuessWord(selectedCat)
                        GameKind.MATCH_PAIRS -> AppRoute.MatchPairs(selectedCat)
                        GameKind.TAP_RIGHT_ONE -> AppRoute.TapRightOne(selectedCat)
                        GameKind.SPELL_WORD -> AppRoute.SpellWord(selectedCat)
                    }
                },
                onBack = { route = AppRoute.Home }
            )

            is AppRoute.Flashcards -> FlashcardScreen(
                categoryId = current.categoryId,
                onSpeakWord = onSpeakWord,
                onBack = { route = AppRoute.Home }
            )

            AppRoute.Alphabet -> AlphabetScreen(
                exploredLetters = progress.exploredLetters,
                onExploreLetter = { letter ->
                    progress = onSaveProgress(
                        progress.copy(exploredLetters = progress.exploredLetters + letter)
                    )
                },
                onSpeakAlphabet = onSpeakAlphabet,
                onBack = { route = AppRoute.Home }
            )

            AppRoute.Rewards -> RewardsScreen(
                progress = progress,
                onBack = { route = AppRoute.Home }
            )

            AppRoute.Parents -> ParentZoneScreen(
                soundEnabled = progress.soundEnabled,
                totalStars = progress.totalStars,
                onToggleSound = { enabled ->
                    progress = onSaveProgress(progress.copy(soundEnabled = enabled))
                },
                onResetProgress = {
                    progress = onResetProgress(progress.soundEnabled)
                },
                onBack = { route = AppRoute.Home }
            )

            is AppRoute.GuessWord -> GuessWordScreen(
                categoryId = current.categoryId,
                score = progress.guessScore,
                onAddScore = {
                    progress = onSaveProgress(progress.copy(guessScore = progress.guessScore + 1))
                },
                onSpeakWord = onSpeakWord,
                onPlayDing = onPlayDing,
                onPlayWrong = onPlayWrong,
                onPlayWin = onPlayWin,
                onBack = { route = AppRoute.GameCategorySelect(GameKind.GUESS_WORD) },
                onGoHome = { route = AppRoute.Home }
            )

            is AppRoute.MatchPairs -> MatchPairsScreen(
                categoryId = current.categoryId,
                score = progress.matchScore,
                onAddScore = {
                    progress = onSaveProgress(progress.copy(matchScore = progress.matchScore + 1))
                },
                onSpeakWord = onSpeakWord,
                onPlayDing = onPlayDing,
                onPlayWrong = onPlayWrong,
                onPlayWin = onPlayWin,
                onBack = { route = AppRoute.GameCategorySelect(GameKind.MATCH_PAIRS) },
                onGoHome = { route = AppRoute.Home }
            )

            is AppRoute.TapRightOne -> TapRightOneScreen(
                categoryId = current.categoryId,
                score = progress.listenScore,
                onAddScore = {
                    progress = onSaveProgress(progress.copy(listenScore = progress.listenScore + 1))
                },
                onSpeakWord = onSpeakWord,
                onPlayDing = onPlayDing,
                onPlayWrong = onPlayWrong,
                onPlayWin = onPlayWin,
                onBack = { route = AppRoute.GameCategorySelect(GameKind.TAP_RIGHT_ONE) },
                onGoHome = { route = AppRoute.Home }
            )

            is AppRoute.SpellWord -> SpellWordScreen(
                categoryId = current.categoryId,
                score = progress.spellScore,
                onAddScore = {
                    progress = onSaveProgress(progress.copy(spellScore = progress.spellScore + 1))
                },
                onSpeakWord = onSpeakWord,
                onPlayDing = onPlayDing,
                onPlayWrong = onPlayWrong,
                onPlayWin = onPlayWin,
                onBack = { route = AppRoute.GameCategorySelect(GameKind.SPELL_WORD) },
                onGoHome = { route = AppRoute.Home }
            )

            AppRoute.Challenge -> ChallengeModeScreen(
                totalStars = progress.totalStars,
                bestScore = progress.challengeBestScore,
                onAddChallengeStars = { delta ->
                    progress = onSaveProgress(progress.copy(challengeStars = progress.challengeStars + delta))
                },
                onUpdateBestScore = { newScore ->
                    if (newScore > progress.challengeBestScore) {
                        progress = onSaveProgress(progress.copy(challengeBestScore = newScore))
                    }
                },
                onSpeakWord = onSpeakWord,
                onPlayDing = onPlayDing,
                onPlayWrong = onPlayWrong,
                onPlayWin = onPlayWin,
                onBack = { route = AppRoute.Home }
            )

            AppRoute.Profile -> ProfileScreen(
                initialFirstName = progress.profileFirstName,
                initialLastName = progress.profileLastName,
                initialAvatar = progress.profileAvatar,
                initialBirthDate = progress.profileBirthDate,
                initialAge = progress.profileAge,
                totalStars = progress.totalStars,
                onSaveProfile = { first, last, avatar, birthDate, age ->
                    progress = onSaveProgress(
                        progress.copy(
                            profileFirstName = first,
                            profileLastName = last,
                            profileAvatar = avatar,
                            profileBirthDate = birthDate,
                            profileAge = age
                        )
                    )
                },
                onPlaySaveSound = onPlayDing,
                onBack = { route = AppRoute.Home }
            )
        }
    }
}
