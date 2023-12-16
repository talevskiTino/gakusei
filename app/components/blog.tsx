import type { Blog } from '@prisma/client';
import { LinksFunction } from '@remix-run/node';
import { Form, Link } from '@remix-run/react';
import stylesheet from '~/tailwind.css';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheet },
];

interface BlogDisplayProps {
  canDelete?: boolean;
  isOwner: boolean;
  blog: {
    id: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    title: string;
    content: string;
    author: string;
    videos: { id: string; blogId: string; videoUrl: string }[];
    images: { id: string; blogId: string; imageUrl: string }[];
  };
}

export function BlogDisplay({
  canDelete = true,
  isOwner,
  blog,
}: BlogDisplayProps) {
  let videoId = blog.videos[0].videoUrl.split('/shorts/');
  if (!videoId) {
    videoId = blog.videos[0].videoUrl.split('/watch?v=');
  }
  return (
    <div className="blog-item custom-container">
      <h1>{blog.title}</h1>
      <img className="my-16" src={blog.images[0].imageUrl} />
      <p style={{ whiteSpace: 'break-spaces' }}>{blog.content}</p>
      <p className="mt-4">- {blog.author}</p>
      <div className="my-16" style={{ width: '100%', aspectRatio: '16 / 9' }}>
        <iframe
          style={{ width: '100%', height: '100%', aspectRatio: 'inherit' }}
          src={`https://www.youtube.com/embed/${videoId[1]}`}
          frameBorder={0}
          allow="autoplay; encrypted-media;"
        ></iframe>
      </div>
      {isOwner ? (
        <div className="blog-actions">
          <Form method="PUT">
            <button
              className="button"
              disabled={!canDelete}
              name="intent"
              type="submit"
              value="delete"
            >
              Delete
            </button>
          </Form>
          <Link className="button" to={`/modal?blogId=${blog?.id}`}>
            Edit
          </Link>
        </div>
      ) : null}
    </div>
  );
}
