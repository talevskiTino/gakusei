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
import { useState } from 'react';
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
  const content = form.get('content');
  const title = form.get('title');
  const author = form.get('author');
  const images = {
    create: form
      .getAll('images')
      .filter((imageUrl) => imageUrl !== '')
      .map((imageUrl) => ({
        imageUrl,
      })),
  };
  const videos = {
    create: form
      .getAll('videos')
      .filter((videoUrl) => videoUrl !== '')
      .map((videoUrl) => ({
        videoUrl,
      })),
  };
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
    images: null,
    videos: null,
  };
  const fields = { content, title, author, images, videos };
  console.log(123123, fields);
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    });
  }
  await db.blog.create({
    data: {
      ...fields,
      userId: userId,
    },
  });
  return redirect(`/blogs/new`);
};

export default function NewBlogRoute() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [imageInputs, setImageInputs] = useState(['']);
  const [videoInputs, setVideoInputs] = useState(['']);
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
  const createNewImageInputHandler = () => {
    if (imageInputs.every((input) => input !== '')) {
      setImageInputs((prevInputs) => [...prevInputs, '']);
    }
  };

  const handleImageInputChange = (index: any, value: any) => {
    const newInputs = [...imageInputs];
    newInputs[index] = value;
    setImageInputs(newInputs);
  };

  const createNewVideoInputHandler = () => {
    if (imageInputs.every((input) => input !== '')) {
      setVideoInputs((prevInputs) => [...prevInputs, '']);
    }
  };

  const handleVideoInputChange = (index: any, value: any) => {
    const newInputs = [...imageInputs];
    newInputs[index] = value;
    setVideoInputs(newInputs);
  };

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
          <label>
            Images:{' '}
            <div>
              {imageInputs.map((inputValue, index) => (
                <div key={index} className="flex gap-2 mb-3">
                  <input
                    name="images"
                    type="text"
                    value={inputValue}
                    onChange={(e) =>
                      handleImageInputChange(index, e.target.value)
                    }
                    aria-invalid={Boolean(actionData?.fieldErrors?.images)}
                    aria-errormessage={
                      actionData?.fieldErrors?.images
                        ? 'image-error'
                        : undefined
                    }
                  />
                  {index === imageInputs.length - 1 && ( // Show "+" button only for the last input
                    <span
                      onClick={createNewImageInputHandler}
                      className="button rounded-full flex items-center justify-center self-center w-8 h-8"
                    >
                      +
                    </span>
                  )}
                </div>
              ))}
            </div>
          </label>
          {actionData?.fieldErrors?.images ? (
            <p className="form-validation-error" id="image-error" role="alert">
              {actionData.fieldErrors.images}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            Videos:{' '}
            <div>
              {videoInputs.map((inputValue, index) => (
                <div key={index} className="flex gap-2 mb-3">
                  <input
                    name="videos"
                    type="text"
                    value={inputValue}
                    onChange={(e) =>
                      handleVideoInputChange(index, e.target.value)
                    }
                    aria-invalid={Boolean(actionData?.fieldErrors?.videos)}
                    aria-errormessage={
                      actionData?.fieldErrors?.videos
                        ? 'video-error'
                        : undefined
                    }
                  />
                  {index === videoInputs.length - 1 && ( // Show "+" button only for the last input
                    <span
                      onClick={createNewVideoInputHandler}
                      className="button rounded-full flex items-center justify-center self-center w-8 h-8"
                    >
                      +
                    </span>
                  )}
                </div>
              ))}
            </div>
          </label>
          {actionData?.fieldErrors?.videos ? (
            <p className="form-validation-error" id="video-error" role="alert">
              {actionData.fieldErrors.videos}
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
