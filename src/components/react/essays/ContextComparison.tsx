import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// ── Item types ──

type SessionItem = { type: 'session'; id: number; at: number };
type UserItem = { type: 'user'; text: string; at: number };
type AiItem = { type: 'ai'; text: string; at: number; question?: boolean };
type ToolItem = { type: 'tool'; text: string; at: number };
type DividerItem = { type: 'divider'; at: number };
type Item = SessionItem | UserItem | AiItem | ToolItem | DividerItem;

// ── Data: No context (stateless) ──

const STATELESS_ITEMS: Item[] = [
  { type: 'session', id: 1, at: 0 },
  { type: 'user', text: 'Investigate support ticket SUP-123', at: 0.04 },
  {
    type: 'ai',
    text: "I don't have access to that ticket. What system is it tracked in? What's the issue?",
    at: 0.15,
    question: true,
  },
  {
    type: 'user',
    text: "It's in Linear. User hasn't received payment - probably Supabase. Here are the logs:\n[14:31:02] ERR payment.webhook timeout\n[14:31:03] ERR edge_fn: payment-process",
    at: 0.29,
  },
  {
    type: 'ai',
    text: 'Based on those logs, the webhook timed out - likely a Supabase edge function failure. Check payment-process errors around 14:31.',
    at: 0.43,
  },
  { type: 'divider', at: 0.55 },
  { type: 'session', id: 2, at: 0.57 },
  { type: 'user', text: "What's the status of SUP-123?", at: 0.63 },
  {
    type: 'ai',
    text: "I don't have context for that ticket.",
    at: 0.79,
  },
];

// ── Data: With context (persistent) ──

const PERSISTENT_ITEMS: Item[] = [
  { type: 'session', id: 1, at: 0 },
  { type: 'user', text: 'Investigate support ticket SUP-123', at: 0.04 },
  { type: 'tool', text: 'Fetching Linear · SUP-123', at: 0.07 },
  { type: 'tool', text: 'Querying Supabase · payment_logs', at: 0.14 },
  { type: 'tool', text: 'Pulling Datadog · traces', at: 0.21 },
  {
    type: 'ai',
    text: 'Root cause: Supabase edge_fn timed out at 500ms - webhook never fired. Applying fix...',
    at: 0.30,
  },
  { type: 'tool', text: 'Updating Supabase · edge_fn timeout → 2s', at: 0.38 },
  { type: 'tool', text: 'Closing Linear · SUP-123 → Done', at: 0.45 },
  {
    type: 'ai',
    text: 'Done. Timeout bumped to 2s and deployed. Ticket closed.',
    at: 0.52,
  },
  { type: 'divider', at: 0.61 },
  { type: 'session', id: 2, at: 0.63 },
  { type: 'user', text: "What's the status of SUP-123?", at: 0.69 },
  { type: 'tool', text: 'Checking Linear · SUP-123', at: 0.73 },
  {
    type: 'ai',
    text: 'Resolved. Agent closed it at 15:45 UTC - status: Done. Fix: edge function timeout bumped to 2s.',
    at: 0.81,
  },
];

// ── Shared sub-components ──

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

