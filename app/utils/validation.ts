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
