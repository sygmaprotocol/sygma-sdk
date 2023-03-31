export type XcmMultiAssetIdType = {
  concrete: {
    parents: number;
    interior: {
      x3: Array<{ parachain: number } | { generalKey: string }>;
    };
  };
};