function ChatPanel({
  items,
  complexity,
  hasStarted,
  label,
  badge,
  badgeStyle,
}: {
  items: Item[];
  complexity: number;
  hasStarted: boolean;
  label: string;
  badge: string;
  badgeStyle: 'muted' | 'active';
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const visible = items.filter((item) => complexity >= item.at);

  const nextItem = items[visible.length];
  const lastVisible = visible[visible.length - 1];
  const showTyping =
    nextItem?.type === 'ai' &&
    lastVisible &&
    (lastVisible.type === 'user' || lastVisible.type === 'tool') &&
    complexity >= lastVisible.at + 0.02 &&
    complexity < nextItem.at;

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
        <span
          className={`text-[10px] font-mono rounded-sm px-1.5 py-px ${
            badgeStyle === 'active'
              ? 'text-stone-600 border border-stone-300 bg-stone-100/50'
              : 'text-stone-400 border border-dashed border-stone-300'
          }`}
        >
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
                    key={`s${item.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1.5 pt-0.5"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0" />
                    <span className="text-[10px] font-mono text-stone-500 font-medium">
                      Chat {item.id}
                    </span>
                  </motion.div>
                );
              }

              if (item.type === 'divider') {
                return (
                  <motion.div
                    key="div"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center gap-2.5 my-3"
                  >
                    <div className="flex-1 border-t border-stone-200" />
                    <span className="text-[10px] font-mono text-stone-400 shrink-0 tracking-widest uppercase">
                      new chat
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
                    <div className="max-w-[78%] px-2.5 py-1.5 rounded-2xl rounded-tr-sm bg-stone-100 border border-stone-200">
                      <p className="text-[11px] text-stone-700 leading-relaxed whitespace-pre-line">
                        {item.text}
                      </p>
                    </div>
                  </motion.div>
                );
              }

              if (item.type === 'tool') {
                return (
                  <motion.div
                    key={`t${i}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="flex justify-start"
                  >
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-stone-100/80 border border-stone-200">
                      <svg
                        className="w-2.5 h-2.5 text-stone-500 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span className="text-[10px] font-mono text-stone-600">{item.text}</span>
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
                    <div
                      className={`max-w-[82%] px-2.5 py-1.5 rounded-2xl rounded-tl-sm border ${
                        (item as AiItem).question
                          ? 'bg-stone-100/60 border-stone-200'
                          : 'bg-stone-50 border-stone-200'
                      }`}
                    >
                      <p className="text-[11px] leading-relaxed whitespace-pre-line text-stone-700">
                        {item.text}
                      </p>
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

export default function ContextComparison() {
  // progress: 0 -> 2. Left panel uses 0->1, right panel uses 1->2 (mapped to 0->1).
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [activeTab, setActiveTab] = useState<'without' | 'with'>('without');
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Preview (not started): show full end state so user can see both panels before playing.
  const leftComplexity = hasStarted ? Math.min(progress, 1) : 1;
  const rightComplexity = hasStarted ? Math.max(Math.min(progress - 1, 1), 0) : 1;

  useEffect(() => {
    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, []);

  // Two phases: left panel 0->1, then right panel 0->1 (progress 0->2)
  const runAnimation = useCallback(() => {
    setIsAnimating(true);
    setHasStarted(true);

    if (prefersReducedMotion) {
      setProgress(2);
      setIsAnimating(false);
      return;
    }

    let current = 0;
    animationRef.current = setInterval(() => {
      current += 0.01;
      if (current >= 2) {
        setProgress(2);
        if (animationRef.current) clearInterval(animationRef.current);
        setIsAnimating(false);
      } else {
        setProgress(current);
      }
    }, 150);
  }, [prefersReducedMotion]);

  const startAnimation = useCallback(() => {
    if (isAnimating) return;
    if (progress >= 2) {
      if (animationRef.current) clearInterval(animationRef.current);
      setProgress(0);
      setTimeout(runAnimation, prefersReducedMotion ? 0 : 300);
      return;
    }
    runAnimation();
  }, [progress, isAnimating, prefersReducedMotion, runAnimation]);

  const skipToEnd = useCallback(() => {
    if (animationRef.current) clearInterval(animationRef.current);
    setProgress(2);
    setIsAnimating(false);
  }, []);

  const panelBlur = {
    filter: 'blur(0px)',
    opacity: 1,
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
            onClick={() => setActiveTab('without')}
            className={`flex-1 px-4 py-2 font-mono text-[11px] tracking-wider uppercase transition-colors cursor-pointer ${
              activeTab === 'without'
                ? 'bg-stone-100 text-stone-600'
                : 'text-stone-400 hover:text-stone-500'
            }`}
          >
            no context
          </button>
          <button
            onClick={() => setActiveTab('with')}
            className={`flex-1 px-4 py-2 font-mono text-[11px] tracking-wider uppercase transition-colors border-l border-stone-200 cursor-pointer ${
              activeTab === 'with'
                ? 'bg-white text-stone-700'
                : 'text-stone-400 hover:text-stone-500'
            }`}
          >
            with context
          </button>
        </div>

        <div className="relative">
          <motion.div
            className={`relative w-full h-[340px] rounded-xl overflow-hidden border ${
              activeTab === 'with'
                ? 'border-stone-200 bg-white'
                : 'border-stone-200 bg-stone-50/50'
            }`}
            animate={panelBlur}
            transition={panelTransition}
          >
            {activeTab === 'without' ? (
              <ChatPanel
                items={STATELESS_ITEMS}
                complexity={leftComplexity}
                hasStarted={hasStarted}
                label="no context"
                badge="no memory"
                badgeStyle="muted"
              />
            ) : (
              <ChatPanel
                items={PERSISTENT_ITEMS}
                complexity={rightComplexity}
                hasStarted={hasStarted}
                label="with context"
                badge="context aware"
                badgeStyle="active"
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
              {/* Left - dims when right phase is active */}
              <motion.div
                className="relative h-full bg-stone-50/50"
                animate={{ opacity: isAnimating && progress >= 1 ? 0.32 : 1 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.7, ease: 'easeInOut' }}
              >
                <ChatPanel
                  items={STATELESS_ITEMS}
                  complexity={leftComplexity}
                  hasStarted={hasStarted}
                  label="no context"
                  badge="no memory"
                  badgeStyle="muted"
                />
              </motion.div>
              {/* Right - dims when left phase is active */}
              <motion.div
                className="relative h-full bg-white"
                animate={{ opacity: isAnimating && progress < 1 ? 0.32 : 1 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.7, ease: 'easeInOut' }}
              >
                <ChatPanel
                  items={PERSISTENT_ITEMS}
                  complexity={rightComplexity}
                  hasStarted={hasStarted}
                  label="with context"
                  badge="context aware"
                  badgeStyle="active"
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
