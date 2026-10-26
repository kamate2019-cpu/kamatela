import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Disc, Sparkles, CheckCircle2, XCircle, RotateCw, Coins, Award } from 'lucide-react';
import { soundEffects } from '@/utils/audioEffects';
import { toast } from 'sonner';

interface VoiceRoomGamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomTitle: string;
  onRewardCoins: (coins: number, gameName: string) => void;
}

interface TriviaQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  {
    question: 'Which music genre originated from South Africa and took the world by storm?',
    options: ['Amapiano', 'Reggae', 'Bossa Nova', 'Flamenco'],
    correctIndex: 0,
    explanation: 'Amapiano emerged in South Africa in the mid-2010s, combining deep house, jazz, and lounge music.',
  },
  {
    question: 'What is the fastest growing mobile payment ecosystem in East Africa?',
    options: ['M-Pesa', 'Apple Pay', 'Venmo', 'Alipay'],
    correctIndex: 0,
    explanation: 'M-Pesa was launched by Safaricom in Kenya and revolutionised mobile financial services worldwide.',
  },
  {
    question: 'Which West African city is famously known as the entertainment and Nollywood capital?',
    options: ['Lagos', 'Nairobi', 'Accra', 'Dakar'],
    correctIndex: 0,
    explanation: 'Lagos, Nigeria is the vibrant hub of Afrobeats, Nollywood cinema, and youth digital culture.',
  },
  {
    question: 'In digital music creation, what does "stem separation" mean?',
    options: [
      'Splitting a song into vocals, beats, and bass',
      'Compressing an MP3 file into a ZIP',
      'Adding guitar distortion effects',
      'Changing the tempo of a song',
    ],
    correctIndex: 0,
    explanation: 'Stem separation isolates individual audio channels like Vocals, Drums/Beat, and Bass for remixing.',
  },
  {
    question: 'Which traditional African drum is known as the "talking drum" due to pitch modulation?',
    options: ['Djembe', 'Tama / Talking Drum', 'Bongos', 'Cajon'],
    correctIndex: 1,
    explanation: 'The talking drum (Tama / Dùndún) can mimic tone, pitch, and rhythms of human speech.',
  },
];

const WHEEL_PRIZES = [
  { label: '50 Coins', coins: 50, color: '#8b5cf6' },
  { label: '20 Coins', coins: 20, color: '#06b6d4' },
  { label: '100 Coins', coins: 100, color: '#f59e0b' },
  { label: '10 Coins', coins: 10, color: '#10b981' },
  { label: '250 Coins', coins: 250, color: '#ec4899' },
  { label: '30 Coins', coins: 30, color: '#6366f1' },
  { label: '500 Coins', coins: 500, color: '#eab308' },
  { label: '75 Coins', coins: 75, color: '#14b8a6' },
];

