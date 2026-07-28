import React from "react";
import {
  Cherry, Leaf, Flower2, Wheat, Sprout, Shovel, Salad, Recycle, Package,
  Citrus, Carrot, Sun, Scissors, Trees, Droplet, Flame, Gift,
} from "lucide-react";

// Maps a stored icon NAME (string, safe to persist) to a React element.
// This is the database-safe version of the old `emoji: <Cherry .../>` fields.
// Reuses the same lesson as hydrateIcons: never store JSX, only the name.
const ICONS = { Cherry, Leaf, Flower2, Wheat, Sprout, Salad, Recycle, Package, Shovel, Citrus, Carrot, Sun, Scissors, Trees, Droplet, Flame, Gift };

const DEFAULT_COLOR = "#16a34a";

export function iconElement(name, color = DEFAULT_COLOR, size = "1em") {
  const Cmp = ICONS[name] || Sprout;
  return <Cmp size={size} color={color} />;
}

// The reverse: given a React element from the seed data, recover its name so we
// can seed the database from initialProducts.
export function iconName(el) {
  if (!React.isValidElement(el)) return null;
  const match = Object.entries(ICONS).find(([, Cmp]) => Cmp === el.type);
  return match ? match[0] : null;
}
