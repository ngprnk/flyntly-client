export const COMMON_REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '🚀', '👀'] as const;

export type CommonReactionEmoji = (typeof COMMON_REACTION_EMOJIS)[number];
