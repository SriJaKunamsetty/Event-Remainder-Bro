'use client';

interface ContextTogglesProps {
  readonly alcohol: boolean;
  readonly onAlcohol: (v: boolean) => void;
  readonly dietary: boolean;
  readonly onDietary: (v: boolean) => void;
  readonly accessibility: boolean;
  readonly onAccessibility: (v: boolean) => void;
}

export const ContextToggles = (p: ContextTogglesProps) => {
  return (
    <div className="flex flex-wrap items-center gap-6 pt-2">
      <label className="flex items-center gap-2 text-sm text-neutral-800 cursor-pointer min-h-[44px]">
        <input
          type="checkbox"
          checked={p.alcohol}
          onChange={(e) => p.onAlcohol(e.target.checked)}
          className="h-5 w-5 rounded border-neutral-400 text-blue-700 focus:ring-blue-700"
        />
        <span>Serves Alcohol</span>
      </label>
      <label className="flex items-center gap-2 text-sm text-neutral-800 cursor-pointer min-h-[44px]">
        <input
          type="checkbox"
          checked={p.dietary}
          onChange={(e) => p.onDietary(e.target.checked)}
          className="h-5 w-5 rounded border-neutral-400 text-blue-700 focus:ring-blue-700"
        />
        <span>Dietary Needs</span>
      </label>
      <label className="flex items-center gap-2 text-sm text-neutral-800 cursor-pointer min-h-[44px]">
        <input
          type="checkbox"
          checked={p.accessibility}
          onChange={(e) => p.onAccessibility(e.target.checked)}
          className="h-5 w-5 rounded border-neutral-400 text-blue-700 focus:ring-blue-700"
        />
        <span>Accessibility Accommodations</span>
      </label>
    </div>
  );
};
