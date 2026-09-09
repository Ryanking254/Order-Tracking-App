import React from 'react';
import StylishMap from './StylishMap';

// Web-only entry. Metro resolves this file instead of LiveMap.js on web,
// so react-native-maps (native-only, no web support per Expo SDK 57 docs)
// is never loaded in the web bundle.
export default function LiveMap({
  markers = [],
  selectedId,
  onSelectPin,
}) {
  const pins = markers.map((m, i) => ({
    id: m.id,
    price: m.price || `$${i + 8}`,
    x: `${15 + ((i * 17) % 60)}%`,
    y: `${30 + ((i * 13) % 45)}%`,
  }));
  return <StylishMap pins={pins} selectedId={selectedId} onSelectPin={onSelectPin} />;
}
