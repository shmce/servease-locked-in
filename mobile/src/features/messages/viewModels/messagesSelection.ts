import type { ConversationSummary } from '../../../shared/models/types';

export function resolveSelectedConversationAfterReplace(
  currentConversationId: string | null,
  nextConversations: ConversationSummary[],
): string | null {
  if (!currentConversationId) {
    return null;
  }

  return nextConversations.some((conversation) => conversation.id === currentConversationId)
    ? currentConversationId
    : null;
}
