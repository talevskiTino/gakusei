import type { LinksFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import stylesUrl from '~/styles/index.css';
import stylesBlogsUrl from '~/styles/blogs.css';
export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesUrl },
  { rel: 'stylesheet', href: stylesBlogsUrl },
];

export default function IndexRoute() {
  return (
    <div className="container">
      <div className="content">
        <h1>
          Stoic <span>Blogs!</span>
        </h1>
        <nav>
          <ul>
            <li>
              <Link to="blogs">Read some, learn some..</Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
