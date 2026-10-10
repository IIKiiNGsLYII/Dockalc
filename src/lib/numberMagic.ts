// Number Magic: Prime, Fibonacci, and Easter Egg helpers

export function isPrimeNumber(n: number): boolean {
  if (n <= 1 || !Number.isInteger(n) || n > 100000000) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

export function isFibonacciNumber(n: number): boolean {
  if (n < 0 || !Number.isInteger(n) || n > 100000000) return false;
  function isPerfectSquare(x: number) {
    const s = Math.round(Math.sqrt(x));
    return s * s === x;
  }
  return isPerfectSquare(5 * n * n + 4) || isPerfectSquare(5 * n * n - 4);
}

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'legendary' | 'apex' | 'epic';

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'calc' | 'wonder' | 'mode' | 'game' | 'easter';
  tier?: BadgeTier;
  isSecret?: boolean;
  secretTitle?: string;
  secretHint?: string;
}

export const ACHIEVEMENTS_LIST: AchievementItem[] = [
  // 1. Calculation Volume & Practice (29 Volume Achievements)
  {
    id: 'first-step',
    title: 'First Step',
    description: 'Complete your very first calculation on Dockalc',
    icon: '🌱',
    category: 'calc',
    tier: 'bronze',
  },
  {
    id: 'decade-club',
    title: 'Decade Club',
    description: 'Execute 10 successful calculations',
    icon: '🧮',
    category: 'calc',
    tier: 'bronze',
  },
  {
    id: 'quarter-century',
    title: 'Quarter Century',
    description: 'Execute 25 total calculations on Dockalc',
    icon: '⚡',
    category: 'calc',
    tier: 'bronze',
  },
  {
    id: 'half-century',
    title: 'Half Century',
    description: 'Reach 50 calculations across your sessions',
    icon: '🧭',
    category: 'calc',
    tier: 'bronze',
  },
  {
    id: 'centurion',
    title: 'Centurion',
    description: 'Execute 100 total calculations on Dockalc',
    icon: '🛡️',
    category: 'calc',
    tier: 'bronze',
  },
  {
    id: 'calculation-maestro',
    title: 'Calculation Maestro',
    description: 'Perform 250 calculations across your sessions',
    icon: '🥇📜',
    category: 'calc',
    tier: 'bronze',
  },
  {
    id: 'math-legend',
    title: 'Math Legend',
    description: 'Reach 500 calculations — a true numbers veteran',
    icon: '🏆✨',
    category: 'calc',
    tier: 'bronze',
  },
  {
    id: 'grandmaster-1k',
    title: 'Grandmaster',
    description: 'Surpass 1,000 lifetime calculation evaluations',
    icon: '🏛️👑',
    category: 'calc',
    tier: 'bronze',
  },
  {
    id: 'calc-2k',
    title: 'Calculation Virtuoso',
    description: 'Surpass 2,000 lifetime calculation evaluations',
    icon: '⭐💫',
    category: 'calc',
    tier: 'silver',
  },
  {
    id: 'calc-5k',
    title: 'Milestone Master',
    description: 'Execute 5,000 calculations across all your sessions',
    icon: '🔥🦅',
    category: 'calc',
    tier: 'silver',
  },
  {
    id: 'calc-10k',
    title: 'Calculation Titan',
    description: 'Surpass 10,000 total calculations on Dockcalc',
    icon: '🔱🌊',
    category: 'calc',
    tier: 'silver',
  },
  {
    id: 'calc-15k',
    title: 'Calculation Pioneer',
    description: 'Reach 15,000 calculation evaluations',
    icon: '🚀🌕',
    category: 'calc',
    tier: 'silver',
  },
  {
    id: 'calc-20k',
    title: 'Calculation Prodigy',
    description: 'Complete 20,000 lifetime calculation operations',
    icon: '⚡🔥',
    category: 'calc',
    tier: 'silver',
  },
  {
    id: 'calc-25k',
    title: 'Calculation Conqueror',
    description: 'Surpass 25,000 calculation evaluations',
    icon: '🏹🎯',
    category: 'calc',
    tier: 'silver',
  },
  {
    id: 'calc-30k',
    title: 'Calculation Trailblazer',
    description: 'Conquer 30,000 mathematical calculations',
    icon: '🔮👁️',
    category: 'calc',
    tier: 'gold',
  },
  {
    id: 'calc-40k',
    title: 'Calculation Veteran',
    description: 'Evaluate 40,000 mathematical expressions',
    icon: '🛡️⚜️',
    category: 'calc',
    tier: 'gold',
  },
  {
    id: 'calc-50k',
    title: 'Calculation Grandee',
    description: 'Hit the monumental 50,000 calculations milestone',
    icon: '💎✨',
    category: 'calc',
    tier: 'gold',
  },
  {
    id: 'calc-60k',
    title: 'Calculation Champion',
    description: 'Achieve 60,000 lifetime calculations',
    icon: '🦁👑',
    category: 'calc',
    tier: 'gold',
  },
  {
    id: 'calc-70k',
    title: 'Calculation Sovereign',
    description: 'Reach 70,000 calculation evaluations',
    icon: '☀️🔥',
    category: 'calc',
    tier: 'legendary',
  },
  {
    id: 'calc-80k',
    title: 'Calculation Mythic',
    description: 'Achieve 80,000 calculations across all sessions',
    icon: '🐉⚡',
    category: 'calc',
    tier: 'legendary',
  },
  {
    id: 'calc-90k',
    title: 'Calculation Overlord',
    description: 'Reach 90,000 calculations on Dockcalc',
    icon: '🛸🌌',
    category: 'calc',
    tier: 'legendary',
  },
  {
    id: 'calc-100k',
    title: 'Apex Megastar',
    description: 'The supreme calculation pinnacle: 100,000 calculations executed! Ascended to mathematical immortality.',
    icon: '🌌👑💎✨',
    category: 'calc',
    tier: 'apex',
  },

  // Sequential Calculation Milestones (12, 123, 1234, 12345)
  {
    id: 'seq-calc-12',
    title: 'Duo Sequence',
    description: 'Reach 12 calculations completed on Dockcalc',
    icon: '🔢',
    category: 'calc',
    tier: 'bronze',
  },
  {
    id: 'seq-calc-123',
    title: 'Trio Sequence',
    description: 'Reach 123 calculations completed on Dockcalc',
    icon: '🔺',
    category: 'calc',
    tier: 'silver',
  },
  {
    id: 'seq-calc-1234',
    title: 'Four-Digit Sequence',
    description: 'Reach 1,234 calculations completed on Dockcalc',
    icon: '🍀',
    category: 'calc',
    tier: 'gold',
  },
  {
    id: 'seq-calc-12345',
    title: 'Five-Digit Ladder',
    description: 'Reach 12,345 calculations completed on Dockcalc',
    icon: '🪜⭐',
    category: 'calc',
    tier: 'gold',
  },

  // Custom Programmable Key Milestones (1st, 100th, 1,000th, 10,000th, 50,000th, 100,000th)
  {
    id: 'custom-key-1',
    title: 'Macro Pioneer',
    description: 'Trigger a custom programmable key for the very first time',
    icon: '⚙️',
    category: 'calc',
    tier: 'bronze',
  },
  {
    id: 'custom-key-100',
    title: 'Macro Centurion',
    description: 'Execute custom programmable keys 100 times',
    icon: '🔧',
    category: 'calc',
    tier: 'silver',
  },
  {
    id: 'custom-key-1k',
    title: 'Macro Grandmaster',
    description: 'Execute custom programmable keys 1,000 times',
    icon: '🤖💻',
    category: 'calc',
    tier: 'gold',
  },
  {
    id: 'custom-key-2500',
    title: 'Custom Key Virtuoso',
    description: 'Execute custom programmable keys 2,500 times — dedicated power user!',
    icon: '🦾✨',
    category: 'calc',
    tier: 'gold',
  },
  {
    id: 'custom-key-5k',
    title: 'Macro Demigod',
    description: 'Execute custom programmable keys 5,000 times — automation mastery!',
    icon: '⚡🤖⚡',
    category: 'calc',
    tier: 'legendary',
  },
  {
    id: 'custom-key-10k',
    title: 'Macro Sovereign',
    description: 'Execute custom programmable keys 10,000 times — ultimate automation master!',
    icon: '🤖👑⚡',
    category: 'calc',
    tier: 'apex',
  },
  {
    id: 'rapid-fire',
    title: 'Rapid Fire',
    description: 'Execute 5 calculations within 15 seconds',
    icon: '⏱️',
    category: 'calc',
    tier: 'silver',
  },
  {
    id: 'tape-auditor',
    title: 'Paper Tape Auditor',
    description: 'Review or add an annotation note to the desktop paper tape',
    icon: '🧾',
    category: 'calc',
    tier: 'silver',
  },

  // 2. Mathematical Wonders, Constants & Number Theory (18 Achievements)
  {
    id: 'prime-hunter',
    title: 'Prime Explorer',
    description: 'Discover a prime number calculation result',
    icon: '💎',
    category: 'wonder',
    tier: 'bronze',
  },
  {
    id: 'prime-scholar',
    title: 'Prime Scholar',
    description: 'Discover 5 distinct prime numbers in your calculations',
    icon: '🔮',
    category: 'wonder',
    tier: 'silver',
  },
  {
    id: 'fibonacci-master',
    title: 'Golden Spiral',
    description: 'Compute a number belonging to the Fibonacci sequence',
    icon: '🌀',
    category: 'wonder',
    tier: 'bronze',
  },
  {
    id: 'fibonacci-sage',
    title: 'Fibonacci Sage',
    description: 'Reach a 3-digit Fibonacci number (144, 233, 377, 610, 987)',
    icon: '🐚',
    category: 'wonder',
    tier: 'silver',
  },
  {
    id: 'piday',
    title: 'Pi Connoisseur',
    description: 'Calculate with π or evaluate to 3.14159...',
    icon: '🥧',
    category: 'wonder',
    tier: 'silver',
  },
  {
    id: 'euler-constant',
    title: "Euler's Realm",
    description: 'Discover mathematical constant e (2.71828...)',
    icon: '📐',
    category: 'wonder',
    tier: 'silver',
  },
  {
    id: 'golden-ratio',
    title: 'Divine Proportion',
    description: 'Evaluate a result close to the Golden Ratio φ (1.618...)',
    icon: '🏛️φ',
    category: 'wonder',
    tier: 'gold',
  },
  {
    id: 'tau-master',
    title: 'Tau Master',
    description: 'Evaluate Tau constant (2π ≈ 6.28318...)',
    icon: '⭕🔄',
    category: 'wonder',
    tier: 'gold',
  },
  {
    id: 'perfect-square',
    title: 'Geometric Symmetry',
    description: 'Evaluate an integer that is a perfect square (≥ 16)',
    icon: '🔲',
    category: 'wonder',
    tier: 'bronze',
  },
  {
    id: 'cube-artisan',
    title: 'Cube Artisan',
    description: 'Evaluate an exact integer perfect cube (≥ 8: 8, 27, 64, 125...)',
    icon: '🧊',
    category: 'wonder',
    tier: 'silver',
  },
  {
    id: 'binary-power',
    title: 'Power of Two',
    description: 'Calculate an exact power of two (64, 128, 256, 512, 1024...)',
    icon: '💾',
    category: 'wonder',
    tier: 'bronze',
  },
  {
    id: 'subzero-voyager',
    title: 'Subzero Voyager',
    description: 'Evaluate a negative number calculation result',
    icon: '❄️',
    category: 'wonder',
    tier: 'bronze',
  },
  {
    id: 'absolute-zero',
    title: 'Absolute Zero',
    description: 'Evaluate a net calculation that resolves exactly to 0',
    icon: '🎯',
    category: 'wonder',
    tier: 'bronze',
  },
  {
    id: 'lucky-seven',
    title: 'One Armed Bandit',
    description: 'The best three numbers in a row to win BIG!',
    icon: '🎰',
    category: 'easter',
    tier: 'gold',
    isSecret: true,
    secretTitle: 'One Armed Bandit',
    secretHint: 'The best three numbers in a row to win BIG!',
  },
  {
    id: 'millionaire',
    title: 'Millionaire Club',
    description: 'Reach an evaluated result of 1,000,000 or greater',
    icon: '💰',
    category: 'wonder',
    tier: 'silver',
  },
  {
    id: 'billionaire',
    title: 'Billionaire Syndicate',
    description: 'Reach a colossal result of 1,000,000,000 or greater',
    icon: '🏦💎',
    category: 'wonder',
    tier: 'gold',
  },
  {
    id: 'trillionaire',
    title: 'Trillionaire Frontier',
    description: 'Surpass an astronomical result of 1,000,000,000,000',
    icon: '🪐💰',
    category: 'wonder',
    tier: 'gold',
  },
  {
    id: 'micro-precision',
    title: 'Micro Precision',
    description: 'Produce an ultra-precise result with 6+ decimal places',
    icon: '🔬',
    category: 'wonder',
    tier: 'silver',
  },

  // 3. Calculator Multi-Mode Mastery (8 Achievements)
  {
    id: 'standard-solver',
    title: 'Everyday Operator',
    description: 'Execute everyday arithmetic in Standard calculator mode',
    icon: '➕',
    category: 'mode',
    tier: 'bronze',
  },
  {
    id: 'scientific-scholar',
    title: 'Scientific Scholar',
    description: 'Perform advanced trigonometry or logarithm calculations',
    icon: '🧪',
    category: 'mode',
    tier: 'silver',
  },
  {
    id: 'bitwise-wizard',
    title: 'Bitwise Wizard',
    description: 'Execute bitwise binary/hex calculations in Programmer mode',
    icon: '💻',
    category: 'mode',
    tier: 'silver',
  },
  {
    id: 'rpn-prodigy',
    title: 'RPN Pioneer',
    description: 'Calculate using Reverse Polish Notation stack workflow',
    icon: '🥞📥',
    category: 'mode',
    tier: 'gold',
  },
  {
    id: 'financial-planner',
    title: 'Financial Planner',
    description: 'Compute a loan schedule, compound interest, or discount',
    icon: '📊',
    category: 'mode',
    tier: 'silver',
  },
  {
    id: 'global-trader',
    title: 'Global Trader',
    description: 'Convert real-time currencies or units in Convert mode',
    icon: '💱',
    category: 'mode',
    tier: 'silver',
  },
  {
    id: 'polymath',
    title: 'Calculator Polymath',
    description: 'Perform calculations across 3 or more distinct calculator modes',
    icon: '🎭',
    category: 'mode',
    tier: 'silver',
  },
  {
    id: 'all-rounder',
    title: 'Mode All-Rounder',
    description: 'Master all 6 calculation modes in your Dockalc workspace',
    icon: '🌐🎖️',
    category: 'mode',
    tier: 'gold',
  },

  // 4. Mini Utility Gadgets & Arithmetic Games (10 Achievements)
  {
    id: 'lucky-strike',
    title: 'Lucky Sixes',
    description: 'Roll a maximum 6 on the standard D6 dice',
    icon: '🎲',
    category: 'game',
    tier: 'bronze',
  },
  {
    id: 'dice-roller',
    title: 'High Roller',
    description: 'Roll a natural 20 on the D20 polyhedral dice',
    icon: '🏹',
    category: 'game',
    tier: 'silver',
  },
  {
    id: 'coin-master',
    title: 'Flip of Fate',
    description: 'Flip coins 5 times in the coin toss gadget',
    icon: '🪙',
    category: 'game',
    tier: 'bronze',
  },
  {
    id: 'coin-streak',
    title: 'Toss Oracle',
    description: 'Flip 3 matching coin sides in a row',
    icon: '✨',
    category: 'game',
    tier: 'silver',
  },
  {
    id: 'target24-solver',
    title: 'Target Solver',
    description: 'Successfully solve a Target 24 arithmetic puzzle',
    icon: '🃏',
    category: 'game',
    tier: 'silver',
  },
  {
    id: 'target24-grandmaster',
    title: 'Target Grandmaster',
    description: 'Solve 3 Target 24 math puzzles in one session',
    icon: '🏆🃏',
    category: 'game',
    tier: 'gold',
  },
  {
    id: 'sprint-starter',
    title: 'Sprint Starter',
    description: 'Complete 1 round of Mental Math Sprint speed arithmetic',
    icon: '🏃',
    category: 'game',
    tier: 'bronze',
  },
  {
    id: 'sprint-streak-5',
    title: 'Combo Striker',
    description: 'Achieve a 5-question answer streak in Mental Math Sprint',
    icon: '🔥',
    category: 'game',
    tier: 'silver',
  },
  {
    id: 'sprint-speed-demon',
    title: 'Mental Math Demon',
    description: 'Answer 12 or more correct questions in a single 30s Sprint',
    icon: '🏎️💨',
    category: 'game',
    tier: 'gold',
  },
  {
    id: 'sprint-centurion',
    title: 'Sprint Millennial',
    description: 'Score 3,500 or more points in a single Mental Math Sprint round',
    icon: '👑⚡',
    category: 'game',
    tier: 'gold',
  },

  // 5. Secret Milestones & Sensory Customization
  {
    id: 'the-answer',
    title: 'The Ultimate Answer',
    description: 'Evaluate exactly 42 (Hitchhiker’s Guide to the Galaxy)',
    icon: '🌌🐬',
    category: 'easter',
    tier: 'gold',
    isSecret: true,
    secretTitle: 'Cosmic Enigma',
    secretHint: 'Seek the ultimate answer to life, the universe, and everything...',
  },
  {
    id: 'lucky-number-13',
    title: 'Lucky Number 13',
    description: 'This is the developers favorite number',
    icon: '🍀13',
    category: 'easter',
    tier: 'gold',
    isSecret: true,
    secretTitle: 'Lucky Number 13',
    secretHint: 'This is the developers favorite number',
  },
  {
    id: 'dollys-favorite',
    title: "Dolly's Favorite",
    description: "Workin' 9 to 5, what a way to make a livin'...",
    icon: '👱‍♀️',
    category: 'easter',
    tier: 'gold',
    isSecret: true,
    secretTitle: "Dolly's Favorite",
    secretHint: "Workin' 9 to 5, what a way to make a livin'...",
  },
  {
    id: 'revolutionary',
    title: 'Revolutionary',
    description: 'A historic year of freedom and mathematical revolution...',
    icon: '🇺🇸',
    category: 'easter',
    tier: 'gold',
    isSecret: true,
    secretTitle: 'Revolutionary',
    secretHint: 'A historic year of freedom and mathematical revolution...',
  },
  {
    id: 'pocket-acrobat',
    title: 'Pocket Acrobat',
    description: 'Perform calculations with 180° upside-down mode turned on',
    icon: '🙃',
    category: 'game',
    tier: 'silver',
  },
  {
    id: 'audiophile',
    title: 'Acoustic Connoisseur',
    description: 'Experience authentic vintage typewriter or piano sound packs',
    icon: '🎧',
    category: 'game',
    tier: 'bronze',
  },
  {
    id: 'piano-virtuoso',
    title: 'Piano Virtuoso',
    description: 'Key in melodic calculations using the musical piano sound pack',
    icon: '🎹',
    category: 'game',
    tier: 'silver',
  },

  // -------------------------------------------------------------------------
  // 6. Secret Milestones from new-badge-ideas.csv (All isSecret: true, category: 'easter')
  // -------------------------------------------------------------------------
  // Time and habit
  {
    id: 'night-owl',
    title: 'Night Owl',
    description: 'Calculate between 2 and 4 a.m.',
    icon: '🦉🌙',
    category: 'easter',
    tier: 'bronze',
    isSecret: true,
    secretTitle: 'Nocturnal Reckoning',
    secretHint: 'The world sleeps, but nocturnal mathematicians crunch numbers under the moonlight...',
  },
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Calculate between 5 and 6 a.m.',
    icon: '🌅🐦',
    category: 'easter',
    tier: 'bronze',
    isSecret: true,
    secretTitle: 'Dawn Calculation',
    secretHint: 'Rise with the dawn before the rest of the world awakes...',
  },
  {
    id: 'streak-3',
    title: 'Streak 3',
    description: 'Use the app 3 days in a row',
    icon: '✨',
    category: 'easter',
    tier: 'bronze',
    isSecret: true,
    secretTitle: 'Triple Sun',
    secretHint: 'Kindle the spark of arithmetic three consecutive calendar days in a row...',
  },
  {
    id: 'streak-7',
    title: 'Streak 7',
    description: 'Use the app 7 days in a row',
    icon: '🔥',
    category: 'easter',
    tier: 'silver',
    isSecret: true,
    secretTitle: 'Weekly Flame',
    secretHint: 'A full cycle of seven days without missing a single beat...',
  },
  {
    id: 'streak-30',
    title: 'Streak 30',
    description: 'Use the app 30 days in a row',
    icon: '🌋',
    category: 'easter',
    tier: 'gold',
    isSecret: true,
    secretTitle: 'Monthly Inferno',
    secretHint: 'Thirty sunrises, thirty calculations—an unyielding mathematical discipline...',
  },
  {
    id: 'streak-100',
    title: 'Streak 100',
    description: 'Use the app 100 days in a row',
    icon: '💎⚡',
    category: 'easter',
    tier: 'legendary',
    isSecret: true,
    secretTitle: 'Centennial Chain',
    secretHint: 'One hundred consecutive days of computation etched into eternity...',
  },
  {
    id: 'streak-365',
    title: 'Streak 365',
    description: 'Use the app 365 days in a row',
    icon: '☀️🪐',
    category: 'easter',
    tier: 'legendary',
    isSecret: true,
    secretTitle: 'Solar Orbit',
    secretHint: 'One complete revolution around the sun without breaking the daily chain...',
  },
  {
    id: 'pi-day',
    title: 'Pi Day',
    description: 'Calculate on March 14',
    icon: '🥧',
    category: 'easter',
    tier: 'silver',
    isSecret: true,
    secretTitle: 'Transcendental Feast',
    secretHint: 'Celebrate the supreme mathematical holiday on the fourteenth of March...',
  },
  {
    id: 'leap-day',
    title: 'Leap Day',
    description: 'Calculate on February 29',
    icon: '📅',
    category: 'easter',
    tier: 'gold',
    isSecret: true,
    secretTitle: 'Intercalary Glitch',
    secretHint: 'A rare celestial occurrence arriving only once every four years...',
  },
  {
    id: 'midnight-countdown',
    title: 'Midnight Countdown',
    description: "Calculate at 11:59 p.m. on New Year's Eve",
    icon: '🎆',
    category: 'easter',
    tier: 'gold',
    isSecret: true,
    secretTitle: 'Final Minute',
    secretHint: 'Calculate at the very edge of the passing year as the clock nears twelve...',
  },

  // Number lore
  {
    id: 'taxi-1729',
    title: 'Taxi!',
    description: 'Get a result of 1729 (Hardy-Ramanujan number)',
    icon: '🚕',
    category: 'easter',
    tier: 'silver',
    isSecret: true,
    secretTitle: 'Taxicab Enigma',
    secretHint: 'The smallest number expressible as the sum of two cubes in two different ways...',
  },
  {
    id: 'leet-1337',
    title: 'Leet Speak',
    description: 'Get a result of 1337',
    icon: '💻',
    category: 'easter',
    tier: 'bronze',
    isSecret: true,
    secretTitle: 'Cyber Elite',
    secretHint: 'Old-school netizen dialect for champions of computation...',
  },
  {
    id: 'not-found-404',
    title: 'Not Found',
    description: 'Get a result of 404',
    icon: '🔍',
    category: 'easter',
    tier: 'bronze',
    isSecret: true,
    secretTitle: 'Missing Destination',
    secretHint: 'The most iconic web error code across the digital world...',
  },
  {
    id: 'calculator-words',
    title: 'Hello, 1980s',
    description: 'Get 07734 or 5318008 (words when read upside down)',
    icon: '📟',
    category: 'easter',
    tier: 'silver',
    isSecret: true,
    secretTitle: 'Upside-Down Lexicon',
    secretHint: 'Turn your calculator on its head to greet childhood playground memories...',
  },
  {
    id: 'perfect-number',
    title: 'Perfect Number',
    description: 'Get a result of 6, 28, 496 or 8128',
    icon: '💠',
    category: 'easter',
    tier: 'silver',
    isSecret: true,
    secretTitle: 'Divisor Harmony',
    secretHint: 'A sacred number equal to the sum of all its proper positive divisors...',
  },
  {
    id: 'palindrome',
    title: 'Palindrome',
    description: 'Get a palindromic result such as 12321 (5+ digits)',
    icon: '🪞',
    category: 'easter',
    tier: 'bronze',
    isSecret: true,
    secretTitle: 'Mirror Realm',
    secretHint: 'Reflections forward and backward look completely indistinguishable...',
  },
  {
    id: 'repdigit',
    title: 'Repdigit',
    description: 'Get a result such as 11111 (5+ identical digits)',
    icon: '🔢',
    category: 'easter',
    tier: 'bronze',
    isSecret: true,
    secretTitle: 'Monochrome Chorus',
    secretHint: 'A symphony where every single digit sings in identical unison...',
  },
  {
    id: 'kaprekar-6174',
    title: "Kaprekar's Constant",
    description: 'Get a result of 6174',
    icon: '🌀',
    category: 'easter',
    tier: 'silver',
    isSecret: true,
    secretTitle: 'Arithmetic Vortex',
    secretHint: 'The mysterious 4-digit attractor discovered by D. R. Kaprekar in 1949...',
  },
  {
    id: 'googol',
    title: 'Googol',
    description: 'Get a result of 1e100 or larger',
    icon: '🌌',
    category: 'easter',
    tier: 'legendary',
    isSecret: true,
    secretTitle: 'Cosmic Exponent',
    secretHint: 'A number surpassing all subatomic particles in the observable universe...',
  },

  // Behavior quirks
  {
    id: 'black-hole',
    title: 'Black Hole',
    description: 'Divide by zero',
    icon: '🕳️',
    category: 'easter',
    tier: 'bronze',
    isSecret: true,
    secretTitle: 'Singularity Breach',
    secretHint: 'Attempt to divide by the void and test the limits of mathematical reality...',
  },
  {
    id: 'infinity-beyond',
    title: 'Infinity and Beyond',
    description: 'Produce an infinite or overflow result',
    icon: '🚀',
    category: 'easter',
    tier: 'silver',
    isSecret: true,
    secretTitle: 'Unbounded Frontier',
    secretHint: 'Push computation beyond the finite ceiling of hardware representation...',
  },
  {
    id: 'nested-deep',
    title: 'Nested Deep',
    description: 'Nest parentheses 5 levels deep',
    icon: '🪆',
    category: 'easter',
    tier: 'silver',
    isSecret: true,
    secretTitle: 'Abyssal Brackets',
    secretHint: 'Descend five layers into the parenthesis labyrinth...',
  },
  {
    id: 'novelist',
    title: 'Novelist',
    description: 'Enter an expression with 20 or more terms',
    icon: '📜',
    category: 'easter',
    tier: 'silver',
    isSecret: true,
    secretTitle: 'Mathematical Saga',
    secretHint: 'Compose an epic equation stretching twenty terms across the parchment...',
  },
  {
    id: 'clean-slate',
    title: 'Clean Slate',
    description: 'Press clear 100 times',
    icon: '🧹',
    category: 'easter',
    tier: 'bronze',
    isSecret: true,
    secretTitle: 'Tabula Rasa',
    secretHint: 'Wipe the slate clean one hundred times to cultivate mental clarity...',
  },
  {
    id: 'copycat',
    title: 'Copycat',
    description: 'Copy results 25 times',
    icon: '📋',
    category: 'easter',
    tier: 'bronze',
    isSecret: true,
    secretTitle: 'Clipboard Scribe',
    secretHint: 'Share mathematical truths twenty-five times via the clipboard...',
  },
  {
    id: 'memory-keeper',
    title: 'Memory Keeper',
    description: 'Use memory store and recall',
    icon: '🧠',
    category: 'easter',
    tier: 'bronze',
    isSecret: true,
    secretTitle: 'Register Guardian',
    secretHint: 'Stash a value into memory and summon it back when the time is right...',
  },
  {
    id: 'history-buff',
    title: 'History Buff',
    description: 'Reopen a past calculation 10 times',
    icon: '⏳',
    category: 'easter',
    tier: 'silver',
    isSecret: true,
    secretTitle: 'Chronicle Reader',
    secretHint: 'Consult the archives of past equations ten times...',
  },
  {
    id: 'theme-hopper',
    title: 'Theme Hopper',
    description: 'Try every theme',
    icon: '🎨',
    category: 'easter',
    tier: 'silver',
    isSecret: true,
    secretTitle: 'Chameleon Chic',
    secretHint: 'Try on every single color palette the styling wardrobe has in store...',
  },

  // Gadgets and games
  {
    id: 'snake-eyes',
    title: 'Snake Eyes',
    description: "Roll two 1's back to back on the dice gadget",
    icon: '🐍',
    category: 'easter',
    tier: 'bronze',
    isSecret: true,
    secretTitle: 'Serpent Stare',
    secretHint: "Roll two 1's back to back on the dice tray...",
  },
  {
    id: 'critical-fumble',
    title: 'Critical Fumble',
    description: 'Roll a natural 1 on the D20',
    icon: '🎲💥',
    category: 'easter',
    tier: 'bronze',
    isSecret: true,
    secretTitle: 'Natural Fumble',
    secretHint: 'The 20-sided die lands on the fateful number one...',
  },
  {
    id: 'hot-hand',
    title: 'Hot Hand',
    description: 'Flip 10 matching coin sides in a row',
    icon: '🪙🔥',
    category: 'easter',
    tier: 'legendary',
    isSecret: true,
    secretTitle: 'Probability Defier',
    secretHint: 'Defy one-in-a-thousand odds with ten identical coin flips in a row...',
  },
  {
    id: 'speedrunner',
    title: 'Speedrunner',
    description: 'Solve Target 24 in under 10 seconds',
    icon: '⏱️⚡',
    category: 'easter',
    tier: 'gold',
    isSecret: true,
    secretTitle: 'Lightning Arithmetic',
    secretHint: 'Reach 24 before ten seconds tick away on the chronometer...',
  },
  {
    id: 'flawless-sprint',
    title: 'Flawless Sprint',
    description: 'Finish a Mental Math Sprint round with no misses',
    icon: '🎯🌟',
    category: 'easter',
    tier: 'gold',
    isSecret: true,
    secretTitle: 'Pristine Velocity',
    secretHint: 'Race through Mental Math Sprint without committing a single misstep...',
  },
  {
    id: 'unit-nomad',
    title: 'Unit Nomad',
    description: 'Convert 10 different unit types',
    icon: '🧭',
    category: 'easter',
    tier: 'silver',
    isSecret: true,
    secretTitle: 'Dimension Traveler',
    secretHint: 'Convert quantities across many diverse realms of physical measurement...',
  },

  // Meta progress
  {
    id: 'collector-25',
    title: 'Collector 25',
    description: 'Unlock 25 percent of all badges',
    icon: '🥉',
    category: 'easter',
    tier: 'bronze',
    isSecret: true,
    secretTitle: 'Apprentice Archivist',
    secretHint: 'Unseal one-quarter of the grand hall of milestones...',
  },
  {
    id: 'collector-50',
    title: 'Collector 50',
    description: 'Unlock 50 percent of all badges',
    icon: '🥈',
    category: 'easter',
    tier: 'silver',
    isSecret: true,
    secretTitle: 'Equator of Glory',
    secretHint: 'Cross the halfway mark on the path to total milestone enlightenment...',
  },
  {
    id: 'collector-75',
    title: 'Collector 75',
    description: 'Unlock 75 percent of all badges',
    icon: '🥇',
    category: 'easter',
    tier: 'gold',
    isSecret: true,
    secretTitle: 'Master Curator',
    secretHint: 'Three-quarters of all milestones unlocked—only the rarest enigmas remain...',
  },
  {
    id: 'set-wonders',
    title: 'Wonder Complete',
    description: 'Unlock every Wonders badge',
    icon: '✨👑',
    category: 'easter',
    tier: 'gold',
    isSecret: true,
    secretTitle: 'Cosmic Synthesis',
    secretHint: 'Illuminate every celestial wonder in the mathematical firmament...',
  },
  {
    id: 'set-modes',
    title: 'Mode Complete',
    description: 'Unlock every Modes badge',
    icon: '🌐',
    category: 'easter',
    tier: 'gold',
    isSecret: true,
    secretTitle: 'Omnipresent Mind',
    secretHint: 'Attain absolute mastery across every single calculator mode...',
  },
  {
    id: 'set-games',
    title: 'Game Complete',
    description: 'Unlock every Games badge',
    icon: '🕹️🏆',
    category: 'easter',
    tier: 'gold',
    isSecret: true,
    secretTitle: 'Arcade Monarch',
    secretHint: 'Conquer every trial of the dice, coin, Target 24, and Sprint arena...',
  },
  {
    id: 'full-spectrum',
    title: 'Full Spectrum',
    description: 'Own at least one badge from each tier',
    icon: '🌈',
    category: 'easter',
    tier: 'silver',
    isSecret: true,
    secretTitle: 'Prismatic Medallion',
    secretHint: 'Possess at least one badge from Bronze, Silver, Gold, and Legendary tiers...',
  },
  {
    id: 'secret-finder',
    title: 'Secret Finder',
    description: 'Unlock 5 hidden badges',
    icon: '🗝️',
    category: 'easter',
    tier: 'gold',
    isSecret: true,
    secretTitle: 'Whisper Seeker',
    secretHint: 'Unearth five enigmatic secrets concealed in the shadows of the code...',
  },
  {
    id: 'all-milestones-epic',
    title: 'Infinity Sovereign: Grand Master of All Milestones',
    description: 'You have ascended beyond mathematics into pure legend—conquering every standard calculation, cosmic wonder, and gadget across the Dockcalc multiverse! (Secret milestones excluded)',
    icon: '🌌👑',
    category: 'easter',
    tier: 'epic',
  },
];

