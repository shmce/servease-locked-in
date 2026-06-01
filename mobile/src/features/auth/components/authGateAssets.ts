import type { ImageSourcePropType } from 'react-native';

export type AuthReferenceDecorativePlate = {
  source: ImageSourcePropType;
  intrinsicSize: {
    width: number;
    height: number;
  };
};

export const authReferenceDecorativePlate: AuthReferenceDecorativePlate = {
  source: require('../../../../assets/auth/auth-reference-decorative-plate.png'),
  intrinsicSize: { width: 851, height: 1847 },
};

export type AuthReferenceBrandAsset = {
  source: ImageSourcePropType;
  intrinsicSize: {
    width: number;
    height: number;
  };
};

export const authReferenceBrandMark: AuthReferenceBrandAsset = {
  source: require('../../../../assets/auth/auth-brand-mark.png'),
  intrinsicSize: { width: 185, height: 222 },
};

export const authReferenceWordmark: AuthReferenceBrandAsset = {
  source: require('../../../../assets/auth/auth-wordmark.png'),
  intrinsicSize: { width: 594, height: 91 },
};

export type AuthDecorativeAssetLayerId =
  | 'pliers'
  | 'brush'
  | 'paintStroke'
  | 'broom'
  | 'wrenchFaucet';

export type AuthDecorativeAssetLayer = {
  id: AuthDecorativeAssetLayerId;
  source: ImageSourcePropType;
  zone: 'upper-left' | 'upper-right' | 'lower-left' | 'lower-right';
  intrinsicSize: {
    width: number;
    height: number;
  };
};

export const authDecorativeAssetLayers: AuthDecorativeAssetLayer[] = [
  {
    id: 'pliers',
    source: require('../../../../assets/auth/layers/auth-tool-pliers.png'),
    zone: 'upper-left',
    intrinsicSize: { width: 436, height: 608 },
  },
  {
    id: 'paintStroke',
    source: require('../../../../assets/auth/layers/auth-paint-stroke.png'),
    zone: 'upper-right',
    intrinsicSize: { width: 452, height: 710 },
  },
  {
    id: 'brush',
    source: require('../../../../assets/auth/layers/auth-tool-brush.png'),
    zone: 'upper-right',
    intrinsicSize: { width: 343, height: 774 },
  },
  {
    id: 'broom',
    source: require('../../../../assets/auth/layers/auth-tool-broom.png'),
    zone: 'lower-left',
    intrinsicSize: { width: 427, height: 670 },
  },
  {
    id: 'wrenchFaucet',
    source: require('../../../../assets/auth/layers/auth-tool-wrench-faucet.png'),
    zone: 'lower-right',
    intrinsicSize: { width: 1003, height: 497 },
  },
];
