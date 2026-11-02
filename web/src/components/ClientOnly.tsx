"use client";

import dynamic from "next/dynamic";

// Interactive tools that depend on device storage (saved trips, an attached
// plan) render in the browser only, so server and client output never differ.
// The pages around them — headings, intro copy — are still server-rendered.
export const TripPlannerClient = dynamic(() => import("./TripPlanner"), {
  ssr: false,
  loading: () => <p>Loading the planner…</p>,
});

export const EnquiryFormClient = dynamic(() => import("./EnquiryForm"), {
  ssr: false,
  loading: () => <p>Loading the form…</p>,
});

// The booking page reads its private link from the URL fragment, which only exists in the browser.
export const MyBookingClient = dynamic(() => import("./MyBooking"), {
  ssr: false,
  loading: () => <p>Loading your booking request…</p>,
});

// The buddy verification page reads its private link from the URL fragment.
export const BuddyVerificationClient = dynamic(() => import("./BuddyVerification"), {
  ssr: false,
  loading: () => <p>Loading…</p>,
});

export const BuddyApplicationClient = dynamic(() => import("./BuddyApplication"), {
  ssr: false,
  loading: () => <p>Loading the form…</p>,
});
