import type { ContentItem } from './types';

export const newsArticles: ContentItem[] = [
  {
    id: 'ai-startup',
    title: 'AI Startup Raises $2B in Record Funding Round',
    compressions: {
      normal: {
        '-1': '',

        '0': `AI Startup Raises $2B in Record Funding Round

SynthMind, a San Francisco-based AI company founded 18 months ago, closed a $2 billion Series B led by Sequoia Capital and Andreessen Horowitz. The company's valuation soared to $14 billion, up from $800 million at its Series A nine months ago.

SynthMind builds AI agents that autonomously navigate complex enterprise workflows — processing insurance claims, orchestrating supply chains, handling edge cases that rule-based automation can't. Over 200 Fortune 500 companies use the platform, including three of the top five US banks.

CEO Dr. Amara Chen said the funding will scale computing infrastructure and expand the research team. "We're at an inflection point where AI agents can handle entire workflows that previously required teams of people," she said. Annual recurring revenue reportedly crossed $400M in January 2026, growing 30% month-over-month.

The raise comes amid a broader AI funding frenzy — over $120 billion invested in AI startups in 2025 alone, more than triple 2023's total. Critics warn of bubble dynamics, noting fewer than 15 of the top 50 funded AI startups have disclosed ARR above $100M.`,

        '1': `SynthMind closed a record $2B Series B led by Sequoia and a16z, reaching a $14B valuation — up from $800M nine months ago. The company builds AI agents that automate complex enterprise workflows, serving 200+ Fortune 500 companies including three of the top five US banks.

Annual recurring revenue reportedly crossed $400M in January, growing 30% month-over-month. CEO Dr. Amara Chen plans to scale infrastructure and expand the team. The raise comes amid $120B+ in AI investment in 2025, though critics warn fewer than 15 of the top 50 funded AI startups have disclosed ARR above $100M.`,

        '2': `SynthMind closed a record $2B Series B at a $14B valuation, up from $800M nine months ago. The company builds AI agents for enterprise workflow automation, serving 200+ Fortune 500 companies. Revenue crossed $400M, growing 30% monthly. The raise comes amid $120B+ in AI investment in 2025, though critics warn of bubble dynamics.`,

        '3': `SynthMind raised $2B at $14B valuation for AI enterprise workflow agents. 200+ Fortune 500 clients, $400M ARR growing 30% monthly. Critics warn of AI bubble amid $120B+ invested in 2025.`,
      },
      eli5: {},
      noJargon: {},
      bullets: {},
    },
  },
  {
    id: 'apple-ar',
    title: 'Apple Unveils Lightweight AR Glasses at WWDC',
    compressions: {
      normal: {
        '-1': '',

        '0': `Apple Unveils Lightweight AR Glasses at WWDC

Apple announced Apple Glass today at WWDC 2026, a pair of augmented reality glasses that weigh just 48 grams — roughly the same as a pair of Ray-Ban Wayfarers. The device represents a dramatic departure from the bulky Vision Pro headset and signals Apple's bet that AR will succeed as everyday eyewear, not a headset you strap on at home.

Apple Glass runs a new spatial operating system called glassOS, a stripped-down fork of visionOS optimized for heads-up information rather than immersive experiences. The display projects UI elements into a narrow 30-degree field of view using microLED waveguides. Think notifications, navigation arrows, real-time translation overlays, and contextual information — not virtual desktops or 3D movies.

Battery life is rated at 6 hours with a companion puck battery that clips to a pocket or bag. The glasses connect to iPhone for processing, keeping the on-device chip small enough to fit in the temple arm. Pricing starts at $799 for the base model, with prescription lens options through a LensCrafters partnership.

Analysts see the product as Apple's clearest move toward ambient computing. "This is the device that replaces pulling out your phone 200 times a day," said Kuo Ming-Chi of TF International Securities. Pre-orders open July 15 with shipping in September.`,

        '1': `Apple announced Apple Glass at WWDC 2026 — AR glasses weighing just 48 grams that run a new heads-up OS called glassOS. The display projects notifications, navigation, translation overlays, and contextual info into a 30-degree field of view using microLED waveguides.

The glasses connect to iPhone for processing, with 6 hours of battery life via a companion puck. Pricing starts at $799 with prescription lens options. Analysts call it Apple's clearest move toward ambient computing — replacing the 200 daily phone checks. Pre-orders July 15, shipping September.`,

        '2': `Apple unveiled Apple Glass at WWDC — 48-gram AR glasses with a heads-up glassOS, microLED waveguide display, and 6-hour battery life. Projects notifications, navigation, and translation overlays in a 30° field of view. Requires iPhone, starts at $799. Ships September.`,

        '3': `Apple announced 48-gram AR glasses at WWDC. Heads-up display for notifications and navigation, 6-hour battery, requires iPhone. $799, ships September.`,
      },
      eli5: {},
      noJargon: {},
      bullets: {},
    },
  },
  {
    id: 'open-source-llm',
    title: 'Open-Source Model Surpasses GPT-5 on Major Benchmarks',
    compressions: {
      normal: {
        '-1': '',

        '0': `Open-Source Model Surpasses GPT-5 on Major Benchmarks

A consortium of researchers from LAION, EleutherAI, and the Technical University of Munich released Olympus-70B today, an open-source large language model that outperforms OpenAI's GPT-5 on six of eight major benchmarks including MMLU, HumanEval, and GSM8K. The model is fully open-weight and licensed under Apache 2.0.

Olympus was trained on 15 trillion tokens using a novel "curriculum distillation" approach that the team says reduces compute requirements by roughly 60% compared to conventional training. The entire training run cost an estimated $8.5 million — a fraction of the hundreds of millions reportedly spent on GPT-5. The team used donated compute from a coalition of European research institutions and cloud providers.

The release intensifies pressure on commercial AI labs. OpenAI's stock dipped 4% in after-hours trading. "The moat is thinner than anyone wants to admit," said Dr. Jonas Müller, the project's lead researcher. "When an $8.5 million model matches a $500 million one, the economics of closed-source AI become very hard to justify."

Meta's chief AI scientist Yann LeCun called the release "a watershed moment for open science." Google DeepMind declined to comment. The model weights and training code are available on Hugging Face, where they were downloaded 400,000 times in the first 12 hours.`,

        '1': `A consortium from LAION, EleutherAI, and TU Munich released Olympus-70B, an open-source LLM that outperforms GPT-5 on six of eight major benchmarks including MMLU and HumanEval. The model is Apache 2.0 licensed with full open weights.

Olympus was trained on 15 trillion tokens using "curriculum distillation," reducing compute costs to an estimated $8.5M — versus the hundreds of millions spent on GPT-5. OpenAI's stock dipped 4%. Lead researcher Dr. Jonas Müller: "When an $8.5M model matches a $500M one, the economics of closed-source AI become very hard to justify." Downloaded 400K times in the first 12 hours on Hugging Face.`,

        '2': `Olympus-70B, an open-source LLM from LAION/EleutherAI/TU Munich, outperforms GPT-5 on six of eight major benchmarks. Trained for $8.5M using a novel curriculum distillation method — a fraction of GPT-5's cost. Apache 2.0 licensed, 400K downloads in 12 hours. OpenAI stock dipped 4%.`,

        '3': `Open-source Olympus-70B beats GPT-5 on 6/8 benchmarks, trained for $8.5M vs hundreds of millions. Apache 2.0 licensed, 400K downloads in 12 hours. OpenAI stock fell 4%.`,
      },
      eli5: {},
      noJargon: {},
      bullets: {},
    },
  },
];
