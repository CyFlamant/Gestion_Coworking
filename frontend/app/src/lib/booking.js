// The space to show as chosen: the client's choice if they made one; otherwise the first free space of the type.
export function resolveSpaceId({ spaces, type, spaceId, spaceChosen, free }) {
    const ofType = spaces.filter((space) => space.type === type);
    const current = ofType.find((space) => space.id === spaceId) ?? ofType[0];
    if (spaceChosen || !free || !current || free.has(current.id)) return current?.id ?? null;
    return (ofType.find((space) => free.has(space.id)) ?? current).id;
}
