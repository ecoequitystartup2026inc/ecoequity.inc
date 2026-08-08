import React from "react";

// The last line before a white screen.
//
// App.js renders the entire site from one component tree, so an exception
// anywhere — a page, a modal, the admin portal — unmounts everything and React
// leaves the user staring at an empty <div id="root">. No message, no back
// button, nothing in the UI saying it broke. This catches that and puts a
// recoverable screen there instead.
//
// It deliberately does NOT try to render the site's chrome. Whatever just threw
// is somewhere in that chrome, so re-entering it risks throwing again inside
// the handler. Plain markup with literal colours only: no CSS variables, since
// the theme ramp is applied by App.js and App.js is what just died.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Keep the component stack — it is the only thing that says WHICH of the
    // ~69k lines threw, and it is gone once the user reloads.
    console.error("Unhandled render error:", error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        role="alert"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "#f0fdf5",
          fontFamily: "Poppins, system-ui, sans-serif",
          color: "#14532d",
          boxSizing: "border-box",
        }}
      >
        <div style={{ maxWidth: "480px", textAlign: "center" }}>
          <div style={{ fontSize: "44px", lineHeight: 1, marginBottom: "18px" }} aria-hidden="true">
            🌱
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 10px" }}>
            Something went wrong on our end
          </h1>
          <p style={{ fontSize: "14px", lineHeight: 1.6, margin: "0 0 22px", color: "#3f6212" }}>
            This page hit an unexpected error. Reloading usually clears it — your
            account and saved data are untouched.
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 26px",
              borderRadius: "999px",
              border: "none",
              background: "#15803d",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            Reload the page
          </button>

          {/* The message is shown in development only. In production it can
              carry internal detail (table names, ids) that a visitor should
              not read, and cannot act on anyway. */}
          {process.env.NODE_ENV === "development" && (
            <pre
              style={{
                marginTop: "24px",
                padding: "14px",
                borderRadius: "10px",
                background: "rgba(0,0,0,0.05)",
                color: "#7f1d1d",
                fontSize: "12px",
                textAlign: "left",
                whiteSpace: "pre-wrap",
                overflowX: "auto",
              }}
            >
              {String(this.state.error?.stack || this.state.error)}
            </pre>
          )}
        </div>
      </div>
    );
  }
}
