import { useState } from 'react';
import { Clock, TrendingUp } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { newsArticles, getContent } from '../../content';
import { AnimatedText } from '../AnimatedText';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

export function NewsTab() {
  const currentLevel = useAppStore((s) => s.currentLevel);
  const currentTone = useAppStore((s) => s.currentTone);
  const [selectedArticle, setSelectedArticle] = useState(0);

  const article = newsArticles[selectedArticle];
  const text = getContent(article, currentLevel, currentTone);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {newsArticles.map((a, i) => (
          <Card
            key={a.id}
            className="cursor-pointer transition-all duration-150"
            onClick={() => setSelectedArticle(i)}
            style={{
              borderColor: selectedArticle === i ? 'var(--sq-border-2)' : undefined,
              background: selectedArticle === i ? 'var(--sq-surface-active)' : undefined,
            }}
          >
            <CardContent className="p-4 space-y-2">
              <p
                className="text-[13px] line-clamp-2"
                style={{
                  lineHeight: '1.5',
                  fontWeight: selectedArticle === i ? 500 : 400,
                  color: selectedArticle === i ? 'var(--sq-text)' : 'var(--sq-text-3)',
                }}
              >
                {a.title}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  2h ago
                </Badge>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-1">
                  <TrendingUp className="w-2.5 h-2.5" />
                  Trending
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-[15px]" style={{ fontWeight: 500, color: 'var(--sq-text)' }}>
          {article.title}
        </h2>
        <AnimatedText
          key={article.id}
          text={text}
          className="text-[13px]"
          style={{ color: 'var(--sq-text-2)', lineHeight: '1.7' }}
        />
      </div>
    </div>
  );
}