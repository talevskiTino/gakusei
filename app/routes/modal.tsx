import {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunction,
  json,
  redirect,
} from '@remix-run/node';
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
} from '@remix-run/react';
import { db } from '~/utils/db.server';
import { badRequest } from '~/utils/request.server';
import { getUserId } from '~/utils/session.server';
import {
  validateBlogAuthor,
  validateBlogContent,
  validateBlogTitle,
} from '~/utils/validation';

// export const links: LinksFunction = () => {
//   return [{ rel: 'stylesheet', href: dialogStyles }];
// };

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const userId = await getUserId(request);
  const blogId = url.searchParams.get('blogId');
  const blog = await db.blog.findUnique({
    where: { id: blogId! },
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

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const form = await request.formData();
  const url = new URL(request.url);
  const blogId = url.searchParams.get('blogId');
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
  await db.blog.update({
    where: {
      id: blogId!,
    },
    data: {
      title: title,
      author: author,
      content: content,
    },
  });
  return redirect(`/blogs`);
};

export default function Modal() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  let navigate = useNavigate();
  const close = () => navigate(-1);
  return (
    // <Dialog
    //   style={{ color: 'white', backgroundColor: '#333', position: 'relative' }}
    //   isOpen={true}
    //   onDismiss={close}
    // >
    <div className="modal">
      <span
        style={{
          position: 'absolute',
          right: '15px',
          top: '10px',
          cursor: 'pointer',
        }}
        onClick={close}
      >
        x
      </span>
      <Form method="post">
        <div>
          <label>
            Author:{' '}
            <input
              defaultValue={data?.blog?.author}
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
              defaultValue={data?.blog?.title}
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
              defaultValue={data?.blog?.content}
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
            Save
          </button>
        </div>
      </Form>
    </div>
    // </Dialog>
  );
}
