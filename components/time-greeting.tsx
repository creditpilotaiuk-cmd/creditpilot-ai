"use client";

import { useEffect, useState } from "react";

export function TimeGreeting({ firstName }: { firstName: string }) {
  const [greeting, setGreeting] = useState("Good morning");
  useEffect(() => {
    const update = () => {
      const hour = new Date().getHours();
      setGreeting(hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening");
    };
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return <h1 className="text-xl font-bold text-ink">{greeting}, {firstName}</h1>;
}
