export { codeContent } from './code';
export { newsArticles } from './news';
export { getContent } from './types';
export type { ContentItem } from './types';

// Structured data for chat and social (no longer uses ContentItem format)
export { CHAT_TITLE, CHAT_MESSAGES, CHAT_SUMMARIES } from './chat';
export type { ChatMsg } from './chat';
export { SOCIAL_TITLE, SOCIAL_POSTS, SOCIAL_SUMMARIES, SOCIAL_USERS } from './social';
export type { SocialPost } from './social';
