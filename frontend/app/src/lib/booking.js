// The space to show as chosen: the client's choice if they made one; otherwise the first free space of the type.
export function resolveSpaceId({ spaces, type, spaceId, spaceChosen, free }) {
    const ofType = spaces.filter((space) => space.type === type);
    const current = ofType.find((space) => space.id === spaceId) ?? ofType[0];
    if (spaceChosen || !free || !current || free.has(current.id)) return current?.id ?? null;
    return (ofType.find((space) => free.has(space.id)) ?? current).id;
}

// A booking form's values after a change from BookingForm ({ type }, { spaceId }, { slot } or { userId }).
// Picking a space keeps it; changing the type starts again from a free space of that type.
export function applyBookingChange(current, changes) {
    return {
        ...current,
        ...changes,
        spaceChosen: 'spaceId' in changes ? true : 'type' in changes ? false : current.spaceChosen,
    };
}
