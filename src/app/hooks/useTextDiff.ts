import { useState, useEffect, useRef } from 'react';

export type Token = {
  id: string;
  text: string;
  /** true for tokens that were just added in this diff pass */
  isNew: boolean;
};

/**
 * Tokenise into alternating word / whitespace tokens.
 * "Hello  World" → ["Hello", "  ", "World"]
 */
const tokenize = (text: string): string[] => {
  return text.match(/(\S+|\s+)/g) || [];
};

// ── Fast array diff (hash-accelerated greedy LCS) ────────────────────
type DiffPart = { value: string[]; added?: boolean; removed?: boolean };

function diffArrays(oldArr: string[], newArr: string[]): DiffPart[] {
  const oldLen = oldArr.length;
  const newLen = newArr.length;
  if (oldLen === 0 && newLen === 0) return [];
  if (oldLen === 0) return [{ value: newArr.slice(), added: true }];
  if (newLen === 0) return [{ value: oldArr.slice(), removed: true }];

  // Build index lists for each unique token in newArr
  const newMap = new Map<string, number[]>();
  for (let j = 0; j < newLen; j++) {
    const list = newMap.get(newArr[j]);
    if (list) list.push(j);
    else newMap.set(newArr[j], [j]);
  }

  // Greedy forward-LCS: for each old token find the earliest unused match in new
  const matches: Array<{ oi: number; ni: number }> = [];
  let lastNi = -1;

  for (let oi = 0; oi < oldLen; oi++) {
    const candidates = newMap.get(oldArr[oi]);
    if (!candidates) continue;

    // Binary search for smallest candidate > lastNi
    let lo = 0;
    let hi = candidates.length - 1;
    let best = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (candidates[mid] > lastNi) {
        best = mid;
        hi = mid - 1;
      } else {
        lo = mid + 1;
      }
    }

    if (best !== -1) {
      lastNi = candidates[best];
      matches.push({ oi, ni: lastNi });
    }
  }

  // Build diff parts from the matched anchors
  const parts: DiffPart[] = [];
  let oi = 0;
  let ni = 0;

  for (const m of matches) {
    if (m.oi > oi) parts.push({ value: oldArr.slice(oi, m.oi), removed: true });
    if (m.ni > ni) parts.push({ value: newArr.slice(ni, m.ni), added: true });
    const last = parts[parts.length - 1];
    if (last && !last.added && !last.removed) {
      last.value.push(oldArr[m.oi]);
    } else {
      parts.push({ value: [oldArr[m.oi]] });
    }
    oi = m.oi + 1;
    ni = m.ni + 1;
  }

  if (oi < oldLen) parts.push({ value: oldArr.slice(oi), removed: true });
  if (ni < newLen) parts.push({ value: newArr.slice(ni), added: true });

  return parts;
}

// ── Hook ──────────────────────────────────────────────────────────────

/**
 * Returns a stable-keyed token array that diffs automatically when `text`
 * changes.  Kept words preserve their IDs so Motion can distinguish
 * enter / exit / persist.
 */
export function useTextDiff(text: string): Token[] {
  const nextIdRef = useRef(0);
  const [tokens, setTokens] = useState<Token[]>(() =>
    tokenize(text).map((str) => ({
      id: `w-${nextIdRef.current++}`,
      text: str,
      isNew: false,       // initial render — nothing is "new"
    })),
  );
  const prevTextRef = useRef(text);
  const currentTokensRef = useRef<Token[]>(tokens);

  useEffect(() => {
    const prevText = prevTextRef.current;
    if (prevText === text) return;

    const oldTokensStr = tokenize(prevText);
    const newTokensStr = tokenize(text);
    const diffs = diffArrays(oldTokensStr, newTokensStr);

    let oldTokenIndex = 0;
    const newTokens: Token[] = [];

    for (const part of diffs) {
      for (const wordStr of part.value) {
        if (part.removed) {
          oldTokenIndex++;
        } else if (part.added) {
          newTokens.push({ id: `w-${nextIdRef.current++}`, text: wordStr, isNew: true });
        } else {
          const oldToken = currentTokensRef.current[oldTokenIndex];
          if (oldToken && oldToken.text === wordStr) {
            newTokens.push({ id: oldToken.id, text: wordStr, isNew: false });
          } else {
            newTokens.push({ id: `w-${nextIdRef.current++}`, text: wordStr, isNew: true });
          }
          oldTokenIndex++;
        }
      }
    }

    setTokens(newTokens);
    currentTokensRef.current = newTokens;
    prevTextRef.current = text;
  }, [text]);

  return tokens;
}