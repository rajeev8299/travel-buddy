import type { ServiceCategory, ServiceItem } from "./types";

// Travel Services — enquiry-based (no checkout in the MVP, Requirements §3).
// Provider status is shown honestly: "pending" until partners are onboarded
// and verified (FR-PART). Estimates stay null ("Quoted on enquiry") until a
// verified price exists. Response expectations follow service standards S1–S2.

const S1 = "A person replies within 10 minutes, 6am–10pm IST (overnight enquiries by 7am)";
const S1_S2 = `${S1}; a confirmed partner with name, meeting point and price within 2 hours (30 minutes for same-day requests)`;

const item = (i: Omit<ServiceItem, "estimate" | "partnerStatus" | "responseExpectation"> & Partial<ServiceItem>): ServiceItem => ({
  estimate: null,
  partnerStatus: "pending",
  responseExpectation: S1_S2,
  ...i,
});

export const SERVICES: ServiceCategory[] = [
  {
    slug: "transport",
    title: "Local transport",
    summary: "Airport and station transfers, car hire and sightseeing transport, arranged with checked drivers.",
    image: { src: "/img/varanasi.jpg", alt: "A clear day on the Varanasi riverfront" },
    items: [
      item({
        slug: "airport-transfer",
        title: "Airport transfer",
        summary: "Pickup or drop between Lal Bahadur Shastri International Airport and your hotel, with the driver's details before you land.",
        coverage: "Varanasi airport (Babatpur) ↔ hotels across Varanasi; Sarnath on request",
        includes: ["Driver's name, phone and vehicle number shared in advance", "Flight tracking for delays when you share your flight number", "Drop at the nearest point a car can reach your hotel"],
        limitations: ["Cars can't enter the narrow lanes near the ghats — the last stretch is on foot", "Waiting time beyond the agreed limit may cost extra; confirmed in your quote"],
      }),
      item({
        slug: "railway-transfer",
        title: "Railway station transfer",
        summary: "Pickup or drop at Varanasi Junction, Banaras or Pt. Deen Dayal Upadhyaya Junction — including late-night trains.",
        coverage: "Varanasi Junction, Banaras and Pt. Deen Dayal Upadhyaya Junction ↔ hotels in Varanasi",
        includes: ["Driver meets you at an agreed point outside the station", "Driver's details shared in advance", "Help to the nearest drop-off point for your hotel"],
        limitations: ["Train delays are common; long waits may be charged as agreed in your quote", "Cars can't reach hotels inside the old-city lanes"],
      }),
      item({
        slug: "car-hire",
        title: "Car hire with driver",
        summary: "A car and driver for half a day or a full day — for temples across the city, Sarnath, Ramnagar or shopping.",
        coverage: "Within Varanasi and nearby sites such as Sarnath and Ramnagar",
        includes: ["Air-conditioned car with a checked driver", "Flexible stops within the agreed hours and area"],
        limitations: ["Parking and vehicle restrictions near the ghats and Kashi Vishwanath mean walking between some stops", "Tolls, parking fees and extra hours as set out in your quote"],
      }),
      item({
        slug: "sightseeing",
        title: "City sightseeing transport",
        summary: "Transport planned around your itinerary, with the driver briefed on where to drop and collect you.",
        coverage: "Varanasi city, Sarnath and Ramnagar",
        includes: ["Route planned around realistic drop-off points", "Pickup timed to your temple, ghat or museum visits"],
        limitations: ["Guiding is not included — add a guide separately", "Road closures on festival days can change the route"],
      }),
      item({
        slug: "outstation",
        title: "Outstation travel",
        summary: "Car and driver for day trips and intercity journeys — Chunar, Vindhyachal, Prayagraj, Bodh Gaya, Ayodhya.",
        coverage: "Intercity routes from Varanasi; return or one-way",
        includes: ["Checked driver and vehicle", "Route and stop plan agreed in advance"],
        limitations: ["Driver allowance, tolls, state permits and parking as set out in your quote", "Long drives are tiring — we may recommend an overnight stop"],
      }),
    ],
  },
  {
    slug: "guides",
    title: "Guides & tours",
    summary: "Local guides for the old city, temples and Sarnath — people who grew up here, checked before they work with us.",
    image: { src: "/img/ganga_aarti.jpg", alt: "Priests performing the Ganga Aarti with raised brass lamps at night" },
    items: [
      item({
        slug: "heritage-guides",
        title: "Heritage guides",
        summary: "A guide to the history, architecture and stories of the old city and the ghats, at your pace.",
        coverage: "Old city, the ghats and Ramnagar",
        includes: ["A guide who speaks your language (subject to availability)", "Route shaped around your interests and walking comfort"],
        limitations: ["Entry tickets, boat fares and food are not included unless stated in your quote", "Temple interiors follow each temple's own rules"],
      }),
      item({
        slug: "temple-tours",
        title: "Temple tours",
        summary: "Visit Kashi Vishwanath and the city's other great temples with someone who knows the queues, the rules and the rituals.",
        coverage: "Kashi Vishwanath, Sankat Mochan, Durga Kund, Kaal Bhairav, New Vishwanath (BHU) and others",
        includes: ["Help with current entry rules, lockers and queues", "Explanation of rituals and etiquette"],
        limitations: ["Guides cannot guarantee queue times or special darshan", "Rules on phones, bags and entry are set by each temple and may change"],
      }),
      item({
        slug: "sarnath-guides",
        title: "Sarnath guides",
        summary: "A guide for the Dhamek Stupa, the excavated monasteries, the museum and the temples built by Buddhist countries.",
        coverage: "Sarnath archaeological complex, museum and temples",
        includes: ["Guide for the archaeological site and temples", "Combine with transport on request"],
        limitations: ["ASI entry tickets are paid at the site", "The museum has its own closing day — we plan around it"],
      }),
      item({
        slug: "walking-tours",
        title: "Cultural walking tours",
        summary: "Small-group or private walks through the lanes — food, crafts, music or the ghats at dawn.",
        coverage: "Old city lanes, ghats, Madanpura and the bazaars",
        includes: ["Planned route with rest stops", "Small groups or private walks"],
        limitations: ["Food tastings are paid separately unless included in your quote", "Walks involve steps and uneven lanes"],
      }),
      item({
        slug: "private-group-tours",
        title: "Private group tours",
        summary: "Guided days for families, friends, schools and pilgrimage groups, with transport and pacing to match.",
        coverage: "Varanasi, Sarnath and Ramnagar; nearby destinations on request",
        includes: ["One coordinator for the group", "Guide, transport and boat arranged together"],
        limitations: ["Large groups may need more than one guide", "Festival days need early booking"],
      }),
    ],
  },
  {
    slug: "river",
    title: "River experiences",
    summary: "Boat rides along the ghats at sunrise, sunset and during the Ganga Aarti, with agreed prices and safety basics.",
    image: { src: "/img/boats.jpg", alt: "Wooden boats on the Ganga" },
    items: [
      item({
        slug: "boat-rides",
        title: "Boat ride enquiries",
        summary: "Sunrise, sunset or Aarti boat rides — tell us when and how many, and we confirm a boat with an agreed price.",
        coverage: "Main ghats from Assi to Panchganga; Aarti viewing at Dashashwamedh",
        includes: ["Route, duration and price agreed before you board", "Boatman who knows the ghats"],
        limitations: ["Boating is suspended when the river is in flood — you get a new date, an alternative or a full refund", "Life jackets: ask for one and wear it"],
      }),
      item({
        slug: "private-boats",
        title: "Private boats",
        summary: "A rowing or motor boat just for your group — for photography, quiet sunrise or Aarti viewing.",
        coverage: "Riverfront from Assi to the northern ghats",
        includes: ["Boat for your group only", "Timing and route to suit you"],
        limitations: ["Motor and rowing boats differ in speed and comfort — choose in your enquiry", "Festival nights book out early"],
      }),
      item({
        slug: "group-boats",
        title: "Group (shared) boats",
        summary: "A seat on a shared boat — an affordable way to see the ghats or the Aarti from the water.",
        coverage: "Main ghats; Aarti viewing at Dashashwamedh",
        includes: ["Seat on a shared boat at an agreed time"],
        limitations: ["Fixed route and timing", "Can be crowded on busy evenings"],
      }),
    ],
  },
  {
    slug: "stays",
    title: "Accommodation referrals",
    summary: "Hotels, homestays and guesthouses we know — near the ghats or quieter parts of the city, matched to your needs.",
    image: { src: "/img/riverfront.jpg", alt: "Buildings along the Varanasi riverfront" },
    items: [
      item({
        slug: "hotels",
        title: "Hotels",
        summary: "Hotels from simple to premium, with honest notes on access, noise and the walk from the road.",
        coverage: "Across Varanasi, including ghat-side and city locations",
        includes: ["Shortlist matched to your budget and needs", "Honest notes on vehicle access and stairs"],
        limitations: ["You book and pay the hotel directly; we refer, we don't hold your money", "Availability is confirmed by the hotel"],
        responseExpectation: S1,
      }),
      item({
        slug: "homestays",
        title: "Homestays",
        summary: "Stay with a Varanasi family — home-cooked food and local insight.",
        coverage: "Residential neighbourhoods across the city",
        includes: ["Homestays we have visited (status shown per host)", "Notes on house rules and meals"],
        limitations: ["Facilities vary more than in hotels", "You book and pay the host directly"],
        responseExpectation: S1,
      }),
      item({
        slug: "guesthouses",
        title: "Guesthouses",
        summary: "Budget-friendly guesthouses near the ghats and in the old city.",
        coverage: "Ghats and old city",
        includes: ["Shortlist matched to your budget", "Notes on access and stairs"],
        limitations: ["Rooms can be small and lanes noisy", "You book and pay the guesthouse directly"],
        responseExpectation: S1,
      }),
      item({
        slug: "family-stays",
        title: "Family stays",
        summary: "Stays that suit children and older relatives — easier access, lifts where possible, and space.",
        coverage: "Across Varanasi",
        includes: ["Stays shortlisted for step-free or easier access where available", "Advice on nearby transport"],
        limitations: ["Truly step-free options near the ghats are rare", "You book and pay the property directly"],
        responseExpectation: S1,
      }),
    ],
  },
  {
    slug: "assistance",
    title: "Travel assistance",
    summary: "Help planning a trip that fits you — custom itineraries, family and senior-friendly plans, pilgrim groups and access needs.",
    image: { src: "/img/varanasi.jpg", alt: "Stone ghat steps beside the Ganga in Varanasi" },
    items: [
      item({
        slug: "custom-itinerary",
        title: "Custom itinerary planning",
        summary: "Tell us your dates, interests and pace — we draft a realistic day-by-day plan and arrange what you need.",
        coverage: "Varanasi, Sarnath and nearby destinations",
        includes: ["A written plan with timings, walking and transport", "Bookings arranged on request with verified partners"],
        limitations: ["Timings are suggestions; temple and festival rules can change on the day", "Plans don't account for live crowds unless we tell you so"],
      }),
      item({
        slug: "families",
        title: "Family travel assistance",
        summary: "Plans that work for children — shorter outings, safer boats, rest breaks and kid-friendly food.",
        coverage: "Varanasi and Sarnath",
        includes: ["Family-paced plan", "Boats and guides suited to children"],
        limitations: ["Crowded festival days are hard with small children — we'll tell you honestly"],
      }),
      item({
        slug: "senior-friendly",
        title: "Senior-friendly trip planning",
        summary: "Low-walking routes, easier ghats, Aarti from a boat and helpers for the last stretch.",
        coverage: "Varanasi and Sarnath",
        includes: ["Plan with walking kept low and breaks built in", "Transport to the closest drop-off points", "Helpers or porters arranged where available"],
        limitations: ["Many ghats and temples involve steep steps", "Wheelchair access is limited — we'll say what is realistic"],
      }),
      item({
        slug: "group-pilgrimage",
        title: "Group pilgrimage coordination",
        summary: "Coordination for pilgrim groups — temple visits, Ganga snan, Aarti, transport and stays.",
        coverage: "Varanasi temples and ghats; nearby pilgrimage sites on request",
        includes: ["One coordinator for the group", "Transport, guides and boats arranged together"],
        limitations: ["Temple entry and darshan arrangements follow each temple's rules", "Festival periods need early planning"],
      }),
      item({
        slug: "accessibility",
        title: "Accessibility assistance",
        summary: "Planning help for travellers with limited mobility, vision or hearing needs — with honest advice on what is possible.",
        coverage: "Varanasi and Sarnath",
        includes: ["Honest advice based on what we have checked", "Transport and helpers arranged where available"],
        limitations: ["Step-free access is very limited at most ghats and old-city temples", "We only promise access we have verified"],
      }),
    ],
  },
];
