const UNIT_TO_MS = {
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
};

export default function parseExpiry(expiresIn){
    if(!expiresIn) return null;
    const DURATION_REGEX = /^(\d+)([mhd])$/;
    const match = expiresIn.match(DURATION_REGEX);
    if (!match) {
      return null;
    }

    const value = Number(match[1]);
    const unit  = match[2];         

    const duration = value * UNIT_TO_MS[unit];

    const expiresAt = new Date(Date.now() + duration);
    return expiresAt;
}