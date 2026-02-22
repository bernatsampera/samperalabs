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
    {
      text: 'References',
      href: getPermalink('/references'),
    },
  ],
};

export const footerData = {
  links: [
    { text: 'About', href: getPermalink('/about') },
    { text: 'Blog', href: getPermalink('/blog') },
    { text: 'References', href: getPermalink('/references') },
  ],
};
