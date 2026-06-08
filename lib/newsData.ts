export type NewsItem = {
  id: string;
  dateLabel: string;
  title: string;
  preview: string;
  article: string[];
  url?: string;
};

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: 'fbla-announces-2025-2026-collegiate-excellence-award-recipients',
    dateLabel: 'May 19',
    title: 'FBLA Announces 2025-2026 Collegiate Excellence Award Recipients',
    preview:
      'The FBLA Collegiate Excellence Award honors exceptional members committed to personal and professional growth.',
    url: 'https://www.fbla.org/fbla-announces-2025-2026-collegiate-excellence-award-recipients/',
    article: [
      'The FBLA Collegiate Excellence Award honors exceptional members who are committed to personal and professional growth through active involvement in FBLA programming and leadership opportunities.',
      'Open the full story on FBLA.org for complete recipient details and award context.',
    ],
  },
  {
    id: 'fbla-welcomes-over-60-exhibitors-to-nlc-in-san-antonio',
    dateLabel: 'May 11',
    title: 'FBLA Welcomes Over 60 Exhibitors to NLC in San Antonio',
    preview:
      'FBLA is preparing to welcome close to 20,000 attendees and over 60 exhibitors to the National Leadership Conference.',
    url: 'https://www.fbla.org/fbla-welcomes-over-60-exhibitors-to-nlc-in-san-antonio/',
    article: [
      'Future Business Leaders of America, Inc. is gearing up to welcome attendees and exhibitors to the National Leadership Conference in San Antonio.',
      'Open the full story on FBLA.org for the complete exhibitor overview.',
    ],
  },
  {
    id: 'check-out-these-booths-at-the-fbla-collegiate-nlc-in-las-vegas',
    dateLabel: 'May 7',
    title: 'Check Out These Booths at the FBLA Collegiate NLC in Las Vegas',
    preview:
      'FBLA highlights partners showcasing at the Collegiate National Leadership Conference in Las Vegas.',
    url: 'https://www.fbla.org/check-out-these-booths-at-the-fbla-collegiate-nlc-in-las-vegas/',
    article: [
      'The FBLA National Leadership Conference is the premier event of the year to grow, connect, and lead with students from around the country.',
      'Open the full story on FBLA.org for booth and partner details.',
    ],
  },
  {
    id: 'fbla-proudly-announces-the-winners-of-sifma-foundations-spring-2026-fbla-stock-market-game',
    dateLabel: 'May 6',
    title: 'FBLA Proudly Announces the Winners of SIFMA Foundation’s Spring 2026 FBLA Stock Market Game',
    preview:
      'FBLA recognizes outstanding student teams from the Spring 2026 Stock Market Game.',
    url: 'https://www.fbla.org/fbla-proudly-announces-the-winners-of-sifma-foundations-spring-2026-fbla-stock-market-game/',
    article: [
      'The SIFMA Foundation has provided FBLA students with the opportunity to participate in The Stock Market Game for more than 20 years.',
      'Open the full story on FBLA.org for winners and program details.',
    ],
  },
  {
    id: 'fbla-announces-the-2025-2026-winners-of-the-knowledge-matters-virtual-business-challenge',
    dateLabel: 'Apr 15',
    title: 'FBLA Announces the 2025-2026 Winners of the Knowledge Matters Virtual Business Challenge',
    preview:
      'FBLA recognizes members competing in online simulations for business and financial decision-making.',
    url: 'https://www.fbla.org/fbla-announces-the-2025-2026-winners-of-the-knowledge-matters-virtual-business-challenge/',
    article: [
      'FBLA partners with Knowledge Matters on the Virtual Business Challenge, an immersive online simulation program for members.',
      'Open the full story on FBLA.org for winners and challenge details.',
    ],
  },
];

const NEWSROOM_URL = 'https://www.fbla.org/newsroom/';
const POSTS_URL = 'https://www.fbla.org/wp-json/wp/v2/posts?per_page=7&_fields=date,slug,link,title,excerpt,content';
const FEED_URL = 'https://www.fbla.org/feed/';

