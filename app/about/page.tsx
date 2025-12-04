import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/Card';
import { Disclaimer } from '@/app/components/Disclaimer';
import {
  AlertTriangle,
  Calculator,
  TrendingDown,
  Brain,
  HelpCircle,
  Shield,
  ExternalLink,
} from 'lucide-react';

export const metadata = {
  title: 'About',
  description: 'Learn about roulette betting systems, probability, and responsible gambling.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          About Roulette Step Simulator
        </h1>
        <p className="text-casino-muted">
          Understanding probability, betting systems, and responsible gambling
        </p>
      </div>

      <div className="space-y-8">
        {/* Educational Purpose */}
        <Disclaimer variant="banner" />

        {/* The House Edge */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-400" />
              Understanding the House Edge
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <p className="text-casino-text">
              American roulette features 38 numbers (0, 00, and 1-36). This creates
              a mathematical advantage for the casino on every bet:
            </p>
            <ul className="text-casino-text list-disc list-inside space-y-2 mt-4">
              <li>
                <strong>Even money bets</strong> (red/black, odd/even): Pay 1:1 but
                cover only 18 of 38 numbers (47.37% probability)
              </li>
              <li>
                <strong>Straight bet</strong> (single number): Pays 35:1 but has
                only 1/38 (2.63%) chance of winning
              </li>
              <li>
                <strong>House edge</strong>: 5.26% on all bets (except the
                five-number bet at 7.89%)
              </li>
            </ul>
            <div className="mt-4 p-4 bg-casino-dark rounded-lg">
              <p className="text-sm text-casino-muted">
                <strong className="text-white">Expected Value Formula:</strong>
                <br />
                EV = (Probability of Win × Payout) - (Probability of Loss × Bet Amount)
                <br />
                <br />
                For a $10 red bet:
                <br />
                EV = (18/38 × $10) - (20/38 × $10) = -$0.526
                <br />
                <br />
                This means you lose an average of $0.53 per $10 bet over time.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Why Systems Fail */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-400" />
              Why Betting Systems Don&apos;t Work Long-Term
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <p className="text-casino-text">
              No betting system can overcome the house edge. Here&apos;s why popular
              systems eventually fail:
            </p>

            <div className="space-y-4 mt-4">
              <div className="p-4 bg-casino-dark rounded-lg">
                <h4 className="font-semibold text-white mb-2">Martingale System</h4>
                <p className="text-sm text-casino-muted">
                  Double your bet after each loss. Problems: Table limits prevent
                  infinite doubling, and a long losing streak can bankrupt you before
                  you recover. The eventual win only recovers your original bet amount.
                </p>
              </div>

              <div className="p-4 bg-casino-dark rounded-lg">
                <h4 className="font-semibold text-white mb-2">D&apos;Alembert System</h4>
                <p className="text-sm text-casino-muted">
                  Increase bet by 1 unit after loss, decrease by 1 after win.
                  Safer progression, but still subject to the same house edge on
                  every spin.
                </p>
              </div>

              <div className="p-4 bg-casino-dark rounded-lg">
                <h4 className="font-semibold text-white mb-2">Fibonacci System</h4>
                <p className="text-sm text-casino-muted">
                  Follow the Fibonacci sequence for bet progression. Like Martingale,
                  it can lead to large bets during losing streaks.
                </p>
              </div>
            </div>

            <p className="text-casino-text mt-4">
              <strong>Key insight:</strong> Each spin is independent. Past results
              do not influence future outcomes. The house edge applies equally to
              every single bet, regardless of your betting pattern.
            </p>
          </CardContent>
        </Card>

        {/* Common Fallacies */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Common Gambling Fallacies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-casino-dark rounded-lg">
                <h4 className="font-semibold text-white mb-2">
                  Gambler&apos;s Fallacy
                </h4>
                <p className="text-sm text-casino-muted">
                  The belief that past outcomes affect future results. &quot;Red has
                  hit 5 times in a row, so black is due!&quot; In reality, each spin
                  has the same probabilities regardless of history.
                </p>
              </div>

              <div className="p-4 bg-casino-dark rounded-lg">
                <h4 className="font-semibold text-white mb-2">Hot Hand Fallacy</h4>
                <p className="text-sm text-casino-muted">
                  The belief that winning streaks will continue. &quot;I&apos;m on a
                  hot streak, I should bet more!&quot; Streaks are a natural part of
                  random events and don&apos;t indicate future outcomes.
                </p>
              </div>

              <div className="p-4 bg-casino-dark rounded-lg">
                <h4 className="font-semibold text-white mb-2">Sunk Cost Fallacy</h4>
                <p className="text-sm text-casino-muted">
                  The urge to continue gambling to recover losses. &quot;I&apos;ve
                  already lost $500, I need to win it back!&quot; Previous losses are
                  gone and shouldn&apos;t influence future decisions.
                </p>
              </div>

              <div className="p-4 bg-casino-dark rounded-lg">
                <h4 className="font-semibold text-white mb-2">
                  Illusion of Control
                </h4>
                <p className="text-sm text-casino-muted">
                  Believing that skill or strategy can influence random outcomes.
                  Roulette is pure chance - no skill can change the probabilities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Use This Tool */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-green-400" />
              How to Use This Simulator
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <ol className="text-casino-text list-decimal list-inside space-y-3">
              <li>
                <strong>Build a Strategy:</strong> Use the strategy builder to
                create multi-step betting progressions. Configure bet types,
                amounts, and progression rules.
              </li>
              <li>
                <strong>Set Parameters:</strong> Define your starting bankroll,
                target goal, maximum spins, and stop-loss limits.
              </li>
              <li>
                <strong>Run Simulations:</strong> Execute thousands of simulations
                to see how your strategy performs statistically.
              </li>
              <li>
                <strong>Analyze Results:</strong> Review success rates, bankroll
                distributions, and risk metrics in the analytics dashboard.
              </li>
              <li>
                <strong>Compare Strategies:</strong> Test different approaches
                side-by-side to understand their relative performance.
              </li>
            </ol>

            <p className="text-casino-text mt-4">
              <strong>Remember:</strong> This tool demonstrates mathematical
              principles. All strategies will show negative expected value over
              the long term due to the house edge.
            </p>
          </CardContent>
        </Card>

        {/* Responsible Gambling */}
        <Card variant="bordered" className="border-yellow-700/50 bg-yellow-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <Shield className="w-5 h-5" />
              Responsible Gambling Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-200/80 mb-4">
              If you or someone you know has a gambling problem, help is available:
            </p>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://www.ncpgambling.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  National Council on Problem Gambling
                </a>
              </li>
              <li>
                <a
                  href="https://www.gamblingtherapy.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Gambling Therapy
                </a>
              </li>
              <li>
                <a
                  href="https://www.gamblersanonymous.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Gamblers Anonymous
                </a>
              </li>
              <li>
                <span className="text-yellow-200/80">
                  National Problem Gambling Helpline:{' '}
                  <strong className="text-yellow-400">1-800-522-4700</strong>
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Technical Info */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Technical Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-white mb-2">Built With</h4>
                <ul className="text-casino-muted space-y-1">
                  <li>Next.js 14 (App Router)</li>
                  <li>TypeScript</li>
                  <li>Tailwind CSS</li>
                  <li>Recharts</li>
                  <li>Lucide Icons</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Features</h4>
                <ul className="text-casino-muted space-y-1">
                  <li>Monte Carlo Simulation</li>
                  <li>Visual Strategy Builder</li>
                  <li>Statistical Analysis</li>
                  <li>LocalStorage Persistence</li>
                  <li>Responsive Design</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
