import type { Blog } from '@prisma/client';
import { Form, Link } from '@remix-run/react';

export function BlogDisplay({
  canDelete = true,
  isOwner,
  blog,
}: {
  canDelete?: boolean;
  isOwner: boolean;
  blog: Pick<Blog, 'content' | 'title' | 'author' | 'id'>;
}) {
  return (
    <div className="blog-item">
      <h1>{blog.title}</h1>
      <p>{blog.content}</p>
      <p>- {blog.author}</p>
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
