import { useState, useEffect, useRef } from 'react';
import { diffArrays } from 'diff';

export type Token = {
  id: string;
  text: string;
};

// Split by words, punctuation, and whitespaces while preserving all of them as separate tokens
// A simpler approach: split by word boundaries, but keep spaces intact.
const tokenize = (text: string) => {
  return text.match(/(\S+|\s+)/g) || [];
};

export function useTextDiff(texts: string[], currentIndex: number) {
  const nextIdRef = useRef(0);
  const [tokens, setTokens] = useState<Token[]>(() => {
    const initialTokensStr = tokenize(texts[currentIndex]);
    return initialTokensStr.map((str) => ({
      id: `word-${nextIdRef.current++}`,
      text: str,
    }));
  });
  const prevIndexRef = useRef(currentIndex);
  const currentTokensRef = useRef<Token[]>(tokens);

  useEffect(() => {
    const prevIndex = prevIndexRef.current;
    if (prevIndex === currentIndex) return;

    const prevText = texts[prevIndex];
    const newText = texts[currentIndex];

    const oldTokensStr = tokenize(prevText);
    const newTokensStr = tokenize(newText);

    // Diff the arrays of strings to see what was added/removed/kept
    const diffs = diffArrays(oldTokensStr, newTokensStr);

    let oldTokenIndex = 0;
    const newTokens: Token[] = [];

    diffs.forEach((part) => {
      const partValues = Array.isArray(part.value) ? part.value : [part.value];
      partValues.forEach((wordStr) => {
        if (part.removed) {
          // If it's removed, we advance the old pointer but don't add it to new array.
          // Framer Motion's AnimatePresence handles the exit animation.
          oldTokenIndex++;
        } else if (part.added) {
          // New word
          newTokens.push({ id: `word-${nextIdRef.current++}`, text: wordStr });
        } else {
          // Kept word. Look up its previous stable ID to allow layout animations.
          const oldToken = currentTokensRef.current[oldTokenIndex];
          if (oldToken && oldToken.text === wordStr) {
            newTokens.push({ id: oldToken.id, text: wordStr });
          } else {
            // Fallback if mismatch (should not happen with consistent tokenization)
            newTokens.push({ id: `word-${nextIdRef.current++}`, text: wordStr });
          }
          oldTokenIndex++;
        }
      });
    });

    setTokens(newTokens);
    currentTokensRef.current = newTokens;
    prevIndexRef.current = currentIndex;

  }, [currentIndex, texts]);

  return tokens;
}
