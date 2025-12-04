# Roulette Step Simulator

A sophisticated roulette betting strategy simulator built with Next.js 14, featuring Monte Carlo analysis, visual strategy building, and comprehensive statistical analytics.

## Features

### Strategy Builder
- Visual step sequence designer for custom betting progressions
- Support for all standard roulette bet types:
  - Straight bets (single number, 35:1)
  - Split bets (two numbers, 17:1)
  - Street bets (three numbers, 11:1)
  - Corner bets (four numbers, 8:1)
  - Double street bets (six numbers, 5:1)
  - Dozen bets (12 numbers, 2:1)
  - Column bets (12 numbers, 2:1)
  - Even money bets (red/black, odd/even, 1-18/19-36, 1:1)
- Configurable bet sizing (fixed amount, all-in, half-bankroll, let-it-ride)
- Win/loss progression rules
- Save and load custom strategies

### Simulation Engine
- Monte Carlo simulations (100 to 100,000+ iterations)
- Configurable initial bankroll, target bankroll, and max iterations
- Max drawdown limits for risk management
- Real-time simulation progress tracking

### Analytics Dashboard
- Success rate and failure analysis
- Average final bankroll calculations
- Bankroll distribution histograms
- Expected value (EV) calculations
- Risk metrics (variance, standard deviation, risk of ruin)
- Strategy comparison tools

### Pre-loaded Strategies
- MOD Tie Fighter
- Double Street Straight
- Double Street Mod
- Double Street 125
- Random Number Dozens
- Progressive Let-It-Ride
- Classic Martingale
- D'Alembert System

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Storage**: localStorage

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/roulette-step-simulator.git
cd roulette-step-simulator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
├── app/
│   ├── components/       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── StrategyBuilder.tsx
│   │   ├── SimulationRunner.tsx
│   │   ├── ResultsSummary.tsx
│   │   ├── BankrollChart.tsx
│   │   ├── DistributionChart.tsx
│   │   └── ...
│   ├── lib/              # Utility functions and business logic
│   │   ├── types.ts      # TypeScript type definitions
│   │   ├── roulette.ts   # Roulette game logic
│   │   ├── simulation.ts # Monte Carlo simulation engine
│   │   ├── storage.ts    # localStorage utilities
│   │   ├── preloadedStrategies.ts
│   │   └── utils.ts      # General utilities
│   ├── simulator/        # Simulation page
│   ├── analytics/        # Analytics dashboard
│   ├── strategies/       # Strategy library
│   ├── about/           # About page
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── public/              # Static assets
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## Usage Guide

### Creating a Strategy

1. Navigate to the home page or Strategies page
2. Click "Build Strategy" or "New Strategy"
3. Configure strategy parameters:
   - Name and description
   - Initial bankroll
   - Target bankroll
   - Maximum iterations
   - Optional max drawdown limit
4. Add betting steps:
   - Select bet type
   - Set bet amount
   - Configure specific bet details
   - Set win/loss progression rules
5. Save your strategy

### Running Simulations

1. Select a strategy from the library
2. Choose the number of simulations (100-100,000)
3. Click "Run Simulation"
4. View results including:
   - Success rate
   - Bankroll distribution
   - Individual simulation details

### Analyzing Results

1. Visit the Analytics dashboard
2. View historical simulation results
3. Compare different strategies
4. Export results as JSON

## Educational Purpose

This simulator is designed for **educational purposes only**. It demonstrates:

- Probability and statistics in gambling
- Why betting systems cannot overcome the house edge
- The mathematics behind roulette
- Common gambling fallacies

**Important**: No betting system can overcome the house edge in the long run. American roulette has a 5.26% house edge on all standard bets.

## Responsible Gambling

If you or someone you know has a gambling problem, please seek help:

- [National Council on Problem Gambling](https://www.ncpgambling.org)
- [Gambling Therapy](https://www.gamblingtherapy.org)
- [Gamblers Anonymous](https://www.gamblersanonymous.org)
- National Problem Gambling Helpline: **1-800-522-4700**

## Deployment

This project is configured for easy deployment to Vercel:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Deploy with default settings

Or deploy manually:

```bash
npm run build
npm run start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Charts powered by [Recharts](https://recharts.org/)
- Icons from [Lucide](https://lucide.dev/)
