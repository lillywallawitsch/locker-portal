import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface LocationMapProps {
  latitude: number
  longitude: number
  /** Pin icon image. Defaults to the locker pin in /public. */
  pinIconUrl?: string
  /** Pin icon dimensions in CSS pixels (preserve source aspect ratio). */
  pinIconSize?: [number, number]
  /** Pin icon anchor point — defaults to the icon centre so the pin sits
   *  visually centred in a card preview. Use the bottom-centre (e.g.
   *  [w/2, h]) when the design requires the tip to point at the coordinate. */
  pinIconAnchor?: [number, number]
  /** Map zoom level. */
  zoom?: number
  /** Optional click target — when set, a transparent overlay above the map
   *  navigates here on click (typically Google Maps for the same coords). */
  href?: string
  /** Card height — defaults to 160px (the Location card preview size). */
  className?: string
}

/**
 * Compact, non-interactive map preview using Carto Positron tiles via
 * Leaflet. Designed for the Location card on the Locker Detail page: pale
 * gray-scale road network, custom pin centred on the coordinate, optional
 * click-to-open external maps.
 *
 * The map is locked (no drag, zoom, or scroll-wheel) so the pin always
 * represents the precise locker location. Carto's free tile servers and OSM
 * data attribution requirements apply (Leaflet renders the credit in the
 * bottom-right corner of the tile).
 */
export default function LocationMap({
  latitude,
  longitude,
  pinIconUrl = '/avatars/locker-pin.png',
  pinIconSize = [56, 64],
  pinIconAnchor = [28, 32],
  zoom = 16,
  href,
  className = 'w-full h-40',
}: LocationMapProps) {
  const icon = L.icon({
    iconUrl: pinIconUrl,
    iconSize: pinIconSize,
    iconAnchor: pinIconAnchor,
  })
  return (
    <div className={`relative isolate rounded-xl overflow-hidden bg-surface-secondary ${className}`}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={zoom}
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        keyboard={false}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        <Marker position={[latitude, longitude]} icon={icon} />
      </MapContainer>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open external map"
          className="absolute inset-0 z-[1000] cursor-pointer"
        />
      )}
    </div>
  )
}
