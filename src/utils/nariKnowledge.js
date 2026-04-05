const normalize = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (value) => normalize(value).split(' ').filter(Boolean);

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'can', 'do', 'for', 'from', 'how', 'i', 'if', 'in', 'is', 'it',
  'me', 'more', 'of', 'on', 'or', 'show', 'tell', 'the', 'this', 'to', 'us', 'was', 'what', 'when', 'where', 'which',
  'who', 'why', 'with', 'you', 'your'
]);

const filterTokens = (tokens) => tokens.filter((token) => token && !STOP_WORDS.has(token));

const createEntry = (id, title, section, content, keywords = []) => ({
  id,
  title,
  section,
  content,
  keywords,
  searchText: normalize(`${title} ${section} ${content} ${keywords.join(' ')}`),
});

export const buildNariKnowledgeBase = ({ questions, technologyOptions, basins, recommendation, monitoringAssets }) => {
  const entries = [];

  questions.forEach((question) => {
    entries.push(
      createEntry(
        question.id,
        question.sectionTitle,
        question.tabLabel,
        question.brief,
        [question.shortLabel, question.label, question.tab]
      )
    );
  });

  technologyOptions.forEach((option) => {
    entries.push(
      createEntry(
        option.id,
        option.name,
        'Technology Review',
        `${option.type}. Output ${option.output}. Deployment ${option.deployment}. Maturity ${option.maturity}. Suitability ${option.suitability}/100. Advantages: ${option.advantages}. Limitations: ${option.limitations}. ${option.description}`,
        [option.readiness, option.type, option.output]
      )
    );
  });

  basins.forEach((basin) => {
    entries.push(
      createEntry(
        `${basin.id}-basin`,
        basin.name,
        'Hazard Analysis',
        `${basin.description} Hazard ${basin.hazard}. Tectonic setting ${basin.tectonic}. Recommendation ${basin.recommendation}. Seismic score ${basin.score}/100.`,
        [basin.status, basin.recommendation, basin.tectonic]
      )
    );

    basin.mapOverlay?.terrainFeatures?.forEach((feature) => {
      entries.push(
        createEntry(
          feature.id,
          feature.label,
          `${basin.name} landscape`,
          feature.detail,
          [feature.type, basin.name, 'coastline', 'ocean', 'landscape']
        )
      );
    });

    basin.mapOverlay?.thermoScan?.hotspots?.forEach((hotspot) => {
      entries.push(
        createEntry(
          hotspot.id,
          hotspot.label,
          `${basin.name} thermo-rad scan`,
          `${hotspot.note} Medium ${hotspot.medium}. Radiation ${hotspot.radiation}. Thermal delta ${hotspot.temperature}. Severity ${hotspot.severity}.`,
          ['thermal camera', 'spill', 'radiation', hotspot.medium, hotspot.severity]
        )
      );
    });

    (basin.reactors ?? []).forEach((reactor) => {
      entries.push(
        createEntry(
          reactor.id,
          `${basin.name} ${reactor.name}`,
          'Reactor Performance',
          `${reactor.name} in ${basin.name} runs at ${reactor.efficiency} efficacy with lifespan ${reactor.lifespan}, energy produced ${reactor.energyProduced}, next repair ${reactor.nextRepair}, and nuclear waste created ${reactor.nuclearWaste}.`,
          ['reactor', 'repair', 'waste', 'efficiency', 'energy']
        )
      );
    });
  });

  if (recommendation) {
    entries.push(
      createEntry(
        'final-recommendation',
        recommendation.zone,
        'Recommendation',
        `${recommendation.reason} Distance ${recommendation.distance}. Depth ${recommendation.depth}. Capacity ${recommendation.capacity}. Use cases: ${recommendation.useCases.join(', ')}.`,
        ['recommendation', 'capacity', 'benefits', 'zone']
      )
    );
  }

  monitoringAssets?.reactorSites?.forEach((site) => {
    entries.push(
      createEntry(
        `${site.id}-monitor`,
        site.name,
        'Live Monitoring',
        `${site.role}. Health ${site.healthScore}%. Power ${site.powerMw} MWe. Coolant temperature ${site.coolantTempC} C. Status: ${site.status}.`,
        ['live monitor', 'health', 'power', 'coolant', site.basinName ?? 'monitoring']
      )
    );
  });

  return entries;
};

const scoreEntry = (entry, queryTokens) => {
  const entryTokens = new Set(tokenize(entry.searchText));
  let score = 0;

  queryTokens.forEach((token) => {
    if (entryTokens.has(token)) {
      score += 3;
    }

    if (entry.title.toLowerCase().includes(token)) {
      score += 4;
    }

    if (entry.section.toLowerCase().includes(token)) {
      score += 2;
    }
  });

  return score;
};

const makeSummary = (entries) => entries.map((entry) => `- ${entry.title}: ${entry.content}`).join('\n');

