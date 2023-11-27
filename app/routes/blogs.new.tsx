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

function validateBlogContent(content: string) {
  if (content.length < 10) {
    return 'That blog is too short';
  }
}

function validateBlogTitle(name: string) {
  if (name.length < 3) {
    return "That blog's title is too short";
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const form = await request.formData();
  const content = form.get('content');
  const title = form.get('title');
  if (typeof content !== 'string' || typeof title !== 'string') {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: 'Form not submitted correctly.',
    });
  }

  const fieldErrors = {
    content: validateBlogContent(content),
    title: validateBlogTitle(title),
  };
  const fields = { content, title };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    });
  }

  const blog = await db.blog.create({
    data: { ...fields, userId: userId },
  });
  return redirect(`/blogs/${blog.id}`);
};

export default function NewBlogRoute() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  if (navigation.formData) {
    const content = navigation.formData.get('content');
    const title = navigation.formData.get('title');
    if (
      typeof content === 'string' &&
      typeof title === 'string' &&
      !validateBlogContent(content) &&
      !validateBlogTitle(title)
    ) {
      return (
        <BlogDisplay
          canDelete={false}
          isOwner={true}
          blog={{ title, content }}
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
