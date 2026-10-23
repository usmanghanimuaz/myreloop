import { IMAGES, type SiteImage } from "./images";

/**
 * Original ReLoop educational articles. Explanations are written by the project;
 * cited facts link to the authoritative sources listed per article.
 * Author: the ReLoop project builder. Published 23 October 2026.
 */

export interface ArticleBlock {
  heading?: string;
  paragraphs: string[];
}

export interface Article {
  slug: string;
  title: string;
  description: string;
  image: SiteImage;
  published: string;
  updated: string;
  blocks: ArticleBlock[];
  sources: { title: string; organization: string; url: string }[];
}

export const ARTICLES: Article[] = [
  {
    slug: "reuse-before-disposal",
    title: "Reuse before disposal: why it comes first",
    description:
      "Why passing on a usable item prevents more waste than recycling it — and how to make reuse your default first step.",
    image: IMAGES.furniture,
    published: "23 October 2026",
    updated: "23 October 2026",
    blocks: [
      {
        paragraphs: [
          "Usable items are often thrown away simply because their owner no longer needs them. A working lamp, a sturdy box, a chair with a loose screw — none of these are waste yet. They become waste only when we decide to treat them that way.",
          "Waste-management guidance consistently puts prevention and reuse ahead of recycling. Recycling is valuable, but it still requires collection, transport and processing. Reuse skips all of that: the item simply keeps being useful, in someone else's hands.",
        ],
      },
      {
        heading: "What reuse saves",
        paragraphs: [
          "Every reused item avoids three things at once: the item itself going to a bin, drain or dump; the demand for a new replacement product; and the packaging and transport that replacement would need. You don't need a exact number for this to be true — the direction is what matters.",
          "Poorly managed waste can pollute land, water and air, attract pests, and contribute to contamination and health risks for people and animals. Keeping usable items in use is one of the simplest ways to shrink that flow at the source.",
        ],
      },
      {
        heading: "Make it a habit",
        paragraphs: [
          "Before you throw something away, ask one question: could someone nearby still use this? If yes, list it — free or for exchange. If it needs a small fix, consider repair first. Only when reuse and repair are genuinely off the table should recycling or disposal be the answer.",
          "That single pause — think before you throw — is the habit ReLoop is built around.",
        ],
      },
    ],
    sources: [
      {
        title: "Recycling Basics and Benefits",
        organization: "US Environmental Protection Agency",
        url: "https://www.epa.gov/recycle/recycling-basics-and-benefits",
      },
      {
        title: "Global Waste Management Outlook 2024",
        organization: "UNEP",
        url: "https://www.unep.org/resources/global-waste-management-outlook-2024",
      },
    ],
  },
  {
    slug: "household-waste-prevention",
    title: "Household waste prevention: practical habits that work",
    description:
      "Simple, realistic habits that reduce what your household throws away — without needing special equipment or a lifestyle overhaul.",
    image: IMAGES.sortingBins,
    published: "23 October 2026",
    updated: "23 October 2026",
    blocks: [
      {
        paragraphs: [
          "Waste prevention sounds abstract, but in a household it is a set of small, boring, repeatable habits. None of them require special equipment. All of them reduce what ends up in the bin.",
        ],
      },
      {
        heading: "Habits that prevent waste",
        paragraphs: [
          "Buy for actual use: the most reliable way to prevent waste is to not bring home things you won't finish or use. Plan meals, check cupboards before shopping, and borrow or find second-hand items for one-off needs.",
          "Reuse before recycling: jars, boxes, bags and containers can serve again at home before they enter any collection stream. Repair before replacing: a loose screw, a new zip or a fresh plug often solves the problem.",
          "Sort correctly: rinsed, correctly sorted recyclables actually get recycled; contaminated loads often don't. Learn your local rules — they differ between areas.",
        ],
      },
      {
        heading: "What never belongs in the household bin",
        paragraphs: [
          "Batteries, paint, solvents, chemicals, expired medicines and electronics need designated collection points. They can cause fires in collection trucks and contaminate soil and water when dumped or burned.",
          "Never burn mixed waste — smoke from burning plastic is toxic — and never dump waste in drains, streams or empty plots, where it blocks drainage and poisons water.",
        ],
      },
    ],
    sources: [
      {
        title: "Global Waste Management Outlook 2024",
        organization: "UNEP",
        url: "https://www.unep.org/resources/global-waste-management-outlook-2024",
      },
      {
        title: "Recycling Basics and Benefits",
        organization: "US Environmental Protection Agency",
        url: "https://www.epa.gov/recycle/recycling-basics-and-benefits",
      },
    ],
  },
  {
    slug: "batteries-electronics-safe-disposal",
    title: "Batteries and electronics: safe disposal when reuse isn't possible",
    description:
      "Working devices deserve a second life — but damaged electronics and loose batteries are a fire and contamination risk. Here's how to handle them.",
    image: IMAGES.electronics,
    published: "23 October 2026",
    updated: "23 October 2026",
    blocks: [
      {
        paragraphs: [
          "Electronics sit at both extremes of the waste problem. A working device is one of the most valuable things you can pass on — it avoids the significant materials and energy needed to make a new one. A damaged device or a loose battery is one of the most dangerous things you can put in a household bin.",
        ],
      },
      {
        heading: "If it works: pass it on",
        paragraphs: [
          "Wipe your personal data first (factory reset, remove accounts and memory cards), check the cable and plug are intact, and list it. Be honest about condition — a device with a fault can still be useful to someone with repair skills, as long as they know what they're getting.",
        ],
      },
      {
        heading: "If it's damaged: use proper e-waste channels",
        paragraphs: [
          "Electronics contain both recoverable materials and hazardous substances. The Global E-waste Monitor tracks how much is discarded and how little is formally recycled — sound handling matters.",
          "Never put loose or swollen batteries in household waste or recycling: they are a known fire risk in collection vehicles and sorting facilities. Tape the terminals of loose batteries and take them to a designated battery or e-waste collection point.",
          "Do not attempt to open mains-powered devices or puncture batteries. If a device is swollen, hot or smells strange, keep it away from flammable materials and take it to a collection point as soon as you can.",
        ],
      },
    ],
    sources: [
      {
        title: "Global E-waste Monitor 2024",
        organization: "ITU / UNITAR",
        url: "https://www.itu.int/en/ITU-D/Environment/Pages/Publications/The-Global-E-Waste-Monitor-2024.aspx",
      },
      {
        title: "Recycling Basics and Benefits",
        organization: "US Environmental Protection Agency",
        url: "https://www.epa.gov/recycle/recycling-basics-and-benefits",
      },
    ],
  },
];

export function getArticle(slug: string) {
  return ARTICLES.find((a) => a.slug === slug);
}
