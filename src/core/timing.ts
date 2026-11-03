import type {Alignment, Caption} from './model';

export function captionsFromAlignment(a: Alignment): Caption[] {
  const n = a.characters.length;
  if (!n || a.character_start_times_seconds.length !== n || a.character_end_times_seconds.length !== n) throw new Error('Invalid alignment lengths');
  for (let i = 0; i < n; i++) {
    const start = a.character_start_times_seconds[i], end = a.character_end_times_seconds[i];
    if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < start || (i > 0 && start < a.character_start_times_seconds[i - 1])) throw new Error('Invalid alignment timestamps');
  }
  const words: Caption[] = [];
  let text = '', first = 0, last = 0;
  const flush = () => {if (text) words.push({text, start: first, end: last}); text = '';};
  a.characters.forEach((char, i) => {
    if (/\s/u.test(char)) {flush(); return;}
    if (!text) first = a.character_start_times_seconds[i];
    text += char; last = a.character_end_times_seconds[i];
  });
  flush();
  const result: Caption[] = [];
  for (const word of words) {
    const prior = result.at(-1);
    if (prior && prior.text.length + word.text.length < 42 && word.end - prior.start < 2.8 && !/[.!?।]$/u.test(prior.text)) {prior.text += ` ${word.text}`; prior.end = word.end;}
    else result.push({...word});
  }
  return result;
}

export function cueTime(a: Alignment, phrase: string): number {
  const text = a.characters.join('');
  const index = text.indexOf(phrase);
  if (index < 0) throw new Error(`Timing anchor missing: ${phrase}`);
  let offset = 0;
  for (let i = 0; i < a.characters.length; i++) {
    if (offset >= index) return a.character_start_times_seconds[i];
    offset += a.characters[i].length;
  }
  throw new Error('Invalid timing anchor');
}
