import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Asset } from '../types/asset';
import rawAssets from '../assets/financial_assets.json';

const PRICE_UPDATE_INTERVAL = 3000;
const VOLATILITY_PER_TICK = 0.02;

const initialAssets = rawAssets as Asset[];

const initialBaselineById = new Map<number, number>();

for (const asset of initialAssets) {
  const factor = 1 + asset.dailyChangePercent / 100;
  if (!Number.isFinite(factor) || factor <= 0) {
    initialBaselineById.set(asset.id, asset.currentPrice);
    continue;
  }
  const baseline = asset.currentPrice / factor;
  initialBaselineById.set(
    asset.id,
    baseline > 0 ? baseline : asset.currentPrice,
  );
}

interface AssetsContextValue {
  assets: Asset[];
}

const AssetsContext = createContext<AssetsContextValue>({ assets: [] });

export const AssetsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);

  /**
   * Store assets in a ref so the interval callback always reads the
   * latest value without being added as a dependency.
   *
   * Bug was:
   *   useEffect(() => { setInterval(() => { ... assets ... }) }, [assets])
   *   → new interval created on every state update → memory leak + thrash
   *
   * Fixed by: empty deps [] + ref for up-to-date read inside the closure.
   */
  const assetsRef = useRef<Asset[]>(initialAssets);

  const baselineByIdRef = useRef<Map<number, number>>(initialBaselineById);

  useEffect(() => {
    assetsRef.current = assets;
  }, [assets]);

  useEffect(() => {
    const id = setInterval(() => {
      const baselineById = baselineByIdRef.current;

      const updated = assetsRef.current.map(asset => {
        const baseline = baselineById.get(asset.id) ?? asset.currentPrice;

        const random = Math.random() - 0.5;
        const changeFactor = 1 + random * VOLATILITY_PER_TICK;

        const nextPriceRaw = asset.currentPrice * changeFactor;
        const nextPrice = parseFloat(Math.max(nextPriceRaw, 0.01).toFixed(2));

        const dailyChangePercent = parseFloat(
          ((nextPrice / baseline - 1) * 100).toFixed(2),
        );

        return {
          ...asset,
          currentPrice: nextPrice,
          dailyChangePercent,
        };
      });

      assetsRef.current = updated;
      setAssets(updated);
    }, PRICE_UPDATE_INTERVAL);

    return () => clearInterval(id);
  }, []);

  return (
    <AssetsContext.Provider value={{ assets }}>
      {children}
    </AssetsContext.Provider>
  );
};

export const useAssets = (): Asset[] => useContext(AssetsContext).assets;
