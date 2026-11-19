/**
 * The page's one-shot confirmation mark: a card's Confirm sets it, and the
 * next request's context takes it, once. ChatMount's getContext reads it;
 * the route rebuilds it as untrusted input, so a typed "yes" never counts.
 */
import { createConfirmationMark } from 'rift-ds/chat/actions';
import type { ActionId } from './actions';

export const confirmation = createConfirmationMark<ActionId>();
