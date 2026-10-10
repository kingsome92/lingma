import './style.css';
import React from 'react';
import theme from './theme.json';
import DesignMdBatchShowcase from '../../common/DesignMdBatchShowcase';
import brandColorSpec from './assets/brand-color-spec.png?url';
import deviceReference from './assets/device-management-reference.png?url';
import growthReference from './assets/growth-center-reference.png?url';

export default function LingmaPlanetTheme() {
  const config = {
    brand: theme.identity.titleZh,
    brandAlias: '灵玛星球',
    description: theme.identity.descriptionZh,
    variant: 'mobile-product' as const,
    distributionTags: theme.tags,
    previewImages: [
      { type: 'brand-color-spec', url: brandColorSpec },
      { type: 'product-screenshot', url: growthReference },
      { type: 'product-screenshot', url: deviceReference },
    ],
    ...theme.display,
  };

  return <DesignMdBatchShowcase config={config} />;
}
