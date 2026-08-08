import React, { lazy, Suspense } from "react";

// Splits a page out of the main bundle.
//
// Every page used to be a static import in App.js, so all ~35,000 lines of them
// were concatenated into one main.js — 2.2 MB, downloaded before anything could
// render. A visitor reading the landing page was paying for the admin portal,
// the checkout, the surplus marketplace and twenty pages they may never open.
//
// `lazy` alone is not enough: a suspending component with no boundary above it
// crashes. Rather than thread <Suspense> through App.js's render — where pages
// are scattered across several containers, some inside mobile-only branches —
// each page carries its own boundary here. The call sites stay exactly as they
// were: `<AboutUs />` still works, it just arrives over the network.
//
// Usage:  const AboutUs = lazyPage(() => import("./pages/AboutUs"));
//
// Only for pages with a default export and no named exports that App.js reads.
// Importing a named export pulls the whole module into the main bundle anyway,
// which silently undoes the split — see the seed-data pages still imported
// statically in App.js.
export default function lazyPage(loader) {
  const Page = lazy(loader);

  // Called once per page at module scope, so this component type is stable
  // across renders — defining it inside a render would remount the page on
  // every parent update.
  const Lazy = (props) => (
    <Suspense fallback={<PageLoading />}>
      <Page {...props} />
    </Suspense>
  );

  return Lazy;
}

// Shown while a page's chunk downloads — typically a few hundred milliseconds
// on first visit to that page, and nothing at all afterwards (the chunk is
// cached). Deliberately quiet: a spinner that flashes for 200ms reads as jank,
// so this is a still, centred mark that matches the sage palette.
function PageLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        width: "100%",
      }}
    >
      <span
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "50%",
          border: "3px solid rgba(var(--eco-c9-rgb), 0.25)",
          borderTopColor: "var(--eco-c11)",
          // The one animation here is a transform on a 34px element with no
          // blur and no backdrop-filter, so it does not drag the frame rate
          // down the way an animating glass layer would.
          animation: "lazy-page-spin 0.7s linear infinite",
        }}
      />
      <span
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap",
        }}
      >
        Loading page
      </span>
    </div>
  );
}
