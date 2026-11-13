import { Check, Copy, FileCode2, X } from 'lucide-react';
import { useState } from 'react';
import androidManifestRaw from '../../android/app/src/main/AndroidManifest.xml?raw';
import alphabetScreenRaw from '../../android/app/src/main/java/com/learnenglish/kids/ui/screens/AlphabetScreen.kt?raw';
import appBuildGradleRaw from '../../android/app/build.gradle.kts?raw';
import audioManagersRaw from '../../android/app/src/main/java/com/learnenglish/kids/audio/AudioManagers.kt?raw';
import challengeModeScreenRaw from '../../android/app/src/main/java/com/learnenglish/kids/ui/screens/ChallengeModeScreen.kt?raw';
import commonComponentsRaw from '../../android/app/src/main/java/com/learnenglish/kids/ui/components/CommonComponents.kt?raw';
import flashcardScreenRaw from '../../android/app/src/main/java/com/learnenglish/kids/ui/screens/FlashcardScreen.kt?raw';
import gameCategorySelectScreenRaw from '../../android/app/src/main/java/com/learnenglish/kids/ui/screens/GameCategorySelectScreen.kt?raw';
import guessWordScreenRaw from '../../android/app/src/main/java/com/learnenglish/kids/ui/screens/GuessWordScreen.kt?raw';
import homeScreenRaw from '../../android/app/src/main/java/com/learnenglish/kids/ui/screens/HomeScreen.kt?raw';
import icLauncherBgRaw from '../../android/app/src/main/res/drawable/ic_launcher_background.xml?raw';
import icLauncherFgRaw from '../../android/app/src/main/res/drawable/ic_launcher_foreground.xml?raw';
import icLauncherRoundXmlRaw from '../../android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml?raw';
import icLauncherXmlRaw from '../../android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml?raw';
import mainActivityRaw from '../../android/app/src/main/java/com/learnenglish/kids/MainActivity.kt?raw';
import matchPairsScreenRaw from '../../android/app/src/main/java/com/learnenglish/kids/ui/screens/MatchPairsScreen.kt?raw';
import parentZoneScreenRaw from '../../android/app/src/main/java/com/learnenglish/kids/ui/screens/ParentZoneScreen.kt?raw';
import profileScreenRaw from '../../android/app/src/main/java/com/learnenglish/kids/ui/screens/ProfileScreen.kt?raw';
import progressStorageRaw from '../../android/app/src/main/java/com/learnenglish/kids/data/ProgressStorage.kt?raw';
import rewardsScreenRaw from '../../android/app/src/main/java/com/learnenglish/kids/ui/screens/RewardsScreen.kt?raw';
import rootBuildGradleRaw from '../../android/build.gradle.kts?raw';
import settingsGradleRaw from '../../android/settings.gradle.kts?raw';
import spellWordScreenRaw from '../../android/app/src/main/java/com/learnenglish/kids/ui/screens/SpellWordScreen.kt?raw';
import stringsXmlRaw from '../../android/app/src/main/res/values/strings.xml?raw';
import tapRightOneScreenRaw from '../../android/app/src/main/java/com/learnenglish/kids/ui/screens/TapRightOneScreen.kt?raw';
import vocabularyDataRaw from '../../android/app/src/main/java/com/learnenglish/kids/data/VocabularyData.kt?raw';

interface KotlinSourceModalProps {
  open: boolean;
  onClose: () => void;
}

