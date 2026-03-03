import type { CompressionLevel, TonePreset } from '../stores/appStore';

export type CompressionMap = Record<TonePreset, Record<string, string>>;

export interface ContentItem {
  id: string;
  title: string;
  compressions: CompressionMap;
}

export function getContent(
  item: ContentItem,
  level: CompressionLevel,
  tone: TonePreset
): string {
  return item.compressions[tone]?.[String(level)]
    ?? item.compressions.normal[String(level)]
    ?? item.compressions.normal['0'];
}