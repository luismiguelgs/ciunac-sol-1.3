import Link from 'next/link';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  title: string;
  description: string;
  href?: string;
  actionLabel?: string;
};

export default function EmptyState({ title, description, href, actionLabel = 'Volver' }: Props) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-xl border bg-card p-8 text-center shadow-sm">
      <Inbox className="h-12 w-12 text-muted-foreground" />
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {href ? <Button asChild><Link href={href}>{actionLabel}</Link></Button> : null}
    </div>
  );
}
