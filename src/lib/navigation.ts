export type NavLink = {
  href: string;
  label: { es: string; en: string };
};

/** Primary nav — order matches the Figma Navbar frame (6033:163). */
export const NAV_LINKS: NavLink[] = [
  { href: "/work", label: { es: "Work", en: "Work" } },
  { href: "/about", label: { es: "About Us", en: "About Us" } },
  { href: "/team", label: { es: "The Team", en: "The Team" } },
  { href: "/contact", label: { es: "Contact Us", en: "Contact Us" } },
];
