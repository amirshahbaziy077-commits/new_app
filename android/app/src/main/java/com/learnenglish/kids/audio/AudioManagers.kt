package com.learnenglish.kids.audio

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import android.speech.tts.TextToSpeech
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.Locale
import kotlin.math.PI
import kotlin.math.exp
import kotlin.math.sin

class SoundManager {
    private val scope = CoroutineScope(Dispatchers.Default)
    @Volatile
    var isEnabled: Boolean = true

    fun playCorrectDing() {
        if (!isEnabled) return
        scope.launch {
            playTone(freqHz = 659.25, durationMs = 130)
            playTone(freqHz = 987.77, durationMs = 240)
        }
    }

    fun playWrongBuzz() {
        if (!isEnabled) return
        scope.launch {
            playTone(freqHz = 260.0, durationMs = 150)
            playTone(freqHz = 200.0, durationMs = 200)
        }
    }

    fun playWinFanfare() {
        if (!isEnabled) return
        scope.launch {
            playTone(freqHz = 523.25, durationMs = 140)
            playTone(freqHz = 659.25, durationMs = 140)
            playTone(freqHz = 783.99, durationMs = 140)
            playTone(freqHz = 1046.50, durationMs = 360)
        }
    }

    private fun playTone(freqHz: Double, durationMs: Int) {
        val sampleRate = 22050
        val numSamples = (sampleRate * durationMs) / 1000
        val buffer = ShortArray(numSamples)

        for (i in 0 until numSamples) {
            val t = i.toDouble() / sampleRate
            val envelope = exp(-4.0 * i / numSamples)
            val sample = sin(2.0 * PI * freqHz * t) * envelope
            buffer[i] = (sample * Short.MAX_VALUE * 0.45).toInt().toShort()
        }

        val track = AudioTrack.Builder()
            .setAudioAttributes(
                AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_GAME)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build()
            )
            .setAudioFormat(
                AudioFormat.Builder()
                    .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                    .setSampleRate(sampleRate)
                    .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                    .build()
            )
            .setBufferSizeInBytes(buffer.size * 2)
            .setTransferMode(AudioTrack.MODE_STATIC)
            .build()

        track.write(buffer, 0, buffer.size)
        track.play()
        Thread.sleep(durationMs.toLong() + 15)
        track.release()
    }
}

class TtsManager(context: Context) : TextToSpeech.OnInitListener {
    private var tts: TextToSpeech? = TextToSpeech(context.applicationContext, this)
    private var isReady = false
    @Volatile
    var isEnabled: Boolean = true

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts?.language = Locale.US
            tts?.setSpeechRate(0.85f)
            tts?.setPitch(1.05f)
            isReady = true
        }
    }

    fun speak(word: String, speechRate: Float = 0.85f) {
        if (!isReady || !isEnabled) return
        tts?.setSpeechRate(speechRate)
        tts?.setPitch(1.05f)
        tts?.speak(word, TextToSpeech.QUEUE_FLUSH, null, word)
    }

    /**
     * Speaks the alphabet letter slowly (0.65f) followed by a natural 480ms pause
     * before pronouncing the example word ("A ... Apple.") clearly for young children.
     */
    fun speakAlphabet(letter: String, word: String) {
        if (!isReady || !isEnabled) return
        tts?.setSpeechRate(0.65f)
        tts?.setPitch(1.08f)
        tts?.speak("$letter.", TextToSpeech.QUEUE_FLUSH, null, "alpha_letter_$letter")
        tts?.playSilentUtterance(480L, TextToSpeech.QUEUE_ADD, "alpha_pause_$letter")
        tts?.speak("$word.", TextToSpeech.QUEUE_ADD, null, "alpha_word_$word")
    }

    fun shutdown() {
        tts?.stop()
        tts?.shutdown()
    }
}
