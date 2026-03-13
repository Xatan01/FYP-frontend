const ROUTE_KNOWLEDGE = {
  Learn: {
    label: "Learn",
    keywords: ["learn", "lesson", "course", "education", "beginner", "basics"],
  },
  VirtualMarket: {
    label: "Virtual Market",
    keywords: ["virtual market", "practice", "paper trade", "simulation", "buy", "sell"],
  },
  Watchlist: {
    label: "Watchlist",
    keywords: ["watchlist", "track", "monitor", "symbols"],
  },
  MarketTrends: {
    label: "Market Trends",
    keywords: ["trend", "market trend", "sector", "momentum"],
  },
  News: {
    label: "News",
    keywords: ["news", "headline", "events", "macro", "earnings"],
  },
  TradingJournal: {
    label: "Trading Journal",
    keywords: ["journal", "mistakes", "review", "reflect"],
  },
  Consult: {
    label: "Consult",
    keywords: ["advisor", "expert", "mentor", "coach", "consult"],
  },
};

export const BOT_ROUTE_LABELS = Object.fromEntries(
  Object.entries(ROUTE_KNOWLEDGE).map(([route, config]) => [route, config.label])
);

export const BOT_PROMPTS = [
  "How should a beginner start learning trading?",
  "What is the difference between investing and trading?",
  "How can I practice without risking real money?",
  "What should I put in a trading journal?",
  "When should I use market news versus charts?",
];

