type Meeting = { id: string; start: number; end: number };

export function assignMeetingRooms(meetings: Meeting[]) {
  const byStart = [...meetings].sort((a, b) => a.start - b.start);
  const freeAt: number[] = [];
  const roomOf = new Map<string, number>();

  for (const meeting of byStart) {
    let room = freeAt.findIndex((time) => time <= meeting.start);
    if (room === -1) {
      room = freeAt.length;
      freeAt.push(meeting.end);
    } else {
      freeAt[room] = meeting.end;
    }
    roomOf.set(meeting.id, room + 1);
  }

  return {
    roomCount: freeAt.length,
    assignments: meetings.map((meeting) => ({ id: meeting.id, room: roomOf.get(meeting.id)! })),
  };
}
