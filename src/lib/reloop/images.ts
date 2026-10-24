/**
 * Verified illustrative photos (Unsplash CDN). Each URL was checked to return
 * HTTP 200 and visually reviewed for subject matter on 23 October 2026.
 * These are illustrative stock photos — never presented as local documentary
 * evidence. Credit: photographers via Unsplash (https://unsplash.com).
 */

import cardboardAsset from "@/assets/reuse-cardboard.jpg.asset.json";

function unsplash(id: string, w = 1200, h?: number) {
  const base = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;
  return h ? `${base}&h=${h}` : base;
}

export interface SiteImage {
  src: string;
  alt: string;
}

export const IMAGES = {
  cardboardSorting: {
    src: cardboardAsset.url,
    alt: "Flattened cardboard sorted into stacks on a wooden floor (illustrative photograph)",
  },
  /** Volunteers sorting donated cardboard boxes at a community drive */
  communitySorting: {
    src: unsplash("1593113598332-cd288d649433", 1600),
    alt: "Volunteers sorting donated cardboard boxes at a community collection drive",
  },
  /** Row of colour-coded recycling bins */
  recyclingBins: {
    src: unsplash("1532996122724-e3c354a0b15b", 1600),
    alt: "A row of colour-coded recycling bins against a wall",
  },
  /** Compost, waste and recycling bins side by side */
  sortingBins: {
    src: unsplash("1611284446314-60a58ac0deb9", 1200),
    alt: "Compost, waste and recycling bins labelled for correct sorting",
  },
  cardboard: {
    src: unsplash("1595246140625-573b715d11dc", 900),
    alt: "Plain cardboard boxes ready for reuse",
  },
  paper: {
    src: unsplash("1586075010923-2dd4570fb338", 900),
    alt: "Crumpled paper texture",
  },
  reusableBottle: {
    src: unsplash("1602143407151-7111542de6e8", 900),
    alt: "A durable reusable bottle that replaces single-use plastic",
  },
  textiles: {
    src: unsplash("1523381210434-271e8be1f52b", 900),
    alt: "Second-hand clothes hanging on wooden hangers",
  },
  denim: {
    src: unsplash("1591195853828-11db59a44f6b", 900),
    alt: "A pair of denim shorts, an example of clothing that can be repaired or swapped",
  },
  furniture: {
    src: unsplash("1555041469-a586c61ea9bc", 900),
    alt: "A second-hand sofa that can be rehomed instead of discarded",
  },
  woodFurniture: {
    src: unsplash("1595428774223-ef52624120d2", 900),
    alt: "A wooden cabinet that can be repaired or refinished",
  },
  electronics: {
    src: unsplash("1550009158-9ebf69173e03", 900),
    alt: "Headphones, a keyboard and a mouse — electronics that can be repaired or passed on",
  },
  organic: {
    src: unsplash("1610348725531-843dff563e2c", 900),
    alt: "Fresh vegetables — food scraps can become compost instead of rubbish",
  },
  /** Beach littered with plastic bottles (illustrative) */
  plasticPollution: {
    src: unsplash("1530587191325-3db32d826c18", 1200),
    alt: "Plastic bottles and other litter washed up on a beach (illustrative photo)",
  },
  /** Crushed plastic bottles collected for recycling (illustrative) */
  crushedBottles: {
    src: unsplash("1571727153934-b9e0059b7ab2", 1200),
    alt: "Crushed plastic bottles collected for recycling (illustrative photo)",
  },
  /** Overflowing street litter bin (illustrative) */
  overflowingBin: {
    src: unsplash("1605600659908-0ef719419d41", 1200),
    alt: "An overflowing street litter bin (illustrative photo)",
  },
  /** Volunteers picking litter from a beach */
  beachCleanup: {
    src: unsplash("1618477461853-cf6ed80faba5", 1200),
    alt: "Volunteers collecting litter from a beach during a cleanup",
  },
  /** Hands holding a jar of coins labelled make a change */
  makeAChange: {
    src: unsplash("1532629345422-7515f3d16bb6", 1400),
    alt: "Hands holding a small jar with a note reading make a change",
  },
  volunteer: {
    src: unsplash("1559027615-cd4628902d4a", 1200),
    alt: "A volunteer in a coloured vest helping at a community event",
  },
  /** Assorted pills and capsules — expired medicines are hazardous waste */
  hazardousMedicines: {
    src: unsplash("1622227922682-56c92e523e58", 900),
    alt: "Assorted pills and capsules — expired medicines must go to a designated collection point, not the bin",
  },
} as const satisfies Record<string, SiteImage>;

export const HERO_OG_IMAGE = unsplash("1593113598332-cd288d649433", 1200, 630);

export const UNSPLASH_CREDIT = {
  label: "Illustrative photo via Unsplash",
  url: "https://unsplash.com",
} as const;

export const CARDBOARD_SOURCE =
  "https://unsplash.com/photos/a-pile-of-cardboard-sitting-on-top-of-a-wooden-floor-quTvuVu0ghQ";
