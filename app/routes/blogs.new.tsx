import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import {
  Form,
  Link,
  isRouteErrorResponse,
  useActionData,
  useNavigation,
  useRouteError,
} from '@remix-run/react';
import { BlogDisplay } from '~/components/blog';

import { db } from '~/utils/db.server';
import { badRequest } from '~/utils/request.server';
import { getUserId, requireUserId } from '~/utils/session.server';
import {
  validateBlogAuthor,
  validateBlogContent,
  validateBlogTitle,
} from '~/utils/validation';

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);

  if (isRouteErrorResponse(error) && error.status === 401) {
    return (
      <div className="error-container">
        <p>You must be logged in to create a blog.</p>
        <Link to="/login">Login</Link>
      </div>
    );
  }

  return (
    <div className="error-container">
      Something unexpected went wrong. Sorry about that.
    </div>
  );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (!userId) {
    throw new Response('Unauthorized', { status: 401 });
  }
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const form = await request.formData();
  const values = Object.fromEntries(form);
  const content = form.get('content');
  const title = form.get('title');
  const author = form.get('author');
  if (
    typeof content !== 'string' ||
    typeof title !== 'string' ||
    typeof author !== 'string'
  ) {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: 'Form not submitted correctly.',
    });
  }

  const fieldErrors = {
    content: validateBlogContent(content),
    title: validateBlogTitle(title),
    author: validateBlogAuthor(author),
  };
  const fields = { content, title, author };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    });
  }

  await db.blog.create({
    data: { ...fields, userId: userId },
  });
  return redirect(`/blogs/new`);
};

export default function NewBlogRoute() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  if (navigation.formData) {
    const content = navigation.formData.get('content');
    const title = navigation.formData.get('title');
    const author = navigation.formData.get('author');
    if (
      typeof content === 'string' &&
      typeof title === 'string' &&
      typeof author === 'string' &&
      !validateBlogContent(content) &&
      !validateBlogTitle(title) &&
      !validateBlogAuthor(author)
    ) {
      return (
        <BlogDisplay
          canDelete={false}
          isOwner={true}
          blog={{ title, content, author }}
        />
      );
    }
  }
  return (
    <div>
      <p>Add your own blog</p>
      <Form method="post">
        <div>
          <label>
            Author:{' '}
            <input
              defaultValue={actionData?.fields?.author}
              name="author"
              type="text"
              aria-invalid={Boolean(actionData?.fieldErrors?.author)}
              aria-errormessage={
                actionData?.fieldErrors?.author ? 'author-error' : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.author ? (
            <p className="form-validation-error" id="author-error" role="alert">
              {actionData.fieldErrors.author}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            Title:{' '}
            <input
              defaultValue={actionData?.fields?.title}
              name="title"
              type="text"
              aria-invalid={Boolean(actionData?.fieldErrors?.title)}
              aria-errormessage={
                actionData?.fieldErrors?.title ? 'title-error' : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.title ? (
            <p className="form-validation-error" id="title-error" role="alert">
              {actionData.fieldErrors.title}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            Content:{' '}
            <textarea
              defaultValue={actionData?.fields?.content}
              name="content"
              aria-invalid={Boolean(actionData?.fieldErrors?.content)}
              aria-errormessage={
                actionData?.fieldErrors?.content ? 'content-error' : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.content ? (
            <p
              className="form-validation-error"
              id="content-error"
              role="alert"
            >
              {actionData.fieldErrors.content}
            </p>
          ) : null}
        </div>
        <div>
          {actionData?.formError ? (
            <p className="form-validation-error" role="alert">
              {actionData.formError}
            </p>
          ) : null}
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </Form>
    </div>
  );
}
