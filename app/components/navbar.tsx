import { LinksFunction, LoaderFunctionArgs, json } from '@remix-run/node';
import { Form, Link, useLoaderData } from '@remix-run/react';
import { getUser } from '~/utils/session.server';
import stylesUrl from '~/styles/blogs.css';
export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesUrl },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);

  return json({ user });
};

export default function Navbar({ user = null }: { user?: any }) {
  return (
    <header className="blogs-header">
      <div className="container">
        <h1 className="home-link">
          <Link to="/" title="Remix Blogs" aria-label="Remix Blogs">
            <div className="logo">🤔</div>
            <div className="logo-medium">BL🤔GS</div>
          </Link>
        </h1>
        {user ? (
          <div className="user-info">
            <span>{`Hi ${
              user.username.charAt(0).toUpperCase() + user.username.slice(1)
            }`}</span>
            <Form action="/logout" method="post">
              <button type="submit" className="button">
                Logout
              </button>
            </Form>
          </div>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </header>
  );
}
