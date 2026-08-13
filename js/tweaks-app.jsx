/* ════════════════════════════════════════════════════════════════════
   TWEAKS — Look & Content controls for the Rousseau redesign
   ════════════════════════════════════════════════════════════════════ */
const { useEffect } = React;

/* Full palettes. The swatch array (5 colours) is what's stored as the tweak
   value; we match on it to apply the complete variable set + recolour foliage. */
const PALETTES = [
  {
    name: 'Emerald',
    swatch: ['#11261a', '#2d6a4f', '#7ba892', '#e0a458', '#cf6a48'],
    vars: {
      '--canopy': '#0b1a12', '--jungle': '#11261a', '--leaf-deep': '#173524',
      '--leaf': '#2d6a4f', '--leaf-mid': '#4a8568', '--sage': '#7ba892',
      '--paper': '#f1ead6', '--paper-2': '#e9e0c7', '--ink': '#16271c',
      '--ink-soft': '#41564a', '--gold': '#e0a458', '--gold-soft': '#d9b277', '--bloom': '#cf6a48',
    },
  },
  {
    name: 'Lagoon',
    swatch: ['#0c2426', '#1f6360', '#79b4ab', '#d98841', '#b8475a'],
    vars: {
      '--canopy': '#07191a', '--jungle': '#0c2426', '--leaf-deep': '#123133',
      '--leaf': '#1f6360', '--leaf-mid': '#3f8a84', '--sage': '#79b4ab',
      '--paper': '#eee7d4', '--paper-2': '#e3dac3', '--ink': '#112726',
      '--ink-soft': '#3c5350', '--gold': '#d98841', '--gold-soft': '#d2a06a', '--bloom': '#b8475a',
    },
  },
  {
    name: 'Verdant',
    swatch: ['#1a3a23', '#2f7d4a', '#8fc196', '#cf9a3c', '#cf6a48'],
    vars: {
      '--canopy': '#13301d', '--jungle': '#1a3a23', '--leaf-deep': '#214d2e',
      '--leaf': '#2f7d4a', '--leaf-mid': '#58a16a', '--sage': '#8fc196',
      '--paper': '#f4eeda', '--paper-2': '#ece3c9', '--ink': '#1a3322',
      '--ink-soft': '#46604c', '--gold': '#cf9a3c', '--gold-soft': '#d8b46e', '--bloom': '#cf6a48',
    },
  },
];

const FONTS = {
  'Playfair': "'Playfair Display', Georgia, serif",
  'Marcellus': "'Marcellus', Georgia, serif",
  'DM Serif': "'DM Serif Display', Georgia, serif",
};

const FOLIAGE_LEVELS = { Lush: 1, Balanced: 0.62, Minimal: 0.28 };

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#11261a", "#2d6a4f", "#7ba892", "#e0a458", "#cf6a48"],
  "font": "Playfair",
  "foliage": "Lush",
  "motion": true,
  "headline": ""
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const root = document.documentElement;

  // palette
  useEffect(() => {
    const pal = PALETTES.find((p) => JSON.stringify(p.swatch) === JSON.stringify(t.palette)) || PALETTES[0];
    Object.entries(pal.vars).forEach(([k, v]) => root.style.setProperty(k, v));
    // recolour the canvas fern + svg fronds, which read vars at build time
    if (window.FOLIAGE) {
      // let the CSS vars settle first
      requestAnimationFrame(() => window.FOLIAGE.rebuild());
    }
  }, [t.palette]);

  // font
  useEffect(() => {
    root.style.setProperty('--font-display', FONTS[t.font] || FONTS['Playfair']);
  }, [t.font]);

  // foliage density
  useEffect(() => {
    root.style.setProperty('--foliage-opacity', String(FOLIAGE_LEVELS[t.foliage] ?? 1));
  }, [t.foliage]);

  // ambient motion
  useEffect(() => {
    root.style.setProperty('--sway', t.motion ? '1' : '0');
  }, [t.motion]);

  // headline copy override (applies to both languages)
  useEffect(() => {
    window.__copyOverrides = window.__copyOverrides || {};
    const v = (t.headline || '').trim();
    if (v) window.__copyOverrides.hero_title = v;
    else delete window.__copyOverrides.hero_title;
    if (window.applyLang) window.applyLang(window.currentLang || 'es');
  }, [t.headline]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Look" />
      <TweakColor label="Jungle palette" value={t.palette}
        options={PALETTES.map((p) => p.swatch)}
        onChange={(v) => setTweak('palette', v)} />
      <TweakRadio label="Display font" value={t.font}
        options={['Playfair', 'Marcellus', 'DM Serif']}
        onChange={(v) => setTweak('font', v)} />
      <TweakRadio label="Foliage" value={t.foliage}
        options={['Lush', 'Balanced', 'Minimal']}
        onChange={(v) => setTweak('foliage', v)} />
      <TweakToggle label="Ambient motion" value={t.motion}
        onChange={(v) => setTweak('motion', v)} />
      <TweakSection label="Content" />
      <TweakText label="Hero headline" value={t.headline}
        placeholder="Leave blank for default"
        onChange={(v) => setTweak('headline', v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<App />);
