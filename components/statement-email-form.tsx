import { sendStatement } from "@/app/statements/actions";

export function StatementEmailForm({ customerId, email }: { customerId: string; email: string | null }) {
  return <form action={sendStatement} className="mt-4 print:hidden"><input type="hidden" name="customerId" value={customerId} /><button className="button-primary" type="submit" disabled={!email}>Email statement to {email || "customer (no email)"}</button></form>;
}
