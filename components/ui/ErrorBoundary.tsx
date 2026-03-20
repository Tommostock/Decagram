"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center"
          style={{ background: "#0a0a0a", color: "#e8e8e8" }}
        >
          <p className="text-4xl font-bold tracking-widest" style={{ color: "#f5c842" }}>
            DECAGRAM
          </p>
          <p className="text-lg font-semibold">Something went wrong</p>
          <p className="text-sm" style={{ color: "#888" }}>
            An unexpected error occurred. Please refresh to continue.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl font-bold text-sm"
            style={{
              background: "linear-gradient(180deg, #f5c842, #b8860b)",
              color: "#1a1a1a",
            }}
          >
            Refresh Game
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
