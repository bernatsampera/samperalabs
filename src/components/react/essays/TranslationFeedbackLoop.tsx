import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// ── Item types ──

type SessionItem = { type: 'session'; label: string; at: number };
type UserItem = { type: 'user'; text: string; at: number };
type AiItem = { type: 'ai'; text: string; at: number; highlight?: string };
type CorrectionItem = { type: 'correction'; from: string; to: string; at: number };
type GlossaryItem = { type: 'glossary'; text: string; at: number };
type DividerItem = { type: 'divider'; label: string; at: number };
type Item = SessionItem | UserItem | AiItem | CorrectionItem | GlossaryItem | DividerItem;

// ── Data: Stateless translator ──

const STATELESS_ITEMS: Item[] = [
  { type: 'session', label: 'Translation 1', at: 0 },
  { type: 'user', text: 'The board meeting was moved to Friday.', at: 0.04 },
  {
    type: 'ai',
    text: 'La reunión de consejo se ha movido al viernes.',
    at: 0.14,
    highlight: 'reunión de consejo',
  },
  { type: 'correction', from: 'reunión de consejo', to: 'reunión directiva', at: 0.26 },
  {
    type: 'ai',
    text: 'La reunión directiva se ha movido al viernes.',
    at: 0.38,
  },
  { type: 'divider', label: 'next day', at: 0.48 },
  { type: 'session', label: 'Translation 2', at: 0.52 },
  { type: 'user', text: 'Prepare the board meeting agenda.', at: 0.56 },
  {
    type: 'ai',
    text: 'Prepara la agenda de la reunión de consejo.',
    at: 0.68,
    highlight: 'reunión de consejo',
  },
  { type: 'correction', from: 'reunión de consejo', to: 'reunión directiva', at: 0.80 },
  {
    type: 'ai',
    text: 'Prepara la agenda de la reunión directiva.',
    at: 0.92,
  },
];

// ── Data: Learning translator ──

const LEARNING_ITEMS: Item[] = [
  { type: 'session', label: 'Translation 1', at: 0 },
  { type: 'user', text: 'The board meeting was moved to Friday.', at: 0.04 },
  {
    type: 'ai',
    text: 'La reunión de consejo se ha movido al viernes.',
    at: 0.14,
    highlight: 'reunión de consejo',
  },
  { type: 'correction', from: 'reunión de consejo', to: 'reunión directiva', at: 0.26 },
  {
    type: 'ai',
    text: 'La reunión directiva se ha movido al viernes.',
    at: 0.38,
  },
  { type: 'glossary', text: 'board meeting → reunión directiva', at: 0.44 },
  { type: 'divider', label: 'next day', at: 0.48 },
  { type: 'session', label: 'Translation 2', at: 0.52 },
  { type: 'user', text: 'Prepare the board meeting agenda.', at: 0.56 },
  {
    type: 'ai',
    text: 'Prepara la agenda de la reunión directiva.',
    at: 0.68,
  },
];

// ── Shared sub-components ──

function HighlightedText({ text, highlight }: { text: string; highlight?: string }) {
  if (!highlight) return <>{text}</>;
  const idx = text.indexOf(highlight);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="bg-red-100 text-red-700 rounded px-0.5">{highlight}</span>
      {text.slice(idx + highlight.length)}
    </>
  );
}