export const getNariReply = ({ question, knowledgeBase }) => {
  const rawTokens = tokenize(question);
  const queryTokens = filterTokens(rawTokens);

  if (!queryTokens.length) {
    return {
      text: 'Ask about reactor performance, hazard analysis, monitoring status, geology, technology choice, or the final recommendation and I will answer from the website data.',
      references: [],
    };
  }

  const scored = knowledgeBase
    .map((entry) => ({ entry, score: scoreEntry(entry, queryTokens) }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 4);

  if (!scored.length) {
    return {
      text: 'I could not match that directly to the website data. Try asking about Namibian basin safety, reactor output, repairs, nuclear waste, coastline conditions, live monitoring, or the recommended deployment zone.',
      references: [],
    };
  }

  const references = scored.map(({ entry }) => `${entry.title} (${entry.section})`);
  const combined = makeSummary(scored.map(({ entry }) => entry));
  const direct = scored[0].entry;
  const asksComparison = queryTokens.some((token) => ['compare', 'difference', 'better', 'best', 'versus', 'vs'].includes(token));
  const asksRecommendation = queryTokens.some((token) => ['recommend', 'optimal', 'best', 'choose'].includes(token));

  if (asksComparison && scored.length > 1) {
    return {
      text: `From the website data, the strongest comparison points are:\n${combined}\n\nBased on those entries, ${direct.title} is the leading match for your question because it has the strongest overlap with the current site evidence.`,
      references,
    };
  }

  if (asksRecommendation) {
    return {
      text: `The website points to ${direct.title} as the best-fit answer here.\n\nSupporting detail:\n${combined}`,
      references,
    };
  }

  return {
    text: `${direct.content}\n\nRelated website context:\n${combined}`,
    references,
  };
};

const GENERAL_PROMPT_PREFIXES = [
  'what is ',
  'who is ',
  'where is ',
  'tell me about ',
  'define ',
  'explain ',
  'what are ',
  'who are ',
];

const buildDateTimeReply = (question) => {
  const normalizedQuestion = normalize(question);
  const now = new Date();

  if (normalizedQuestion.includes('date') && normalizedQuestion.includes('time')) {
    return {
      text: `Today is ${now.toLocaleDateString(undefined, { dateStyle: 'full' })} and the current time is ${now.toLocaleTimeString(undefined, { timeStyle: 'short' })}.`,
      references: ['Local device clock'],
    };
  }

  if (normalizedQuestion.includes('date') || normalizedQuestion.includes('day')) {
    return {
      text: `Today is ${now.toLocaleDateString(undefined, { dateStyle: 'full' })}.`,
      references: ['Local device clock'],
    };
  }

  if (normalizedQuestion.includes('time')) {
    return {
      text: `The current time is ${now.toLocaleTimeString(undefined, { timeStyle: 'short' })}.`,
      references: ['Local device clock'],
    };
  }

  return null;
};

const buildIdentityReply = (question) => {
  const normalizedQuestion = normalize(question);

  if (normalizedQuestion.includes('who are you') || normalizedQuestion.includes('what are you')) {
    return {
      text: 'I am Nari, the website copilot. I answer directly from the project data on this site, and I can also help with some general questions such as date, time, arithmetic, and topic summaries.',
      references: ['Nari assistant configuration'],
    };
  }

  return null;
};

const buildGreetingReply = (question) => {
  const normalizedQuestion = normalize(question);

  if (['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'].some((greeting) => normalizedQuestion.startsWith(greeting))) {
    return {
      text: 'Hello. I am ready to help. You can ask about the website or ask a general question.',
      references: [],
    };
  }

  return null;
};

const buildMathReply = (question) => {
  const cleaned = question.replace(/[^0-9+\-*/().%\s]/g, '').trim();
  const hasMathSignal = /[0-9]/.test(cleaned) && /[+\-*/%]/.test(cleaned);

  if (!hasMathSignal || cleaned.length !== question.trim().replace(/\s+/g, ' ').length) {
    return null;
  }

  try {
    const result = Function(`"use strict"; return (${cleaned});`)();
    if (typeof result === 'number' && Number.isFinite(result)) {
      return {
        text: `The result is ${result}.`,
        references: ['Local calculation'],
      };
    }
  } catch {
    return null;
  }

  return null;
};

const extractGeneralTopic = (question) => {
  const normalizedQuestion = normalize(question);

  for (const prefix of GENERAL_PROMPT_PREFIXES) {
    if (normalizedQuestion.startsWith(prefix)) {
      return normalizedQuestion
        .slice(prefix.length)
        .replace(/^(a|an|the)\s+/, '')
        .replace(/\s+(please|for me)$/g, '')
        .trim();
    }
  }

  return '';
};

export const getGeneralNariReply = async (question) => {
  const dateTimeReply = buildDateTimeReply(question);
  if (dateTimeReply) {
    return dateTimeReply;
  }

  const identityReply = buildIdentityReply(question);
  if (identityReply) {
    return identityReply;
  }

  const greetingReply = buildGreetingReply(question);
  if (greetingReply) {
    return greetingReply;
  }

  const mathReply = buildMathReply(question);
  if (mathReply) {
    return mathReply;
  }

  const topic = extractGeneralTopic(question);
  if (topic && typeof fetch !== 'undefined') {
    try {
      const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.extract) {
          return {
            text: data.extract,
            references: [data.title ? `Wikipedia summary: ${data.title}` : 'Wikipedia summary'],
          };
        }
      }
    } catch {
      return null;
    }
  }

  return {
    text: 'I can answer the website content directly, and I can also help with general date, time, arithmetic, and topic-summary questions. For fully open-ended ChatGPT-style general conversation, the next step would be connecting Nari to a backend AI service.',
    references: [],
  };
};

export const NARI_SUGGESTED_PROMPTS = [
  'Which basin is safest for deployment?',
  'How much energy do the reactors produce?',
  'What does the live monitor show right now?',
  'Explain the final recommendation for Namibia.',
  'What time is it?',
  'What is geothermal energy?',
];