interface Attendee {
  readonly id: string;
  readonly label: string;
  readonly salary: number | '';
}

function createAttendee(overrides?: Partial<Omit<Attendee, 'id'>>): Attendee {
  return {
    label: '',
    salary: '',
    ...overrides,
    id: crypto.randomUUID(),
  };
}

export type { Attendee };
export { createAttendee };