const cleanText = (value = '') =>
  value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;|&#8212;/g, '-')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#038;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

const formatDateLabel = (date: string) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';

  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const slugFromUrl = (url: string) => url.replace(/^https?:\/\/www\.fbla\.org\//, '').replace(/\/$/, '');

const itemFromPost = (post: any): NewsItem | null => {
  const title = cleanText(post?.title?.rendered);
  const url = post?.link || (post?.slug ? `https://www.fbla.org/${post.slug}/` : '');
  if (!title || !url) return null;

  const paragraphs = cleanText(post?.content?.rendered)
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
    .slice(0, 4);

  return {
    id: post.slug || slugFromUrl(url),
    dateLabel: formatDateLabel(post.date),
    title,
    preview: cleanText(post?.excerpt?.rendered).slice(0, 180),
    article: paragraphs.length ? paragraphs : [cleanText(post?.excerpt?.rendered)],
    url,
  };
};

const parseFeed = (xml: string): NewsItem[] =>
  [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
    .slice(0, 7)
    .map((match) => {
      const item = match[1];
      const title = cleanText(item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title>([\s\S]*?)<\/title>/)?.[1] ?? item.match(/<title>([\s\S]*?)<\/title>/)?.[1]);
      const url = cleanText(item.match(/<link>([\s\S]*?)<\/link>/)?.[1]);
      const preview = cleanText(item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description>([\s\S]*?)<\/description>/)?.[1]);
      const date = cleanText(item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]);

      return title && url
        ? {
            id: slugFromUrl(url),
            dateLabel: formatDateLabel(date),
            title,
            preview,
            article: preview ? [preview] : ['Open the full story on FBLA.org for details.'],
            url,
          }
        : null;
    })
    .filter(Boolean) as NewsItem[];

const parseNewsroomHtml = (html: string): NewsItem[] => {
  const articleBlocks = html.split(/Read more/i).slice(0, 7);

  return articleBlocks
    .map((block) => {
      const title = cleanText(block.match(/<h[2-4][^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>|<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/i)?.[2]);
      const url = cleanText(block.match(/href="(https:\/\/www\.fbla\.org\/[^"]+)"/i)?.[1]);
      const date = cleanText(block.match(/([A-Z][a-z]+ \d{1,2}, \d{4})/)?.[1]);
      const preview = cleanText(block.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1]);

      return title && url
        ? {
            id: slugFromUrl(url),
            dateLabel: formatDateLabel(date),
            title,
            preview,
            article: preview ? [preview] : ['Open the full story on FBLA.org for details.'],
            url,
          }
        : null;
    })
    .filter(Boolean) as NewsItem[];
};

export const fetchLatestNewsItems = async (): Promise<NewsItem[]> => {
  const fetchJson = async () => {
    const response = await fetch(POSTS_URL);
    if (!response.ok) throw new Error('FBLA posts request failed');
    const posts = await response.json();
    const items = posts.map(itemFromPost).filter(Boolean);
    if (!items.length) throw new Error('FBLA posts response was empty');
    return items.slice(0, 7);
  };

  const fetchFeed = async () => {
    const response = await fetch(FEED_URL);
    if (!response.ok) throw new Error('FBLA feed request failed');
    const items = parseFeed(await response.text());
    if (!items.length) throw new Error('FBLA feed response was empty');
    return items;
  };

  const fetchNewsroom = async () => {
    const response = await fetch(NEWSROOM_URL);
    if (!response.ok) throw new Error('FBLA newsroom request failed');
    const items = parseNewsroomHtml(await response.text());
    if (!items.length) throw new Error('FBLA newsroom response was empty');
    return items;
  };

  for (const strategy of [fetchJson, fetchFeed, fetchNewsroom]) {
    try {
      return await strategy();
    } catch {
      // Try the next public FBLA source, then fall back to bundled seed articles.
    }
  }

  return NEWS_ITEMS;
};
