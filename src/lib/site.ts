/**
 * Everything about the artist's own presence that isn't in the database, kept
 * in one place so it can be edited without hunting through components.
 */
export const SITE = {
  email: "vboyadzhieva@outlook.com",
  substack: "https://violettaboya.substack.com",
  /** Her portrait, used on the about page and the homepage welcome band. */
  portrait: "/villy1.webp",
};

export type SocialLink = {
  label: string;
  url: string;
};

export const SOCIAL_LINKS: SocialLink[] = [
  { label: "Instagram", url: "https://www.instagram.com/violettbo" },
  { label: "Substack", url: SITE.substack },
];
