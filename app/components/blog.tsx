import type { Blog } from '@prisma/client';
import { Form, Link } from '@remix-run/react';

export function BlogDisplay({
  canDelete = true,
  isOwner,
  blog,
}: {
  canDelete?: boolean;
  isOwner: boolean;
  blog: Pick<Blog, 'content' | 'title' | 'author'>;
}) {
  return (
    <div>
      <p>{blog.author}:</p>
      <p>{blog.content}</p>
      <Link to=".">"{blog.title}" Permalink</Link>
      {isOwner ? (
        <Form method="post">
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
      ) : null}
    </div>
  );
}
