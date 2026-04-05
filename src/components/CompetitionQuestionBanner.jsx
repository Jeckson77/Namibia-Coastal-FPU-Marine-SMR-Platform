import React from 'react';
import { COMPETITION_QUESTIONS } from '../data/competition-brief';

/**
 * Makes the link to the official case-study question explicit for jury review.
 */
const CompetitionQuestionBanner = ({ questionId }) => {
  const q = COMPETITION_QUESTIONS.find((item) => item.id === questionId);
  if (!q) return null;

  return (
    <div className="mb-8 rounded-lg bg-surface-low/80 border-l-2 border-primary/45 pl-4 pr-5 py-4 md:py-5 shadow-[24px_0_48px_rgba(0,0,0,0.15)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-8">
        <div className="flex shrink-0 items-center gap-3">
          <span className="inline-flex h-10 items-center rounded-full border border-primary/20 bg-primary/10 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary/70">
            Competition requirement
          </span>
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="m-0 text-base font-display font-semibold tracking-tight text-primary md:text-lg">
            {q.sectionTitle}
          </h2>
          <p className="m-0 text-sm leading-relaxed text-secondary/90 md:text-[15px]">
            {q.brief}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompetitionQuestionBanner;
