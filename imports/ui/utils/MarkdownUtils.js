import {parseMarkdown} from 'meteor/themeteorchef:commonmark';

export default MarkdownUtils = {
  markdownToHTML(content) {
    if ( content ) {
      return { __html: parseMarkdown(content) };
    }
  }
}
