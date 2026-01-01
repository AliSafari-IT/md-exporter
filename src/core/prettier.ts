import prettier from 'prettier';

export async function formatMarkdown(content: string): Promise<string> {
  try {
    return await prettier.format(content, {
      parser: 'markdown',
      proseWrap: 'preserve',
    });
  } catch (error) {
    console.warn('Prettier formatting failed, returning unformatted content');
    return content;
  }
}