function TypingDots() {
  return (
    <div className="flex justify-start">
      <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm bg-stone-50 border border-stone-200">
        <div className="flex gap-1 items-center">
          {[0, 0.18, 0.36].map((delay) => (
            <motion.div
              key={delay}
              className="w-1 h-1 rounded-full bg-stone-400"
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, delay, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Panel component ──

function TranslatorPanel({
  items,
  progress,
  hasStarted,
  label,
  badge,
}: {
  items: Item[];
  progress: number;
  hasStarted: boolean;
  label: string;
  badge: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const visible = items.filter((item) => progress >= item.at);

  const nextItem = items[visible.length];
  const lastVisible = visible[visible.length - 1];
  const showTyping =
    nextItem?.type === 'ai' &&
    lastVisible &&
    (lastVisible.type === 'user' || lastVisible.type === 'correction') &&
    progress >= lastVisible.at + 0.03;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visible.length, showTyping]);

  return (
    <div className="w-full h-full flex flex-col font-mono">
      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-stone-200 bg-stone-50 shrink-0">
        <span className="text-[10px] font-mono text-stone-500 tracking-wider uppercase font-medium">
          {label}
        </span>
        <span className="text-[10px] font-mono text-stone-400 border border-stone-200 rounded-sm px-1.5 py-px">
          {badge}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 relative min-h-0">
        <div
          ref={scrollRef}
          className="absolute inset-0 overflow-y-auto p-3 flex flex-col gap-2"
          style={{ scrollbarWidth: 'none' }}
        >
          <AnimatePresence initial={false}>
            {visible.map((item, i) => {
              if (item.type === 'session') {
                return (
                  <motion.div
                    key={`s${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1.5 pt-0.5"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0" />
                    <span className="text-[10px] font-mono text-stone-500 font-medium">
                      {item.label}
                    </span>
                  </motion.div>
                );
              }

              if (item.type === 'divider') {
                return (
                  <motion.div
                    key={`d${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center gap-2.5 my-3"
                  >
                    <div className="flex-1 border-t border-stone-200" />
                    <span className="text-[10px] font-mono text-stone-400 shrink-0 tracking-widest uppercase">
                      {item.label}
                    </span>
                    <div className="flex-1 border-t border-stone-200" />
                  </motion.div>
                );
              }

              if (item.type === 'user') {
                return (
                  <motion.div
                    key={`u${i}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="flex justify-end"
                  >
                    <div className="max-w-[82%] px-2.5 py-1.5 rounded-2xl rounded-tr-sm bg-stone-100 border border-stone-200">
                      <p className="text-[11px] text-stone-700 leading-relaxed">{item.text}</p>
                    </div>
                  </motion.div>
                );
              }

              if (item.type === 'ai') {
                return (
                  <motion.div
                    key={`a${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[82%] px-2.5 py-1.5 rounded-2xl rounded-tl-sm bg-stone-50 border border-stone-200">
                      <p className="text-[11px] text-stone-700 leading-relaxed">
                        <HighlightedText text={item.text} highlight={item.highlight} />
                      </p>
                    </div>
                  </motion.div>
                );
              }

              if (item.type === 'correction') {
                return (
                  <motion.div
                    key={`c${i}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="flex justify-end"
                  >
                    <div className="max-w-[82%] flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
                      <svg
                        className="w-3 h-3 text-amber-500 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      <span className="text-[10px] text-amber-700 font-mono">
                        <span className="line-through opacity-60">{item.from}</span>
                        {' → '}
                        <span className="font-medium">{item.to}</span>
                      </span>
                    </div>
                  </motion.div>
                );
              }

              if (item.type === 'glossary') {
                return (
                  <motion.div
                    key={`g${i}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="flex justify-start"
                  >
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200">
                      <svg
                        className="w-2.5 h-2.5 text-emerald-600 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="text-[10px] font-mono text-emerald-700">
                        Saved: {item.text}
                      </span>
                    </div>
                  </motion.div>
                );
              }

              return null;
            })}
          </AnimatePresence>

          <AnimatePresence>
            {showTyping && (
              <motion.div
                key="typing"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <TypingDots />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="h-1 shrink-0" />
        </div>
      </div>
    </div>
  );
}

// ── Main component ──

export default function TranslationFeedbackLoop() {
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [activeTab, setActiveTab] = useState<'stateless' | 'learns'>('stateless');
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const displayProgress = hasStarted ? progress : 1;

  useEffect(() => {
    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, []);

  const runAnimation = useCallback(() => {
    setIsAnimating(true);
    setHasStarted(true);

    if (prefersReducedMotion) {
      setProgress(1);
      setIsAnimating(false);
      return;
    }

    let current = 0;
    animationRef.current = setInterval(() => {
      current += 0.005;
      if (current >= 1) {
        setProgress(1);
        if (animationRef.current) clearInterval(animationRef.current);
        setIsAnimating(false);
      } else {
        setProgress(current);
      }
    }, 150);
  }, [prefersReducedMotion]);

  const startAnimation = useCallback(() => {
    if (isAnimating) return;
    if (progress >= 1) {
      if (animationRef.current) clearInterval(animationRef.current);
      setProgress(0);
      setTimeout(runAnimation, prefersReducedMotion ? 0 : 300);
      return;
    }
    runAnimation();
  }, [progress, isAnimating, prefersReducedMotion, runAnimation]);

  const skipToEnd = useCallback(() => {
    if (animationRef.current) clearInterval(animationRef.current);
    setProgress(1);
    setIsAnimating(false);
  }, []);

  const panelBlur = {
    filter: hasStarted ? 'blur(0px)' : 'blur(1.5px)',
    opacity: hasStarted ? 1 : 0.65,
  };
  const panelTransition = { duration: prefersReducedMotion ? 0 : 0.4 };

  const controls = (
    <div className="flex justify-center mt-4 gap-5">
      {isAnimating && (
        <button
          onClick={skipToEnd}
          className="px-4 py-1.5 text-stone-400 font-mono text-[11px] hover:text-stone-600 transition-colors cursor-pointer"
        >
          skip
        </button>
      )}
      {!isAnimating && hasStarted && (
        <button
          onClick={startAnimation}
          className="flex items-center gap-1.5 px-4 py-1.5 text-stone-400 font-mono text-[11px] hover:text-stone-600 transition-colors cursor-pointer"
        >
          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          Play again
        </button>
      )}
    </div>
  );

  const playButton = (
    <button
      onClick={startAnimation}
      className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white font-mono text-[12px] rounded-lg hover:bg-stone-700 transition-colors cursor-pointer"
    >
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
      Watch the difference
    </button>
  );

  return (
    <div className="w-full">
      {/* ── Mobile: tab switcher ── */}
      <div className="lg:hidden">
        <div className="flex rounded-lg border border-stone-200 overflow-hidden mb-3">
          <button
            onClick={() => setActiveTab('stateless')}
            className={`flex-1 px-4 py-2 font-mono text-[11px] tracking-wider uppercase transition-colors cursor-pointer ${
              activeTab === 'stateless'
                ? 'bg-stone-100 text-stone-600'
                : 'text-stone-400 hover:text-stone-500'
            }`}
          >
            stateless
          </button>
          <button
            onClick={() => setActiveTab('learns')}
            className={`flex-1 px-4 py-2 font-mono text-[11px] tracking-wider uppercase transition-colors border-l border-stone-200 cursor-pointer ${
              activeTab === 'learns'
                ? 'bg-white text-stone-700'
                : 'text-stone-400 hover:text-stone-500'
            }`}
          >
            learns
          </button>
        </div>

        <div className="relative">
          <motion.div
            className={`relative w-full h-[380px] rounded-xl overflow-hidden border ${
              activeTab === 'learns'
                ? 'border-stone-200 bg-white'
                : 'border-stone-200 bg-stone-50/50'
            }`}
            animate={panelBlur}
            transition={panelTransition}
          >
            {activeTab === 'stateless' ? (
              <TranslatorPanel
                items={STATELESS_ITEMS}
                progress={displayProgress}
                hasStarted={hasStarted}
                label="stateless"
                badge="no memory"
              />
            ) : (
              <TranslatorPanel
                items={LEARNING_ITEMS}
                progress={displayProgress}
                hasStarted={hasStarted}
                label="learns"
                badge="remembers"
              />
            )}
          </motion.div>
          {!hasStarted && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              {playButton}
            </div>
          )}
        </div>

        {hasStarted && controls}
      </div>

      {/* ── Desktop: side-by-side ── */}
      <div className="hidden lg:block">
        <div className="relative">
          <motion.div
            className="rounded-xl border border-stone-200 overflow-hidden"
            animate={panelBlur}
            transition={panelTransition}
          >
            <div className="grid grid-cols-2 divide-x divide-stone-200 h-[420px]">
              {/* Left — stateless */}
              <motion.div
                className="relative h-full bg-stone-50/50"
                animate={{
                  opacity: isAnimating && progress >= 0.48 ? 0.4 : 1,
                }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.7, ease: 'easeInOut' }}
              >
                <TranslatorPanel
                  items={STATELESS_ITEMS}
                  progress={displayProgress}
                  hasStarted={hasStarted}
                  label="stateless"
                  badge="no memory"
                />
              </motion.div>
              {/* Right — learns */}
              <motion.div
                className="relative h-full bg-white"
                animate={{
                  opacity: isAnimating && progress < 0.48 ? 0.4 : 1,
                }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.7, ease: 'easeInOut' }}
              >
                <TranslatorPanel
                  items={LEARNING_ITEMS}
                  progress={displayProgress}
                  hasStarted={hasStarted}
                  label="learns"
                  badge="remembers"
                />
              </motion.div>
            </div>
          </motion.div>

          {!hasStarted && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              {playButton}
            </div>
          )}
        </div>

        {hasStarted && controls}
      </div>
    </div>
  );
}