export const VoiceRoomGamesModal: React.FC<VoiceRoomGamesModalProps> = ({
  isOpen,
  onClose,
  roomTitle,
  onRewardCoins,
}) => {
  const [activeTab, setActiveTab] = useState<'trivia' | 'wheel'>('trivia');

  // Trivia state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [triviaScore, setTriviaScore] = useState(0);
  const [triviaFinished, setTriviaFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  // Wheel state
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<{ label: string; coins: number } | null>(null);

  // Trivia timer
  useEffect(() => {
    if (!isOpen || activeTab !== 'trivia' || isAnswered || triviaFinished) return;

    if (timeLeft <= 0) {
      // Time expired
      setIsAnswered(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, activeTab, timeLeft, isAnswered, triviaFinished]);

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;

    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === TRIVIA_QUESTIONS[currentQIndex].correctIndex;
    if (isCorrect) {
      soundEffects.playConnectedChime();
      setTriviaScore((prev) => prev + 1);
      toast.success('Correct answer! +20 points');
    } else {
      soundEffects.playHangupBeep();
      toast.error('Not quite! Check the explanation below');
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex + 1 < TRIVIA_QUESTIONS.length) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(15);
    } else {
      // Finish trivia
      setTriviaFinished(true);
      const earnedCoins = (triviaScore + (selectedOption === TRIVIA_QUESTIONS[currentQIndex].correctIndex ? 1 : 0)) * 25;
      if (earnedCoins > 0) {
        onRewardCoins(earnedCoins, 'Trivia Stage Quiz');
        toast.success(`🎉 Trivia Master! You won ${earnedCoins} Coins!`);
      }
    }
  };

  const resetTrivia = () => {
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setTriviaScore(0);
    setTriviaFinished(false);
    setTimeLeft(15);
  };

  const handleSpinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setWonPrize(null);

    // Pick random prize
    const prizeIndex = Math.floor(Math.random() * WHEEL_PRIZES.length);
    const selectedPrize = WHEEL_PRIZES[prizeIndex];

    // Calculate rotation: at least 5 full rotations + slice offset
    const sliceAngle = 360 / WHEEL_PRIZES.length;
    const targetAngle = 360 * 5 + (360 - (prizeIndex * sliceAngle + sliceAngle / 2));
    const nextRotation = wheelRotation + targetAngle;

    setWheelRotation(nextRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(selectedPrize);
      soundEffects.playConnectedChime();
      onRewardCoins(selectedPrize.coins, 'Coin Lucky Wheel');
      toast.success(`🎡 Lucky Wheel Landed on ${selectedPrize.label}!`);
    }, 4000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-zinc-950 border border-purple-500/30 text-white p-5 rounded-3xl shadow-2xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-bold border border-purple-500/30">
              Live Stage Interactive Games
            </span>
            <span className="text-xs text-white/60 truncate max-w-[180px]">{roomTitle}</span>
          </div>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Stage Arena & Coin Rewards
          </DialogTitle>
          <DialogDescription className="text-xs text-white/70">
            Play with fellow listeners and win virtual coins credited to your wallet!
          </DialogDescription>
        </DialogHeader>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 rounded-2xl border border-white/10 my-1">
          <button
            type="button"
            onClick={() => setActiveTab('trivia')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'trivia'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            African Culture & Music Trivia
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('wheel')}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'wheel'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Disc className="w-4 h-4 text-cyan-400" />
            Coin Lucky Wheel
          </button>
        </div>

        {/* TAB 1: TRIVIA QUIZ */}
        {activeTab === 'trivia' && (
          <div className="space-y-4 pt-1">
            {!triviaFinished ? (
              <>
                <div className="flex items-center justify-between text-xs text-white/80 pb-1 border-b border-white/10">
                  <span className="font-semibold text-purple-300">
                    Question {currentQIndex + 1} of {TRIVIA_QUESTIONS.length}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-bold text-amber-400">
                      <Coins className="w-3.5 h-3.5" /> Score: {triviaScore * 25} Coins
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-mono text-xs font-bold ${
                        timeLeft <= 5 ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-white/10 text-white'
                      }`}
                    >
                      ⏱️ {timeLeft}s
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/90 border border-white/10 shadow-inner">
                  <h3 className="text-sm md:text-base font-bold text-white leading-snug">
                    {TRIVIA_QUESTIONS[currentQIndex].question}
                  </h3>
                </div>

                {/* Options List */}
                <div className="grid grid-cols-1 gap-2">
                  {TRIVIA_QUESTIONS[currentQIndex].options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === TRIVIA_QUESTIONS[currentQIndex].correctIndex;

                    let btnStyle = 'bg-zinc-900 hover:bg-zinc-800 border-white/10 text-white';
                    if (isAnswered) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-500/30 border-emerald-500 text-emerald-200 font-bold';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-500/30 border-rose-500 text-rose-200 font-bold';
                      } else {
                        btnStyle = 'bg-zinc-900/40 border-white/5 text-white/40';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectOption(idx)}
                        disabled={isAnswered}
                        className={`w-full p-3 rounded-xl border text-left text-xs md:text-sm transition-all flex items-center justify-between ${btnStyle}`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs shrink-0">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{option}</span>
                        </span>
                        {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                        {isAnswered && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback Note & Next Button */}
                {isAnswered && (
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 space-y-2 animate-in fade-in">
                    <p className="font-semibold">{TRIVIA_QUESTIONS[currentQIndex].explanation}</p>
                    <div className="flex justify-end pt-1">
                      <Button
                        size="sm"
                        onClick={handleNextQuestion}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl"
                      >
                        {currentQIndex + 1 < TRIVIA_QUESTIONS.length ? 'Next Question →' : 'View Final Results 🎉'}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Trivia Completion Summary */
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95">
                <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-2xl">
                  🏆
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">Stage Trivia Completed!</h3>
                  <p className="text-xs text-white/70">
                    You answered {triviaScore} of {TRIVIA_QUESTIONS.length} correctly.
                  </p>
                </div>

                <div className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-emerald-500/20 border border-white/20">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Coins Credited</p>
                  <p className="text-3xl font-black text-amber-400 flex items-center justify-center gap-1.5 mt-0.5">
                    +{triviaScore * 25} <span className="text-sm font-normal text-white">Coins</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="ghost"
                    onClick={resetTrivia}
                    className="rounded-xl border border-white/60 text-white hover:bg-white/10"
                  >
                    <RotateCw className="w-3.5 h-3.5 mr-1.5" /> Play Again
                  </Button>
                  <Button
                    onClick={() => setActiveTab('wheel')}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl"
                  >
                    Spin Lucky Wheel →
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: COIN LUCKY WHEEL */}
        {activeTab === 'wheel' && (
          <div className="flex flex-col items-center justify-center py-2 space-y-4">
            <div className="relative w-56 h-56 flex items-center justify-center">
              {/* Wheel Pointer Arrow */}
              <div className="absolute -top-3 z-30 flex flex-col items-center">
                <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 drop-shadow-md" />
              </div>

              {/* Rotating Wheel Container */}
              <div
                className="w-full h-full rounded-full border-4 border-amber-400 shadow-2xl overflow-hidden relative"
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
                }}
              >
                {/* Wheel SVG Slices */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {WHEEL_PRIZES.map((prize, idx) => {
                    const total = WHEEL_PRIZES.length;
                    const angle = 360 / total;
                    const startAngle = idx * angle;
                    const endAngle = startAngle + angle;

                    // Convert to radians for SVG path
                    const startRad = ((startAngle - 90) * Math.PI) / 180;
                    const endRad = ((endAngle - 90) * Math.PI) / 180;

                    const x1 = 50 + 50 * Math.cos(startRad);
                    const y1 = 50 + 50 * Math.sin(startRad);
                    const x2 = 50 + 50 * Math.cos(endRad);
                    const y2 = 50 + 50 * Math.sin(endRad);

                    const path = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                    // Mid angle for text placement
                    const midAngle = startAngle + angle / 2;

                    return (
                      <g key={idx}>
                        <path d={path} fill={prize.color} stroke="#18181b" strokeWidth="0.8" />
                        <text
                          x="50"
                          y="18"
                          fill="#ffffff"
                          fontSize="5"
                          fontWeight="bold"
                          textAnchor="middle"
                          transform={`rotate(${midAngle}, 50, 50)`}
                        >
                          {prize.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Center Hub */}
                <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-zinc-950 border-2 border-amber-400 flex items-center justify-center text-xs font-black text-amber-400 shadow-lg">
                  WIN
                </div>
              </div>
            </div>

            {/* Won Result Banner */}
            {wonPrize && !isSpinning && (
              <div className="px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Congratulations! You won {wonPrize.label} (+{wonPrize.coins} Coins)!
              </div>
            )}

            {/* Spin CTA */}
            <div className="w-full flex justify-center pt-2">
              <Button
                onClick={handleSpinWheel}
                disabled={isSpinning}
                className="w-full max-w-xs py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-pink-500 hover:opacity-95 text-white font-black text-sm shadow-xl active:scale-95 transition-all"
              >
                {isSpinning ? (
                  <span className="flex items-center gap-2">
                    <RotateCw className="w-4 h-4 animate-spin" /> Spinning Lucky Wheel...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Spin Lucky Wheel (Free) 🎡
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