function buildMessage(text, action = null) {
  return {
    id: `bot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role: "assistant",
    text,
    action,
  };
}

function educationalDisclaimer() {
  return "This is educational guidance, not personalized financial advice.";
}

function findRouteFromText(input) {
  const text = String(input || "").toLowerCase();
  return Object.entries(ROUTE_KNOWLEDGE).find(([, config]) =>
    config.keywords.some((keyword) => text.includes(keyword))
  )?.[0];
}

function containsAny(text, keywords) {
  const normalized = String(text || "").toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
}

export function createWelcomeMessage() {
  return buildMessage(
    "I’m FinBot, your in-app trading coach. I can explain concepts, suggest the next feature to use, and help users move from learning to practice. Ask about risk, charts, journaling, market news, or where to start."
  );
}

export function buildFinbotPrompt(userMessage) {
  const cleanQuestion = String(userMessage || "").trim();
  return [
    "You are FinBot, a finance education assistant inside the Finwise mobile app.",
    "Your purpose is to teach beginner users how trading works in a safe, educational way.",
    "Keep answers concise, practical, and easy to understand.",
    "Do not give personalized financial advice or guaranteed-return claims.",
    "When relevant, encourage users to use the app features below:",
    "- Learn: structured beginner lessons",
    "- Virtual Market: paper trading and practice orders",
    "- Watchlist: track symbols",
    "- Market Trends: explore trends and chart context",
    "- News: review headlines and catalysts",
    "- Trading Journal: reflect on setups, risk, and mistakes",
    "- Consult: chat with or book a human advisor",
    "If the question is broad, answer it as education-first guidance.",
    "If the user asks where to start, recommend Learn first and Virtual Market second.",
    `User question: ${cleanQuestion}`,
  ].join("\n");
}

export function createBackendReply(answer, input) {
  const route = findRouteFromText(`${input} ${answer}`) || "Learn";
  return buildMessage(String(answer || "").trim(), {
    route,
    label: BOT_ROUTE_LABELS[route],
  });
}

export function createAssistantReply(input) {
  const text = String(input || "").trim();
  const normalized = text.toLowerCase();

  if (!text) {
    return buildMessage("Ask a finance learning question and I’ll guide you to the right lesson or feature.");
  }

  if (containsAny(normalized, ["start", "beginner", "new to trading", "where do i start"])) {
    return buildMessage(
      `Start in Learn to build vocabulary, market structure, and risk habits first. Then move into Virtual Market to practice entries and exits with no real-money pressure. Finish by writing what you noticed in Trading Journal so the learning loop closes. ${educationalDisclaimer()}`,
      { route: "Learn", label: "Learn" }
    );
  }

  if (containsAny(normalized, ["investing", "trading", "difference"])) {
    return buildMessage(
      "Investing usually focuses on longer time horizons, business quality, and compounding. Trading focuses more on timing, setups, risk controls, and shorter-term price movement. A good beginner path is to learn both, but practice trading rules in simulation before acting on them.",
      { route: "VirtualMarket", label: "Virtual Market" }
    );
  }

  if (containsAny(normalized, ["practice", "paper", "without risking", "fake money", "simulation"])) {
    return buildMessage(
      `Use Virtual Market. It is the safest place in this app to rehearse position sizing, entries, exits, and order discipline before real money is involved. Pair that with Watchlist so you only practice on names you actively track. ${educationalDisclaimer()}`,
      { route: "VirtualMarket", label: "Virtual Market" }
    );
  }

  if (containsAny(normalized, ["risk", "risk management", "stop loss", "losses"])) {
    return buildMessage(
      "For beginners, risk management matters more than finding the perfect stock. Define the maximum loss before entering, keep position size small, and review whether the trade matched your plan. If the app had to teach only one habit first, it would be protecting capital.",
      { route: "TradingJournal", label: "Trading Journal" }
    );
  }

  if (containsAny(normalized, ["journal", "review", "mistake", "improve"])) {
    return buildMessage(
      "A useful trading journal should capture the setup, why you entered, the invalidation point, position size, outcome, and what you would repeat or avoid next time. The point is not just record-keeping, it is building feedback loops.",
      { route: "TradingJournal", label: "Trading Journal" }
    );
  }

  if (containsAny(normalized, ["news", "headline", "macro", "earnings"])) {
    return buildMessage(
      "Use News to understand what may be moving sentiment, sectors, or individual names. Then use charts or watchlists to see whether price action confirms that story. News gives context; price and risk rules decide whether you act.",
      { route: "News", label: "News" }
    );
  }

  if (containsAny(normalized, ["chart", "candlestick", "technical", "trend", "support", "resistance"])) {
    return buildMessage(
      "Charts help you read trend, momentum, and key price zones, but they work best when combined with context and risk controls. For a beginner, focus on trend direction, support and resistance, and whether the setup still makes sense if price moves against you.",
      { route: "MarketTrends", label: "Market Trends" }
    );
  }

  if (containsAny(normalized, ["watchlist", "track stocks", "stocks to watch", "monitor"])) {
    return buildMessage(
      "A watchlist should be small enough to follow properly. Group names by theme, catalyst, or setup so you are not reacting randomly. The goal is to study a manageable set of instruments well instead of scanning everything badly.",
      { route: "Watchlist", label: "Watchlist" }
    );
  }

  if (containsAny(normalized, ["expert", "advisor", "mentor", "human help", "consult"])) {
    return buildMessage(
      "If the question needs human judgment or accountability, use Consult. That flow already supports expert discovery, booking, and chat, so it is the right place to escalate from self-serve education to guided support.",
      { route: "Consult", label: "Consult" }
    );
  }

  const matchedRoute = findRouteFromText(normalized);
  if (matchedRoute) {
    return buildMessage(
      `That topic is already supported in the app. Open ${BOT_ROUTE_LABELS[matchedRoute]} to continue, and if you want I can also explain the concept before you jump in. ${educationalDisclaimer()}`,
      { route: matchedRoute, label: BOT_ROUTE_LABELS[matchedRoute] }
    );
  }

  return buildMessage(
    `Here is the simplest way to think about it: break the question into concept, market context, and execution. Learn the concept in Learn, validate ideas with News or Market Trends, and practice safely in Virtual Market before treating anything as real. ${educationalDisclaimer()}`,
    { route: "Learn", label: "Learn" }
  );
}
