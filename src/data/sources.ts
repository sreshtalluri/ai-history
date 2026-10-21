import type { Source } from '../types';

export const wiki = (page: string, label = `Wikipedia: ${page.replace(/_/g, ' ')}`): Source => ({
  label,
  url: `https://en.wikipedia.org/wiki/${page}`,
});
