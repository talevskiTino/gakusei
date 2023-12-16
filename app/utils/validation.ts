export function validateBlogContent(content: string) {
  if (content.length < 10) {
    return 'That blog is too short';
  }
}

export function validateBlogTitle(title: string) {
  if (title.length < 3) {
    return "That blog's title is too short";
  }
}

export function validateBlogAuthor(author: string) {
  if (author.length < 3) {
    return "That blog's author name is too short";
  }
}

export function validateBlogImageUrl(images: Array<any>) {
  const invalidImages: any[] = [];

  images.forEach((image, index) => {
    if (image.imageUrl.length < 10) {
      invalidImages.push({
        errorImageUrl: true,
        invalidImageErrorMessage: 'Invalid url for image',
        invalidImageUrlIndex: index,
      });
    } else {
      invalidImages.push({
        errorImageUrl: false,
        invalidImageUrlIndex: index,
      });
    }
  });

  return invalidImages.length > 0 ? invalidImages : null;
}

export function validateBlogVideoUrl(videos: Array<any>) {
  const invalidVideos: any[] = [];

  videos.forEach((video, index) => {
    if (video.videoUrl.length < 10 || !video.videoUrl.includes('youtube')) {
      invalidVideos.push({
        errorVideoUrl: true,
        invalidVideoErrorMessage: 'Invalid url for youtube video',
        invalidVideoUrlIndex: index,
      });
    } else {
      invalidVideos.push({
        errorVideoUrl: false,
        invalidVideoUrlIndex: index,
      });
    }
  });

  return invalidVideos.length > 0 ? invalidVideos : null;
}
