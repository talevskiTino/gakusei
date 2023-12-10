import {
  json,
  type LinksFunction,
  type LoaderFunctionArgs,
  type MetaFunction,
} from '@remix-run/node';
import {
  Form,
  isRouteErrorResponse,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  useLoaderData,
  useRouteError,
} from '@remix-run/react';
import type { PropsWithChildren } from 'react';

import globalLargeStylesUrl from '~/styles/global-large.css';
import globalMediumStylesUrl from '~/styles/global-medium.css';
import globalStylesUrl from '~/styles/global.css';
import stylesUrl from '~/styles/blogs.css';
import stylesheet from '~/tailwind.css';
import { getUser } from './utils/session.server';
import Navbar from './components/navbar';
export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: globalStylesUrl },
  // { rel: 'stylesheet', href: stylesheet },
  {
    rel: 'stylesheet',
    href: globalMediumStylesUrl,
    media: 'print, (min-width: 640px)',
  },
  {
    rel: 'stylesheet',
    href: globalLargeStylesUrl,
    media: 'screen and (min-width: 1024px)',
  },
];

export const meta: MetaFunction = () => {
  const description = 'Learn Remix!';

  return [
    { name: 'description', content: description },
    { name: 'twitter:description', content: description },
    { title: 'Remix: So great!' },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  return json({ user });
};

function Document({ children, title }: PropsWithChildren<{ title?: string }>) {
  const data = useLoaderData<typeof loader>();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="Remix,blogs" />
        <meta
          name="twitter:image"
          content="https://p7.hiclipart.com/preview/402/978/370/marcus-aurelius-meditations-western-roman-empire-roman-emperor-stoicism-rome-digital.jpg"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@remix_run" />
        <meta name="twitter:site" content="@remix_run" />
        <meta name="twitter:title" content="Remix Blogs" />
        <Meta />
        {title ? <title>{title}</title> : null}
        <Links />
      </head>
      <body>
        <Navbar user={data.user} />
        {children}
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);

  if (isRouteErrorResponse(error)) {
    return (
      <Document title={`${error.status} ${error.statusText}`}>
        <div className="error-container">
          <h1>
            {error.status} {error.statusText}
          </h1>
        </div>
      </Document>
    );
  }

  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  return (
    <Document title="Uh-oh!">
      <div className="error-container">
        <h1>App Error</h1>
        <pre>{errorMessage}</pre>
      </div>
    </Document>
  );
}
