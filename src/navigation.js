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
  socialLinks: [
    { text: 'Twitter', href: 'https://twitter.com/bsampera97' },
    { text: 'LinkedIn', href: 'https://linkedin.com/in/bernatsampera' },
    { text: 'GitHub', href: 'https://github.com/bernatsampera' },
  ],
};
