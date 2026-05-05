"use client";

import dynamic from "next/dynamic";

const LandingScene = dynamic(
  () => import("./LandingScene").then((m) => m.LandingScene),
  { ssr: false, loading: () => null }
);

export function LandingSceneMount() {
  return <LandingScene />;
}
