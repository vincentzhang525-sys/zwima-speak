export function highlightKeyPhrase(text: string, keyPhrase: string) {
  const index = text.indexOf(keyPhrase);
  if (index === -1) {
    return { before: text, highlight: "", after: "" };
  }
  return {
    before: text.slice(0, index),
    highlight: keyPhrase,
    after: text.slice(index + keyPhrase.length),
  };
}
