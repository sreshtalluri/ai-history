import type { Source } from '../types';

export const arxiv = (id: string, label = `arXiv:${id}`): Source => ({
  label,
  url: `https://arxiv.org/abs/${id}`,
});

export const wiki = (page: string, label = `Wikipedia: ${page.replace(/_/g, ' ')}`): Source => ({
  label,
  url: `https://en.wikipedia.org/wiki/${page}`,
});
