// Helpers for building shareable deeplink URLs.
//
// The active carrier always rides in the URL as `?carrier=<id>` so a link opens
// the correct org's data. Navigation that crosses contexts (nav clicks, org
// switch, opening a detail) starts a *clean* query carrying only the carrier —
// table view params (filters/sort/page/cols) belong to the list the user left.
// Round-trips back into a list restore those via `location.state.listSearch`.

/** `?carrier=<id>` — a clean query carrying only the active carrier. */
export function carrierSearch(carrierId: string): string {
  return `?carrier=${encodeURIComponent(carrierId)}`
}

/** Build `<path>?carrier=<id>` — drops any other params. */
export function pathWithCarrier(path: string, carrierId: string): string {
  return `${path}${carrierSearch(carrierId)}`
}
