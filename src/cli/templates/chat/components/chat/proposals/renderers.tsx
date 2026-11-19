'use client';

/** The chat's card renderers, by kind: pass to ChatProvider's `renderers`. */
import { Proposal, RecordCard, type ProposalData } from './ProposalCard';

export const ACTION_RENDERERS = {
  proposal: (data: unknown) => <Proposal {...(data as ProposalData)} />,
  record: (data: unknown) => <RecordCard {...(data as { action: string; count: number })} />,
};
