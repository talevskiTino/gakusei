import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, Link, Outlet, useLoaderData } from '@remix-run/react';

import { db } from '~/utils/db.server';
import { getUser } from '~/utils/session.server';

import stylesUrl from '~/styles/blogs.css';
export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesUrl },
];
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const blogsListItems = await db.blog.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, content: true, author: true },
    take: 3,
  });
  const user = await getUser(request);

  return json({ blogsListItems, user });
};

export default function Blogs() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="blogs-layout">
      <main className="blogs-main">
        <div className="container">
          <div className="blogs-list">
            <p>Here are a few blogs to check out:</p>
            {data.blogsListItems.map(({ id, title, content, author }) => (
              <div key={id}>
                <Link prefetch="intent" to={'/blog/' + id}>
                  <h3>{title}</h3>
                  <p>{content}</p>
                  <p>-{author}</p>
                </Link>
              </div>
            ))}
            <Link to="new" className="button">
              Add your own
            </Link>
          </div>
          <div className="blogs-outlet">
            <Outlet />
          </div>
        </div>
      </main>
      <footer className="blogs-footer">
        <div className="container">
          <Link reloadDocument to="/blogs.rss">
            RSS
          </Link>
        </div>
      </footer>
    </div>
  );
}