const KOTLIN_FILES = [
  { name: 'MainActivity.kt', path: 'app/src/main/java/com/learnenglish/kids/MainActivity.kt', content: mainActivityRaw },
  { name: 'VocabularyData.kt', path: 'app/src/main/java/com/learnenglish/kids/data/VocabularyData.kt', content: vocabularyDataRaw },
  { name: 'ProgressStorage.kt', path: 'app/src/main/java/com/learnenglish/kids/data/ProgressStorage.kt', content: progressStorageRaw },
  { name: 'AudioManagers.kt', path: 'app/src/main/java/com/learnenglish/kids/audio/AudioManagers.kt', content: audioManagersRaw },
  { name: 'CommonComponents.kt', path: 'app/src/main/java/com/learnenglish/kids/ui/components/CommonComponents.kt', content: commonComponentsRaw },
  { name: 'HomeScreen.kt', path: 'app/src/main/java/com/learnenglish/kids/ui/screens/HomeScreen.kt', content: homeScreenRaw },
  { name: 'FlashcardScreen.kt', path: 'app/src/main/java/com/learnenglish/kids/ui/screens/FlashcardScreen.kt', content: flashcardScreenRaw },
  { name: 'AlphabetScreen.kt', path: 'app/src/main/java/com/learnenglish/kids/ui/screens/AlphabetScreen.kt', content: alphabetScreenRaw },
  { name: 'RewardsScreen.kt', path: 'app/src/main/java/com/learnenglish/kids/ui/screens/RewardsScreen.kt', content: rewardsScreenRaw },
  { name: 'ParentZoneScreen.kt', path: 'app/src/main/java/com/learnenglish/kids/ui/screens/ParentZoneScreen.kt', content: parentZoneScreenRaw },
  { name: 'GameCategorySelectScreen.kt', path: 'app/src/main/java/com/learnenglish/kids/ui/screens/GameCategorySelectScreen.kt', content: gameCategorySelectScreenRaw },
  { name: 'GuessWordScreen.kt', path: 'app/src/main/java/com/learnenglish/kids/ui/screens/GuessWordScreen.kt', content: guessWordScreenRaw },
  { name: 'MatchPairsScreen.kt', path: 'app/src/main/java/com/learnenglish/kids/ui/screens/MatchPairsScreen.kt', content: matchPairsScreenRaw },
  { name: 'TapRightOneScreen.kt', path: 'app/src/main/java/com/learnenglish/kids/ui/screens/TapRightOneScreen.kt', content: tapRightOneScreenRaw },
  { name: 'SpellWordScreen.kt', path: 'app/src/main/java/com/learnenglish/kids/ui/screens/SpellWordScreen.kt', content: spellWordScreenRaw },
  { name: 'ChallengeModeScreen.kt', path: 'app/src/main/java/com/learnenglish/kids/ui/screens/ChallengeModeScreen.kt', content: challengeModeScreenRaw },
  { name: 'ProfileScreen.kt', path: 'app/src/main/java/com/learnenglish/kids/ui/screens/ProfileScreen.kt', content: profileScreenRaw },
  { name: 'app/build.gradle.kts', path: 'app/build.gradle.kts', content: appBuildGradleRaw },
  { name: 'build.gradle.kts', path: 'build.gradle.kts', content: rootBuildGradleRaw },
  { name: 'settings.gradle.kts', path: 'settings.gradle.kts', content: settingsGradleRaw },
  { name: 'AndroidManifest.xml', path: 'app/src/main/AndroidManifest.xml', content: androidManifestRaw },
  { name: 'strings.xml', path: 'app/src/main/res/values/strings.xml', content: stringsXmlRaw },
  { name: 'ic_launcher.xml', path: 'app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml', content: icLauncherXmlRaw },
  { name: 'ic_launcher_round.xml', path: 'app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml', content: icLauncherRoundXmlRaw },
  { name: 'ic_launcher_background.xml', path: 'app/src/main/res/drawable/ic_launcher_background.xml', content: icLauncherBgRaw },
  { name: 'ic_launcher_foreground.xml', path: 'app/src/main/res/drawable/ic_launcher_foreground.xml', content: icLauncherFgRaw },
];

export function KotlinSourceModal({ open, onClose }: KotlinSourceModalProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const activeFile = KOTLIN_FILES[selectedIdx];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard failure in restricted iframes
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Android Kotlin and Jetpack Compose Source Files"
    >
      <div className="flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <FileCode2 className="h-6 w-6 text-indigo-600" />
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                Android Kotlin &amp; Jetpack Compose Project
              </h2>
              <p className="text-xs font-medium text-slate-500">
                Complete Android source files located in /android
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
            aria-label="Close source viewer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <nav className="flex w-full shrink-0 gap-1 overflow-x-auto border-b border-slate-200 bg-slate-50 p-3 md:w-64 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r">
            {KOTLIN_FILES.map((file, idx) => (
              <button
                key={file.path}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`rounded-xl px-3 py-2 text-left text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  selectedIdx === idx
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                {file.name}
              </button>
            ))}
          </nav>

          <div className="flex min-h-0 flex-1 flex-col bg-slate-900 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
              <span className="font-code text-xs text-slate-400">
                {activeFile.path}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-700 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy File</span>
                  </>
                )}
              </button>
            </div>

            <pre className="font-code flex-1 overflow-auto p-5 text-xs leading-relaxed text-slate-100 sm:text-sm">
              <code>{activeFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
