import { useState } from 'react';
import { Eye, EyeOff, RotateCcw, Zap, Sun, Moon } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button, buttonVariants } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';

const MODELS = [
  { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B', provider: 'Groq', desc: 'Fast, high quality' },
  { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B', provider: 'Groq', desc: 'Fastest, lightweight' },
  { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B', provider: 'Groq', desc: 'Good for long text' },
  { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', provider: 'OpenRouter', desc: 'Best quality' },
  { id: 'openai/gpt-4o', label: 'GPT-4o', provider: 'OpenRouter', desc: 'Versatile, reliable' },
  { id: 'google/gemini-pro-1.5', label: 'Gemini Pro 1.5', provider: 'OpenRouter', desc: 'Large context' },
];

export function SettingsTab() {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const handleTestGroq = async () => {
    if (!settings.groqKey) return;
    setTestStatus('testing');
    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${settings.groqKey}` },
      });
      setTestStatus(res.ok ? 'success' : 'error');
    } catch {
      setTestStatus('error');
    }
    setTimeout(() => setTestStatus('idle'), 3000);
  };

  const handleReset = () => {
    updateSettings({
      openRouterKey: '',
      groqKey: '',
      selectedModel: 'llama-3.3-70b-versatile',
      showLevelIndicator: true,
    });
  };

  const hasGroq = !!settings.groqKey;
  const hasOpenRouter = !!settings.openRouterKey;
  const selectedProvider = settings.selectedModel.includes('/') ? 'OpenRouter' : 'Groq';
  const hasRequiredKey = selectedProvider === 'Groq' ? hasGroq : hasOpenRouter;
  const selectedModel = MODELS.find((m) => m.id === settings.selectedModel);

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-10">
      {/* Page header */}
      <div>
        <h2 className="text-[17px] mb-1" style={{ fontWeight: 600, color: 'var(--sq-text)' }}>Settings</h2>
        <p className="text-[13px]" style={{ color: 'var(--sq-text-3)' }}>
          Configure theme, API keys, model, and display.
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardContent className="flex items-center gap-4 py-4 px-5">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: hasGroq || hasOpenRouter ? 'var(--sq-success)' : 'var(--sq-surface)' }}
          >
            <Zap className="w-4 h-4" style={{ color: hasGroq || hasOpenRouter ? 'var(--sq-success-text)' : 'var(--sq-text-4)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px]" style={{ color: 'var(--sq-text)' }}>
              {hasGroq && hasOpenRouter ? 'Both APIs connected'
                : hasGroq ? 'Groq connected'
                : hasOpenRouter ? 'OpenRouter connected'
                : 'No API keys configured'}
            </p>
            {!hasRequiredKey && settings.selectedModel !== 'llama-3.3-70b-versatile' && (
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--sq-lock-text)' }}>
                Selected model requires {selectedProvider} key
              </p>
            )}
          </div>
          <Badge variant={hasGroq || hasOpenRouter ? 'secondary' : 'outline'} className="text-[10px]">
            {hasGroq || hasOpenRouter ? 'Active' : 'Offline'}
          </Badge>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="gap-3">
        <CardHeader className="pb-0">
          <CardTitle className="text-[13px]" style={{ color: 'var(--sq-text-2)' }}>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <ToggleGroup
            type="single"
            value={theme}
            onValueChange={(val) => {
              if (val && val !== theme) toggleTheme();
            }}
            className="w-full"
          >
            <ToggleGroupItem value="light" className="flex-1 gap-2">
              <Sun className="w-4 h-4" />
              Light
            </ToggleGroupItem>
            <ToggleGroupItem value="dark" className="flex-1 gap-2">
              <Moon className="w-4 h-4" />
              Dark
            </ToggleGroupItem>
          </ToggleGroup>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card className="gap-3">
        <CardHeader className="pb-0">
          <CardTitle className="text-[13px]" style={{ color: 'var(--sq-text-2)' }}>API Keys</CardTitle>
          <CardDescription className="text-[12px]">
            Required for AI-powered compression in the Notes tab.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Groq */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[12px]" style={{ color: 'var(--sq-text-3)' }}>Groq API Key</label>
              <div className="flex items-center gap-2">
                {hasGroq && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleTestGroq}
                    className="h-6 px-2 text-[11px]"
                    style={{
                      color: testStatus === 'success' ? 'var(--sq-success-text)'
                        : testStatus === 'error' ? 'var(--sq-danger-text)'
                        : undefined,
                    }}
                  >
                    {testStatus === 'testing' ? 'Testing...' : testStatus === 'success' ? '✓ Valid' : testStatus === 'error' ? '✗ Invalid' : 'Test'}
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type={showGroqKey ? 'text' : 'password'}
                value={settings.groqKey}
                onChange={(e) => updateSettings({ groqKey: e.target.value })}
                placeholder="gsk_..."
                className="flex-1 h-9 text-[13px]"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={buttonVariants({ variant: 'outline', size: 'icon' }) + ' h-9 w-9 shrink-0'}
                    onClick={() => setShowGroqKey(!showGroqKey)}
                  >
                    {showGroqKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{showGroqKey ? 'Hide' : 'Show'}</TooltipContent>
              </Tooltip>
            </div>
            <p className="text-[11px]" style={{ color: 'var(--sq-text-4)' }}>Free tier at console.groq.com</p>
          </div>

          <Separator />

          {/* OpenRouter */}
          <div className="space-y-2">
            <label className="text-[12px]" style={{ color: 'var(--sq-text-3)' }}>OpenRouter API Key</label>
            <div className="flex items-center gap-2">
              <Input
                type={showOpenRouterKey ? 'text' : 'password'}
                value={settings.openRouterKey}
                onChange={(e) => updateSettings({ openRouterKey: e.target.value })}
                placeholder="sk-or-..."
                className="flex-1 h-9 text-[13px]"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={buttonVariants({ variant: 'outline', size: 'icon' }) + ' h-9 w-9 shrink-0'}
                    onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}
                  >
                    {showOpenRouterKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{showOpenRouterKey ? 'Hide' : 'Show'}</TooltipContent>
              </Tooltip>
            </div>
            <p className="text-[11px]" style={{ color: 'var(--sq-text-4)' }}>Access Claude, GPT-4o, Gemini via openrouter.ai</p>
          </div>
        </CardContent>
      </Card>

      {/* Model */}
      <Card className="gap-3">
        <CardHeader className="pb-0">
          <CardTitle className="text-[13px]" style={{ color: 'var(--sq-text-2)' }}>Model</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={settings.selectedModel}
            onValueChange={(val) => updateSettings({ selectedModel: val })}
          >
            <SelectTrigger className="w-full h-10">
              <SelectValue>
                {selectedModel ? (
                  <span className="flex items-center gap-2">
                    <span>{selectedModel.label}</span>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0">{selectedModel.provider}</Badge>
                  </span>
                ) : 'Select model'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {MODELS.map((model) => {
                const providerAvailable = model.provider === 'Groq' ? hasGroq : hasOpenRouter;
                return (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex-1">
                        <span className="text-[13px]">{model.label}</span>
                        <span className="text-[11px] ml-2" style={{ color: 'var(--sq-text-4)' }}>{model.desc}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0">{model.provider}</Badge>
                        {!providerAvailable && (
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--sq-lock-text)' }} title="No API key" />
                        )}
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Display */}
      <Card className="gap-3">
        <CardHeader className="pb-0">
          <CardTitle className="text-[13px]" style={{ color: 'var(--sq-text-2)' }}>Display</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Level Indicator Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-[12px]" style={{ color: 'var(--sq-text-3)' }}>Level Indicator</label>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--sq-text-4)' }}>Show floating level dots on change</p>
            </div>
            <Switch
              checked={settings.showLevelIndicator}
              onCheckedChange={(v) => updateSettings({ showLevelIndicator: v })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Keyboard shortcuts */}
      <Card className="gap-3">
        <CardHeader className="pb-0">
          <CardTitle className="text-[13px]" style={{ color: 'var(--sq-text-2)' }}>Keyboard Shortcuts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5">
            {[
              ['↑ / ↓', 'Change compression level'],
              ['← / →', 'Cycle tone preset'],
              ['Space', 'Lock / unlock level'],
              ['1 – 4', 'Jump to level (0 to 3)'],
              ['Shift + Scroll', 'Scroll-to-compress'],
              ['Ctrl + Pinch', 'Pinch-to-compress'],
              ['Ctrl + Shift + Scroll', 'Scroll-to-tone'],
            ].map(([key, desc]) => (
              <div key={key} className="flex items-center justify-between">
                <kbd
                  className="text-[11px] px-2.5 py-1 rounded-md min-w-[120px] border"
                  style={{ color: 'var(--sq-text-2)', background: 'var(--sq-surface)', borderColor: 'var(--sq-border)' }}
                >
                  {key}
                </kbd>
                <span className="text-[12px]" style={{ color: 'var(--sq-text-3)' }}>{desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reset */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="destructive" size="sm" onClick={handleReset} className="gap-2">
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All Settings
        </Button>
        <span className="text-[11px]" style={{ color: 'var(--sq-text-4)' }}>Squeeze 2.0</span>
      </div>
    </div>
  );
}