// Helper to evaluate and trigger all calculation volume milestone achievements
export function checkCalculationMilestones(count: number, unlock: (id: string) => void) {
  if (count >= 1) unlock('first-step');
  if (count >= 10) unlock('decade-club');
  if (count >= 25) unlock('quarter-century');
  if (count >= 50) unlock('half-century');
  if (count >= 100) unlock('centurion');
  if (count >= 250) unlock('calculation-maestro');
  if (count >= 500) unlock('math-legend');
  if (count >= 1000) unlock('grandmaster-1k');
  if (count >= 2000) unlock('calc-2k');
  if (count >= 5000) unlock('calc-5k');
  if (count >= 10000) unlock('calc-10k');
  if (count >= 15000) unlock('calc-15k');
  if (count >= 20000) unlock('calc-20k');
  if (count >= 25000) unlock('calc-25k');
  if (count >= 30000) unlock('calc-30k');
  if (count >= 40000) unlock('calc-40k');
  if (count >= 50000) unlock('calc-50k');
  if (count >= 60000) unlock('calc-60k');
  if (count >= 70000) unlock('calc-70k');
  if (count >= 80000) unlock('calc-80k');
  if (count >= 90000) unlock('calc-90k');
  if (count >= 100000) unlock('calc-100k');

  // Sequential Calculation Milestones (12, 123, 1234, 12345)
  if (count >= 12) unlock('seq-calc-12');
  if (count >= 123) unlock('seq-calc-123');
  if (count >= 1234) unlock('seq-calc-1234');
  if (count >= 12345) unlock('seq-calc-12345');
}

