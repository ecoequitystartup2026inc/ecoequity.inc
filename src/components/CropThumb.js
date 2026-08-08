import React, { useState } from "react";

/* Crop name → real photo in /public. Matched by keyword against the crop's
   name, so harvests added later by an admin ("Okra", "Native Pechay", …) pick
   up a photo automatically without a data migration.

   Ordered most-specific first: "black rice" must win over "rice", and
   "mung bean" over "bean". */
const CROP_IMAGES = [
  ["black rice", "/black_rice.webp"],
  ["waling", "/walingwaling.webp"],
  ["mung bean", "/mungbean.webp"],
  ["mungbean", "/mungbean.webp"],
  ["malunggay", "/malunggay.webp"],
  ["lemongrass", "/lemongrass.webp"],
  ["sampaguita", "/sampaguita.webp"],
  ["sunflower", "/sunflower.webp"],
  ["calamansi", "/calamansi.webp"],
  ["gumamela", "/gumamela.webp"],
  ["eggplant", "/eggplant.webp"],
  ["oregano", "/oregano.webp"],
  ["tomato", "/tomato.webp"],
  ["carrot", "/carrot.webp"],
  ["labuyo", "/labuyo.webp"],
  ["pechay", "/pechay.webp"],
  ["pandan", "/pandan.webp"],
  ["basil", "/basil.webp"],
  ["adlai", "/adlai.webp"],
  ["mint", "/mint.webp"],
  ["okra", "/okra.webp"],
  ["rice", "/black_rice.webp"],
  ["ube", "/ube.webp"],
];

export function cropImage(name) {
  if (!name) return null;
  const n = String(name).toLowerCase();
  const hit = CROP_IMAGES.find(([kw]) => n.includes(kw));
  return hit ? hit[1] : null;
}

/* Renders the crop's photo when one exists, otherwise the caller's existing
   icon — so crops with no photo yet (mangoes, strawberries, corn) still read
   as part of the same grid instead of leaving a hole. */
export default function CropThumb({ name, fallback, rounded = "inherit", style }) {
  const [errored, setErrored] = useState(false);
  const src = cropImage(name);

  if (!src || errored) return fallback || null;

  return (
    <img
      src={src}
      alt={name || ""}
      loading="lazy"
      decoding="async"
      onError={() => setErrored(true)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
        borderRadius: rounded,
        ...style,
      }}
    />
  );
}
