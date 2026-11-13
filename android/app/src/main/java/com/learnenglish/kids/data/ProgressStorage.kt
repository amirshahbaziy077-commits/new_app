package com.learnenglish.kids.data

import android.content.Context
import java.util.Calendar

data class PersistedProgress(
    val guessScore: Int = 0,
    val matchScore: Int = 0,
    val listenScore: Int = 0,
    val spellScore: Int = 0,
    val challengeStars: Int = 0,
    val challengeBestScore: Int = 0,
    val profileFirstName: String = "",
    val profileLastName: String = "",
    val profileAvatar: String = "🦊",
    val profileBirthDate: String = "",
    val profileAge: Int = -1,
    val exploredLetters: Set<String> = emptySet(),
    val unlockedBadges: Set<String> = emptySet(),
    val soundEnabled: Boolean = true
) {
    val totalStars: Int
        get() = guessScore + matchScore + listenScore + spellScore + challengeStars
}

class ProgressStorage(context: Context) {
    private val prefs = context.getSharedPreferences("learn_english_prefs", Context.MODE_PRIVATE)

    fun calculateAgeFromBirthDate(slashDate: String): Int? {
        val parts = slashDate.split("/")
        if (parts.size != 3) return null
        val y = parts[0].toIntOrNull() ?: return null
        val m = parts[1].toIntOrNull() ?: return null
        val d = parts[2].toIntOrNull() ?: return null

        val today = Calendar.getInstance()
        val currentYear = today.get(Calendar.YEAR)
        val currentMonth = today.get(Calendar.MONTH) + 1
        val currentDay = today.get(Calendar.DAY_OF_MONTH)

        if (y > currentYear || (y == currentYear && (m > currentMonth || (m == currentMonth && d > currentDay)))) {
            return null
        }

        var age = currentYear - y
        if (currentMonth < m || (currentMonth == m && currentDay < d)) {
            age -= 1
        }
        return age.coerceAtLeast(0)
    }

    fun load(): PersistedProgress {
        val savedBirthDate = prefs.getString("profile_birth_date", "") ?: ""
        val savedAge = prefs.getInt("profile_age", -1)
        val resolvedAge = if (savedBirthDate.isNotBlank()) {
            calculateAgeFromBirthDate(savedBirthDate) ?: savedAge
        } else {
            savedAge
        }

        val loaded = PersistedProgress(
            guessScore = prefs.getInt("guess_score", 0),
            matchScore = prefs.getInt("match_score", 0),
            listenScore = prefs.getInt("listen_score", 0),
            spellScore = prefs.getInt("spell_score", 0),
            challengeStars = prefs.getInt("challenge_stars", 0),
            challengeBestScore = prefs.getInt("challenge_best_score", 0).coerceIn(0, 10),
            profileFirstName = prefs.getString("profile_first_name", "") ?: "",
            profileLastName = prefs.getString("profile_last_name", "") ?: "",
            profileAvatar = prefs.getString("profile_avatar", "🦊") ?: "🦊",
            profileBirthDate = savedBirthDate,
            profileAge = resolvedAge,
            exploredLetters = prefs.getStringSet("explored_letters", emptySet()) ?: emptySet(),
            unlockedBadges = prefs.getStringSet("unlocked_badges", emptySet()) ?: emptySet(),
            soundEnabled = prefs.getBoolean("sound_enabled", true)
        )
        return loaded.copy(unlockedBadges = evaluateBadges(loaded))
    }

    fun save(progress: PersistedProgress): PersistedProgress {
        val evaluated = progress.copy(unlockedBadges = evaluateBadges(progress))
        prefs.edit()
            .putInt("guess_score", evaluated.guessScore)
            .putInt("match_score", evaluated.matchScore)
            .putInt("listen_score", evaluated.listenScore)
            .putInt("spell_score", evaluated.spellScore)
            .putInt("challenge_stars", evaluated.challengeStars)
            .putInt("challenge_best_score", evaluated.challengeBestScore.coerceIn(0, 10))
            .putString("profile_first_name", evaluated.profileFirstName)
            .putString("profile_last_name", evaluated.profileLastName)
            .putString("profile_avatar", evaluated.profileAvatar)
            .putString("profile_birth_date", evaluated.profileBirthDate)
            .putInt("profile_age", evaluated.profileAge)
            .putStringSet("explored_letters", evaluated.exploredLetters)
            .putStringSet("unlocked_badges", evaluated.unlockedBadges)
            .putBoolean("sound_enabled", evaluated.soundEnabled)
            .apply()
        return evaluated
    }

    fun reset(keepSound: Boolean): PersistedProgress {
        val fresh = PersistedProgress(soundEnabled = keepSound)
        return save(fresh)
    }

    private fun evaluateBadges(progress: PersistedProgress): Set<String> {
        val total = progress.totalStars
        val gamesWithStars = listOf(
            progress.guessScore,
            progress.matchScore,
            progress.listenScore,
            progress.spellScore
        ).count { it > 0 }
        val result = progress.unlockedBadges.toMutableSet()

        VocabularyRepository.rewardBadges.forEach { badge ->
            if (badge.requiredStars != null && total >= badge.requiredStars) {
                result.add(badge.id)
            }
            if (badge.requiredAlphabetCount != null && progress.exploredLetters.size >= badge.requiredAlphabetCount) {
                result.add(badge.id)
            }
            if (badge.requiredGamesPlayed != null && gamesWithStars >= badge.requiredGamesPlayed) {
                result.add(badge.id)
            }
        }
        return result
    }
}
