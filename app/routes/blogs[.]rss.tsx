import type { LoaderFunctionArgs } from '@remix-run/node';

import { db } from '~/utils/db.server';

function escapeCdata(s: string) {
  return s.replace(/\]\]>/g, ']]]]><![CDATA[>');
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const blogs = await db.blog.findMany({
    include: { user: { select: { username: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const host =
    request.headers.get('X-Forwarded-Host') ?? request.headers.get('host');
  if (!host) {
    throw new Error('Could not determine domain URL.');
  }
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const domain = `${protocol}://${host}`;
  const blogsUrl = `${domain}/blogs`;

  const rssString = `
    <rss xmlns:blogChannel="${blogsUrl}" version="2.0">
      <channel>
        <title>Remix Blogs</title>
        <link>${blogsUrl}</link>
        <description>Some blogs</description>
        <language>en-us</language>
        <generator>T</generator>
        <ttl>40</ttl>
        ${blogs
          .map((blog) =>
            `
            <item>
              <title><![CDATA[${escapeCdata(blog.title)}]]></title>
              <description><![CDATA[A funny blog called ${escapeHtml(
                blog.title
              )}]]></description>
              <author><![CDATA[${escapeCdata(blog.user.username)}]]></author>
              <pubDate>${blog.createdAt.toUTCString()}</pubDate>
              <link>${blogsUrl}/${blog.id}</link>
              <guid>${blogsUrl}/${blog.id}</guid>
            </item>
          `.trim()
          )
          .join('\n')}
      </channel>
    </rss>
  `.trim();

  return new Response(rssString, {
    headers: {
      'Cache-Control': `public, max-age=${60 * 10}, s-maxage=${60 * 60 * 24}`,
      'Content-Type': 'application/xml',
      'Content-Length': String(Buffer.byteLength(rssString)),
    },
  });
};
