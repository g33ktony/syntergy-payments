export function personLabel(person: { name: string; nickname?: string | null }) {
  const nickname = person.nickname?.trim();
  return nickname ? `${person.name} (${nickname})` : person.name;
}
