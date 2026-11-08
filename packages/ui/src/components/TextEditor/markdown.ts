// Markdown highlighting without `markdown()`'s HTML tag completion, which pulls in lang-html, -css and -javascript
// (~68 KB gzipped). A static import here lets the bundler drop them; a namespace from import() can't be tree-shaken.
import { markdownLanguage } from '@codemirror/lang-markdown';
import { LanguageSupport } from '@codemirror/language';

export const markdown = () => new LanguageSupport(markdownLanguage);
