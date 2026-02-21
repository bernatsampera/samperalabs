import { getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'About',
      href: getPermalink('/about'),
    },
    {
      text: 'Blog',
      href: getPermalink('/blog'),
    },
  ],
};

export const footerData = {
  links: [
    { text: 'About', href: getPermalink('/about') },
    { text: 'Blog', href: getPermalink('/blog') },
  ],
};
