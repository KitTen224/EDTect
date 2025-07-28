export function findSimilarMessage(message: string, history: any[]) {
  const lower = message.toLowerCase().trim();
  for (const log of history) {
    const past = log.prompt_text?.toLowerCase().trim();
    if (past && (lower.includes(past) || past.includes(lower))) {
      return log;
    }
  }
  return null;
}
