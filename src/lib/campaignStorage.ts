import {
  emptyCampaignProgress,
  type CampaignProgress,
  applyCampaignResult,
  starsForScore,
  getCampaignLevel,
  getGateBonus,
  hasClaimedGateBonus,
  type CampaignGateBonus,
} from './campaign';

const KEY = 'sportivia-campaign-v1';

export function loadCampaignProgress(): CampaignProgress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyCampaignProgress();
    const parsed = JSON.parse(raw) as Partial<CampaignProgress>;
    const base = emptyCampaignProgress();
    return {
      stars: { ...base.stars, ...(parsed.stars ?? {}) },
      bestScore: { ...base.bestScore, ...(parsed.bestScore ?? {}) },
      unlockedThrough: Math.max(1, Number(parsed.unlockedThrough) || 1),
      seenIntro: Boolean(parsed.seenIntro),
      claimedGateBonuses: Array.isArray(parsed.claimedGateBonuses)
        ? parsed.claimedGateBonuses.map(Number).filter(n => Number.isFinite(n))
        : [],
    };
  } catch {
    return emptyCampaignProgress();
  }
}

export function saveCampaignProgress(progress: CampaignProgress): CampaignProgress {
  localStorage.setItem(KEY, JSON.stringify(progress));
  return progress;
}

export function recordCampaignLevelResult(levelId: number, score: number): CampaignProgress {
  const next = applyCampaignResult(loadCampaignProgress(), levelId, score);
  return saveCampaignProgress(next);
}

export function markCampaignIntroSeen(): CampaignProgress {
  const cur = loadCampaignProgress();
  if (cur.seenIntro) return cur;
  return saveCampaignProgress({ ...cur, seenIntro: true });
}

/**
 * One-time gate/finale payout when the run earns ≥2★.
 * Returns the bonus payload if newly claimed, else null.
 */
export function tryClaimCampaignGateBonus(
  levelId: number,
  score: number,
): CampaignGateBonus | null {
  const bonus = getGateBonus(levelId);
  if (!bonus) return null;
  const level = getCampaignLevel(levelId);
  if (starsForScore(level, score) < 2) return null;

  const cur = loadCampaignProgress();
  if (hasClaimedGateBonus(cur, levelId)) return null;

  saveCampaignProgress({
    ...cur,
    claimedGateBonuses: [...(cur.claimedGateBonuses ?? []), levelId],
  });
  return bonus;
}
