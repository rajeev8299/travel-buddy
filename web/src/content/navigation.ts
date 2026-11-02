// Main navigation (product/01-sitemap.md §1.2): the brief's 11 sections in
// 5 menus, plus search and the "Plan My Trip" button.

export interface NavLink {
  href: string;
  label: string;
  description?: string;
}

export interface NavGroup {
  label: string;
  links: NavLink[];
}

export const NAV: NavGroup[] = [
  {
    label: "Explore",
    links: [
      { href: "/explore", label: "Explore Varanasi", description: "History, names, faith and the river" },
      { href: "/places", label: "Places to Visit", description: "Temples, ghats, heritage, nearby" },
      { href: "/festivals", label: "Festivals & Culture", description: "Dev Deepawali, Mahashivratri, Holi…" },
      { href: "/food-and-shopping", label: "Food & Shopping", description: "Banarasi food, markets and silk" },
      { href: "/blog", label: "Blog", description: "Local tips, guides and stories" },
    ],
  },
  {
    label: "Things to Do",
    links: [
      { href: "/things-to-do", label: "Things to Do", description: "Boat rides, Aarti, walks, Sarnath" },
      { href: "/experiences", label: "Local Experiences", description: "Bookable with verified local partners" },
    ],
  },
  {
    label: "Plan",
    links: [
      { href: "/plan", label: "Plan Your Trip", description: "1, 2 and 3-day plans and the trip planner" },
      { href: "/travel-guide", label: "Travel Guide", description: "Getting here, safety, today's alerts" },
    ],
  },
  {
    label: "Services",
    links: [
      { href: "/services/transport", label: "Transport", description: "Airport, station, car hire" },
      { href: "/services/guides", label: "Guides & Tours", description: "Heritage, temple and Sarnath guides" },
      { href: "/services/river", label: "River Experiences", description: "Boat ride enquiries" },
      { href: "/services/assistance", label: "Travel Assistance", description: "Families, seniors, custom plans" },
    ],
  },
  {
    label: "About",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/about/how-we-verify", label: "How We Verify" },
      { href: "/about/partner-with-us", label: "Partner With Us" },
      { href: "/about/contact", label: "Contact" },
    ],
  },
];

export const FOOTER = {
  explore: [
    { href: "/explore", label: "Explore Varanasi" },
    { href: "/places/temples", label: "Temples" },
    { href: "/places/ghats", label: "Ghats" },
    { href: "/places/heritage", label: "Heritage & Sarnath" },
    { href: "/festivals", label: "Festivals" },
    { href: "/food-and-shopping", label: "Food & Shopping" },
    { href: "/blog", label: "Blog" },
  ],
  plan: [
    { href: "/plan/trip-planner", label: "Trip planner" },
    { href: "/plan/itineraries", label: "Ready-made itineraries" },
    { href: "/things-to-do", label: "Things to do" },
    { href: "/travel-guide/today", label: "Today in Varanasi" },
    { href: "/travel-guide/how-to-reach", label: "How to reach" },
    { href: "/travel-guide/emergency", label: "Emergency contacts" },
  ],
  services: [
    { href: "/services/transport", label: "Transport" },
    { href: "/services/guides", label: "Guides & tours" },
    { href: "/services/river", label: "Boat rides" },
    { href: "/services/assistance", label: "Travel assistance" },
    { href: "/enquiry", label: "Send an enquiry" },
  ],
  about: [
    { href: "/about", label: "About us" },
    { href: "/about/how-we-verify", label: "How we verify" },
    { href: "/about/service-standards", label: "Service standards" },
    { href: "/about/partner-with-us", label: "Partner with us" },
    { href: "/become-a-buddy", label: "Become a buddy" },
    { href: "/about/complaints", label: "Raise a complaint" },
    { href: "/about/contact", label: "Contact" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/cancellation-policy", label: "Cancellation policy" },
  ],
};
