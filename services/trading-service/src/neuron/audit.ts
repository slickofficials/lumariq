export type AuditEvent = {
  ts: number;
  functionId: string;
  country?: string;
  email?: string;
  status: string;
  price?: number;
};

const events: AuditEvent[] = [];

export function audit(event: AuditEvent) {
  events.push(event);
}

export function auditSnapshot() {
  return events.slice(-1000);
}
