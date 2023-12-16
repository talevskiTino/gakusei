import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import {
  isRouteErrorResponse,
  useLoaderData,
  useParams,
  useRouteError,
} from '@remix-run/react';
import { BlogDisplay } from '~/components/blog';

import { db } from '~/utils/db.server';
import { getUserId, requireUserId } from '~/utils/session.server';
import stylesUrl from '~/styles/blogs.css';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesUrl },
];

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const { description, title } = data
    ? {
        description: `Enjoy the "${data.blog.title}" blog and much more`,
        title: `"${data.blog.title}"`,
      }
    : { description: 'No blog found', title: 'No blog' };

  return [
    { name: 'description', content: description },
    { name: 'twitter:description', content: description },
    { title },
  ];
};

export function ErrorBoundary() {
  const { blogId } = useParams();

  const error = useRouteError();
  console.error(error);

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div className="error-container">Huh? What the heck is "{blogId}"?</div>
    );
  }
  return (
    <div className="error-container">
      There was an error loading blog by the id "${blogId}". Sorry.
    </div>
  );
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  const blog = await db.blog.findUnique({
    where: { id: params.blogId },
    include: {
      images: true,
      videos: true,
    },
  });
  if (!blog) {
    throw new Response('OMG!!! Blog Not found.', {
      status: 404,
    });
  }
  return json({
    isOwner: userId === blog.userId,
    blog,
  });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const form = await request.formData();
  if (form.get('intent') !== 'delete' && form.get('intent') !== 'edit') {
    throw new Response(`The intent ${form.get('intent')} is not supported`, {
      status: 400,
    });
  }
  const userId = await requireUserId(request);
  const blog = await db.blog.findUnique({
    where: { id: params.blogId },
  });
  if (!blog) {
    throw new Response("Can't delete/edit what does not exist", {
      status: 404,
    });
  }
  if (blog.userId !== userId) {
    throw new Response("Pssh, nice try. That's not your blog", { status: 403 });
  }
  if (form.get('intent') === 'delete') {
    await db.blog.delete({ where: { id: params.blogId } });
  }
  return redirect('/blogs');
};

export default function BlogRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="custom-container blog">
      <BlogDisplay
        isOwner={data.isOwner}
        blog={{
          ...data.blog,
        }}
      />
    </div>
  );
}
