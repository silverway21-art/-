/**
 * Visitor Session & Privacy Helper
 * Ensures inquiries and answers are securely tied to the specific visitor
 * so that only the sender can view responses in the app.
 */

const VISITOR_ID_KEY = 'zion_visitor_token_v1';
const MY_SENT_MESSAGES_KEY = 'zion_my_sent_messages_v1';
const SEEN_REPLIES_KEY = 'zion_seen_replies_v1';

/**
 * Returns a stable unique visitor identifier for this browser/device.
 */
export function getOrCreateVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = `vis_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return 'vis_fallback_session';
  }
}

export const getVisitorId = getOrCreateVisitorId;

/**
 * Get the list of message IDs sent by this visitor on this browser.
 */
export function getMySentMessageIds(): string[] {
  try {
    const raw = localStorage.getItem(MY_SENT_MESSAGES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

/**
 * Record a new sent message ID in local storage for this visitor.
 */
export function addMySentMessageId(msgId: string) {
  try {
    const current = getMySentMessageIds();
    if (!current.includes(msgId)) {
      const updated = [msgId, ...current];
      localStorage.setItem(MY_SENT_MESSAGES_KEY, JSON.stringify(updated));
    }
  } catch {}
}

/**
 * Get IDs of replies that have been viewed by this visitor.
 */
export function getSeenReplyIds(): string[] {
  try {
    const raw = localStorage.getItem(SEEN_REPLIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

/**
 * Mark a reply as seen by this visitor.
 */
export function markReplyAsSeen(msgId: string) {
  try {
    const current = getSeenReplyIds();
    if (!current.includes(msgId)) {
      const updated = [...current, msgId];
      localStorage.setItem(SEEN_REPLIES_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('zion_replies_updated'));
    }
  } catch {}
}
