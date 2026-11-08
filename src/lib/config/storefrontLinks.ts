/**
 * Centralized Etsy Storefront & Product-Led Growth (PLG) Funnel Links
 * Appends clean UTM parameters so Etsy Shop Manager & analytics can attribute conversions
 * back to specific in-app touchpoints (demo_banner, activate_page, guest_photo_portal, etc.).
 */

export const ETSY_STOREFRONT_CONFIG = {
  vowListingUrl:
    process.env.NEXT_PUBLIC_ETSY_VOW_URL ||
    process.env.NEXT_PUBLIC_ETSY_SHOP_URL ||
    'https://www.etsy.com/shop/Sheet2Suite',
  suiteShopUrl:
    process.env.NEXT_PUBLIC_ETSY_SHOP_URL ||
    'https://www.etsy.com/shop/Sheet2Suite',
};

export function getEtsyPurchaseUrl(
  source: string,
  product: 'vow' | 'suite' = 'vow'
): string {
  const baseUrl =
    product === 'vow'
      ? ETSY_STOREFRONT_CONFIG.vowListingUrl
      : ETSY_STOREFRONT_CONFIG.suiteShopUrl;

  try {
    const url = new URL(baseUrl);
    url.searchParams.set('utm_source', 'sheet2suite_app');
    url.searchParams.set('utm_medium', source);
    url.searchParams.set('utm_campaign', product === 'vow' ? 'sheet2vow_plg' : 'sheet2suite_plg');
    return url.toString();
  } catch {
    return baseUrl;
  }
}

export function getDemoWorkspaceUrl(source: string): string {
  return `/vow?demo=true&utm_source=${encodeURIComponent(source)}`;
}
