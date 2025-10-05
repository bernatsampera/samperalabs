import { getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Home',
      href: getPermalink('/'),
    },
    {
      text: 'Projects',
      href: getPermalink('/#projects'),
    },
    {
      text: 'Skills',
      href: getPermalink('/skills'),
    },
    {
      text: 'Experience',
      href: getPermalink('/experience'),
    },
    {
      text: 'Blog',
      href: getPermalink('/blog'),
    },
    {
      text: 'About',
      href: getPermalink('/#about'),
    },
    {
      text: 'Contact',
      href: getPermalink('/contact'),
    },
  ],
};

export const footerData = {
  links: [
    { text: 'Projects', href: getPermalink('/#projects') },
    { text: 'About', href: getPermalink('/#about') },
    { text: 'Contact', href: getPermalink('/contact') },
    { text: 'Terms', href: getPermalink('/terms') },
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
  ],

};