// Helper to evaluate and trigger custom programmable key usage milestones
export function checkCustomKeyMilestones(uses: number, unlock: (id: string) => void) {
  if (uses >= 1) unlock('custom-key-1');
  if (uses >= 100) unlock('custom-key-100');
  if (uses >= 1000) unlock('custom-key-1k');
  if (uses >= 2500) unlock('custom-key-2500');
  if (uses >= 5000) unlock('custom-key-5k');
  if (uses >= 10000) unlock('custom-key-10k');
}

// Helper to evaluate and trigger the ultimate EPIC completionist milestone (strictly excluding secret milestones)
export function checkEpicCompletionistMilestone(unlockedList: string[], unlock: (id: string) => void) {
  const nonEpicNonSecretIds = ACHIEVEMENTS_LIST.filter((a) => a.id !== 'all-milestones-epic' && !a.isSecret).map((a) => a.id);
  const allUnlocked = nonEpicNonSecretIds.every((id) => unlockedList.includes(id));
  if (allUnlocked && !unlockedList.includes('all-milestones-epic')) {
    unlock('all-milestones-epic');
  }
}

function isPrime(n: number): boolean {
  if (n <= 1 || !Number.isInteger(n)) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

function isPerfectSquare(n: number): boolean {
  if (n < 0 || !Number.isInteger(n)) return false;
  const s = Math.round(Math.sqrt(n));
  return s * s === n;
}

function isExactCube(n: number): boolean {
  if (!Number.isInteger(n)) return false;
  const c = Math.round(Math.cbrt(n));
  return c * c * c === n;
}

function isFibonacci(n: number): boolean {
  if (n <= 0 || !Number.isInteger(n)) return false;
  return isPerfectSquare(5 * n * n + 4) || isPerfectSquare(5 * n * n - 4);
}

function isPowerOfTwo(n: number): boolean {
  if (n < 1 || !Number.isInteger(n)) return false;
  return (n & (n - 1)) === 0;
}

// Evaluate wonder, numeric magic, and mode milestones
export function checkWonderAndModeMilestones(
  resultStr: string,
  mode: string,
  rpnMode: boolean,
  usedModes: string[],
  unlock: (id: string) => void
) {
  const numVal = Number(resultStr);

  // 1. Secret / Specific Number Milestones
  if (resultStr === '42' || Math.abs(numVal - 42) < 1e-9) {
    unlock('the-answer');
  }
  if (resultStr === '777' || resultStr.endsWith('777') || Math.abs(numVal - 777) < 1e-9) {
    unlock('lucky-seven');
  }
  if (resultStr === '925' || Math.abs(numVal - 925) < 1e-9) {
    unlock('dollys-favorite');
  }
  if (resultStr === '1776' || Math.abs(numVal - 1776) < 1e-9) {
    unlock('revolutionary');
  }
  if (resultStr === '0' || Math.abs(numVal) < 1e-12) {
    unlock('absolute-zero');
  }
  if (!isNaN(numVal) && numVal < 0) {
    unlock('subzero-voyager');
  }

  // 2. Mathematical wonders
  if (!isNaN(numVal) && Number.isInteger(numVal) && numVal > 0) {
    if (isPrime(numVal)) {
      unlock('prime-hunter');
      if (numVal > 100) unlock('prime-scholar');
    }
    if (isFibonacci(numVal)) {
      unlock('fibonacci-master');
      if (numVal > 144) unlock('fibonacci-sage');
    }
    if (numVal > 1 && isPerfectSquare(numVal)) {
      unlock('perfect-square');
    }
    if (Math.abs(numVal) >= 8 && isExactCube(numVal)) {
      unlock('cube-artisan');
    }
    if (numVal >= 64 && isPowerOfTwo(numVal)) {
      unlock('binary-power');
    }
  }

  // Transcendental Constants & Magnitudes
  if (resultStr.includes('3.14159') || (!isNaN(numVal) && Math.abs(numVal - Math.PI) < 0.0001)) {
    unlock('piday');
  }
  if (resultStr.includes('2.71828') || (!isNaN(numVal) && Math.abs(numVal - Math.E) < 0.0001)) {
    unlock('euler-constant');
  }
  if (resultStr.includes('1.61803') || (!isNaN(numVal) && Math.abs(numVal - 1.6180339887) < 0.0001)) {
    unlock('golden-ratio');
  }
  if (resultStr.includes('6.28318') || (!isNaN(numVal) && Math.abs(numVal - Math.PI * 2) < 0.0001)) {
    unlock('tau-master');
  }

  if (!isNaN(numVal)) {
    if (numVal >= 1000000) unlock('millionaire');
    if (numVal >= 1000000000) unlock('billionaire');
    if (numVal >= 1000000000000) unlock('trillionaire');
  }

  if (resultStr.includes('.') && resultStr.split('.')[1]?.length >= 6) {
    unlock('micro-precision');
  }

  // 3. Calculator Mode Milestones
  if (mode === 'standard') unlock('standard-solver');
  if (mode === 'scientific') unlock('scientific-scholar');
  if (mode === 'programmer') unlock('bitwise-wizard');
  if (mode === 'finance') unlock('financial-planner');
  if (mode === 'convert') unlock('global-trader');
  if (rpnMode) unlock('rpn-prodigy');

  if (usedModes.length >= 3) unlock('polymath');
  if (['standard', 'scientific', 'programmer', 'finance', 'convert', 'matrix'].every(m => usedModes.includes(m))) {
    unlock('all-rounder');
  }

  // 4. Secret Number Lore & Behavior Quirks
  if (resultStr === '1729' || Math.abs(numVal - 1729) < 1e-9) unlock('taxi-1729');
  if (resultStr === '1337' || Math.abs(numVal - 1337) < 1e-9) unlock('leet-1337');
  if (resultStr === '404' || Math.abs(numVal - 404) < 1e-9) unlock('not-found-404');
  if (resultStr === '7734' || resultStr === '07734' || resultStr === '5318008' || Math.abs(numVal - 7734) < 1e-9 || Math.abs(numVal - 5318008) < 1e-9) {
    unlock('calculator-words');
  }
  if ([6, 28, 496, 8128].includes(numVal)) {
    unlock('perfect-number');
  }
  if (resultStr === '6174' || Math.abs(numVal - 6174) < 1e-9) unlock('kaprekar-6174');
  if (numVal >= 1e100 || (resultStr.includes('e+') && Number(resultStr.split('e+')[1]) >= 100)) {
    unlock('googol');
  }
  if (resultStr === 'Infinity' || numVal === Infinity || !isFinite(numVal)) {
    unlock('infinity-beyond');
  }

  // Palindrome (integer with 5+ digits, forward === reversed)
  const cleanDigits = resultStr.replace(/[^0-9]/g, '');
  if (Number.isInteger(numVal) && cleanDigits.length >= 5 && cleanDigits === cleanDigits.split('').reverse().join('')) {
    unlock('palindrome');
  }

  // Repdigit (integer with 5+ identical digits)
  if (Number.isInteger(numVal) && cleanDigits.length >= 5 && cleanDigits.split('').every((d) => d === cleanDigits[0])) {
    unlock('repdigit');
  }

  // Time & Habit checks (evaluated during calculation)
  const now = new Date();
  const currentHour = now.getHours();
  if (currentHour === 2 || currentHour === 3) unlock('night-owl');
  if (currentHour === 5 || currentHour === 6) unlock('early-bird');
  if (now.getMonth() === 2 && now.getDate() === 14) unlock('pi-day');
  if (now.getMonth() === 1 && now.getDate() === 29) unlock('leap-day');
  if (now.getMonth() === 11 && now.getDate() === 31 && currentHour === 23 && now.getMinutes() === 59) {
    unlock('midnight-countdown');
  }
}

export interface MilestoneProgressInfo {
  current: number;
  target: number;
  percentage: number;
  label: string;
}

/**
 * Returns numerical progress details for measurable locked milestone badges.
 */
export function getMilestoneProgress(achId: string, stats: any): MilestoneProgressInfo | null {
  if (!stats) return null;

  // Calculation Volume Targets
  const calcTargets: Record<string, number> = {
    'first-step': 1,
    'decade-club': 10,
    'quarter-century': 25,
    'half-century': 50,
    'centurion': 100,
    'calculation-maestro': 250,
    'math-legend': 500,
    'grandmaster-1k': 1000,
    'calc-2k': 2000,
    'calc-5k': 5000,
    'calc-10k': 10000,
    'calc-15k': 15000,
    'calc-20k': 20000,
    'calc-25k': 25000,
    'calc-30k': 30000,
    'calc-40k': 40000,
    'calc-50k': 50000,
    'calc-60k': 60000,
    'calc-70k': 70000,
    'calc-80k': 80000,
    'calc-90k': 90000,
    'calc-100k': 100000,
  };

  if (calcTargets[achId] !== undefined) {
    const target = calcTargets[achId];
    const current = Math.max(0, stats.totalCalculations || 0);
    const percentage = Math.min(100, (current / target) * 100);
    return {
      current,
      target,
      percentage,
      label: 'Calculations',
    };
  }

  // Custom Programmable Keys Targets
  const customKeyTargets: Record<string, number> = {
    'custom-key-starter': 5,
    'custom-key-10': 10,
    'custom-key-25': 25,
    'custom-key-50': 50,
    'custom-key-100': 100,
    'custom-key-250': 250,
    'custom-key-500': 500,
    'custom-key-1k': 1000,
    'custom-key-2k': 2000,
    'custom-key-5k': 5000,
    'custom-key-10k': 10000,
  };

  if (customKeyTargets[achId] !== undefined) {
    const target = customKeyTargets[achId];
    const current = Math.max(0, stats.customKeyUses || 0);
    const percentage = Math.min(100, (current / target) * 100);
    return {
      current,
      target,
      percentage,
      label: 'Key Uses',
    };
  }

  // Gadgets & Mini-Game Targets
  if (achId === 'coin-master') {
    const target = 5;
    const current = Math.max(0, stats.gadgetsStats?.coinFlips || 0);
    return { current, target, percentage: Math.min(100, (current / target) * 100), label: 'Coin Flips' };
  }
  if (achId === 'dice-roller') {
    const target = 10;
    const current = Math.max(0, stats.gadgetsStats?.diceRolls || 0);
    return { current, target, percentage: Math.min(100, (current / target) * 100), label: 'Dice Rolls' };
  }
  if (achId === 'target24-solver') {
    const target = 1;
    const current = Math.max(0, stats.gadgetsStats?.target24Solved || 0);
    return { current, target, percentage: Math.min(100, (current / target) * 100), label: 'Target 24 Solved' };
  }
  if (achId === 'target24-grandmaster') {
    const target = 10;
    const current = Math.max(0, stats.gadgetsStats?.target24Solved || 0);
    return { current, target, percentage: Math.min(100, (current / target) * 100), label: 'Target 24 Solved' };
  }
  if (achId === 'sprint-starter') {
    const target = 1;
    const current = Math.max(0, stats.sprintStats?.totalSolved || 0);
    return { current, target, percentage: Math.min(100, (current / target) * 100), label: 'Sprint Solved' };
  }
  if (achId === 'sprint-speed-demon') {
    const target = 12;
    const current = Math.max(0, stats.sprintStats?.totalSolved || 0);
    return { current, target, percentage: Math.min(100, (current / target) * 100), label: 'Sprint Solved' };
  }
  if (achId === 'sprint-streak-5') {
    const target = 5;
    const current = Math.max(0, stats.sprintStats?.bestStreak || 0);
    return { current, target, percentage: Math.min(100, (current / target) * 100), label: 'Sprint Streak' };
  }
  if (achId === 'sprint-centurion') {
    const target = 3500;
    const current = Math.max(0, stats.sprintStats?.highScore || 0);
    return { current, target, percentage: Math.min(100, (current / target) * 100), label: 'Sprint High Score' };
  }

  // Behavior & Quirks Targets
  if (achId === 'clean-slate') {
    const target = 100;
    const current = Math.max(0, stats.totalClearPressed || 0);
    return { current, target, percentage: Math.min(100, (current / target) * 100), label: 'Clear Presses' };
  }
  if (achId === 'unit-nomad') {
    const target = 10;
    const current = Math.max(0, stats.totalConversions || 0);
    return { current, target, percentage: Math.min(100, (current / target) * 100), label: 'Conversions' };
  }

  return null;
}


