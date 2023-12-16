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
  validateBlogImageUrl,
  validateBlogTitle,
  validateBlogVideoUrl,
} from '~/utils/validation';
import stylesHeaderUrl from '~/styles/blogs.css';

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: stylesHeaderUrl }];
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const userId = await getUserId(request);
  const blogId = url.searchParams.get('blogId');
  const blog = await db.blog.findUnique({
    where: { id: blogId! },
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

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const url = new URL(request.url);
  const blogId = url.searchParams.get('blogId');
  const form = await request.formData();
  const values = Object.fromEntries(form);
  const imageUrlsList = Object.entries(values)
    .filter(([key]) => key.startsWith('imageUrl_'))
    .map(([key, url]) => ({ id: key.replace('imageUrl_', ''), imageUrl: url }));
  const areAllImageUrlsValid =
    imageUrlsList.length ===
    Object.keys(values).filter(
      (key) => key.startsWith('imageUrl_') && typeof values[key] === 'string'
    ).length;
  const videoUrlsList = Object.entries(values)
    .filter(([key]) => key.startsWith('videoUrl_'))
    .map(([key, url]) => ({ id: key.replace('videoUrl_', ''), videoUrl: url }));
  const areAllVideoUrlsValid =
    videoUrlsList.length ===
    Object.keys(values).filter(
      (key) => key.startsWith('videoUrl_') && typeof values[key] === 'string'
    ).length;
  const content = form.get('content');
  const title = form.get('title');
  const author = form.get('author');
  if (
    typeof content !== 'string' ||
    typeof title !== 'string' ||
    typeof author !== 'string' ||
    !areAllImageUrlsValid ||
    !areAllVideoUrlsValid
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
    images: validateBlogImageUrl(imageUrlsList),
    videos: validateBlogVideoUrl(videoUrlsList),
  };
  const fields = { content, title, author };
  if (Object.values(fieldErrors).some(Boolean)) {
    console.log(123, fieldErrors);
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    });
  }
  const updatedImages: {
    where: { id: string };
    data: { imageUrl: string };
  }[] = imageUrlsList.map((image) => {
    return {
      where: {
        id: image.id,
      },
      data: {
        imageUrl: image.imageUrl,
      },
    };
  });
  const updatedVideos: {
    where: { id: string };
    data: { videoUrl: string };
  }[] = videoUrlsList.map((video) => {
    return {
      where: {
        id: video.id,
      },
      data: {
        videoUrl: video.videoUrl,
      },
    };
  });
  await db.blog.update({
    where: {
      id: blogId!,
    },
    data: {
      title: title,
      author: author,
      content: content,
      images: {
        update: updatedImages,
      },
      videos: {
        update: updatedVideos,
      },
    },
  });
  return redirect(`/blog/${blogId}`);
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
              className="p-2"
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
        <div className="flex flex-col gap-2">
          {data.blog.images.map((image: any, index: any) => {
            return (
              <div
                className="flex justify-center items-center gap-2"
                key={image.id}
              >
                <img width={120} src={image.imageUrl} />
                <div className="w-full">
                  <div>
                    imageUrl:{' '}
                    <input
                      defaultValue={image.imageUrl}
                      id={`imageUrl_${image.id}`}
                      name={`imageUrl_${image.id}`}
                      type="text"
                      aria-invalid={Boolean(actionData?.fieldErrors?.images)}
                      aria-errormessage={
                        actionData?.fieldErrors?.images
                          ? 'images-error'
                          : undefined
                      }
                    />
                  </div>
                  {actionData?.fieldErrors?.images &&
                  actionData?.fieldErrors?.images[index]?.errorImageUrl &&
                  actionData?.fieldErrors?.images[index]
                    ?.invalidImageUrlIndex === index ? (
                    <p
                      className="form-validation-error"
                      id="images-error"
                      role="alert"
                    >
                      {
                        actionData?.fieldErrors?.images[index]
                          ?.invalidImageErrorMessage
                      }
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col gap-2">
          {data.blog.videos.map((video: any, index: any) => {
            return (
              <div
                className="flex justify-center items-center gap-2"
                key={video.id}
              >
                videoUrl:{' '}
                <div className="w-full">
                  <input
                    defaultValue={video.videoUrl}
                    id={`videoUrl_${video.id}`}
                    name={`videoUrl_${video.id}`}
                    type="text"
                    aria-invalid={Boolean(actionData?.fieldErrors?.videos)}
                    aria-errormessage={
                      actionData?.fieldErrors?.videos
                        ? 'videos-error'
                        : undefined
                    }
                  />
                  {actionData?.fieldErrors?.videos &&
                  actionData?.fieldErrors?.videos[index]?.errorVideoUrl &&
                  actionData?.fieldErrors?.videos[index]
                    ?.invalidVideoUrlIndex === index ? (
                    <p
                      className="form-validation-error"
                      id="videos-error"
                      role="alert"
                    >
                      {
                        actionData?.fieldErrors?.videos[index]
                          ?.invalidVideoErrorMessage
                      }
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
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
  );
}
