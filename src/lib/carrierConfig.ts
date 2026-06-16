// Per-carrier UI terminology and field visibility. The portal runs one carrier
// at a time (see ?carrier= / useOrg().carrier), and a few labels/fields differ
// by market:
//   • GLS Spain & Portugal contract local agencies, so their "Depot" concept is
//     surfaced as "Agency" (single column + filter, relabelled — same data).
//   • Spain, Portugal & Italy don't expose an "Owned by" dimension.
//   • Austria doesn't expose "Host" or "Location" (venue type).
// Hidden dimensions are removed from columns AND filters so only data that
// exists for the carrier is shown.

const AGENCY_CARRIERS = new Set(['gls-es', 'gls-pt'])
const NO_OWNED_BY_CARRIERS = new Set(['gls-es', 'gls-pt', 'gls-it'])
const NO_HOST_CARRIERS = new Set(['gls-at'])
const NO_VENUE_TYPE_CARRIERS = new Set(['gls-at'])

/** The label for the single depot/agency column + filter. */
export function depotTerm(carrierId: string): 'Depot' | 'Agency' {
  return AGENCY_CARRIERS.has(carrierId) ? 'Agency' : 'Depot'
}

/** GLS Spain & Portugal contract local agencies, surfaced as a separate dimension. */
export function showAgency(carrierId: string): boolean {
  return AGENCY_CARRIERS.has(carrierId)
}

export function showOwnedBy(carrierId: string): boolean {
  return !NO_OWNED_BY_CARRIERS.has(carrierId)
}

export function showHost(carrierId: string): boolean {
  return !NO_HOST_CARRIERS.has(carrierId)
}

/** "Location" in the UI maps to the locker's venue type. */
export function showVenueType(carrierId: string): boolean {
  return !NO_VENUE_TYPE_CARRIERS.has(carrierId)
}
