export default function PriceStatusBadge(props: { isPaid: boolean }) {
  return props.isPaid ? (
    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
      Paid
    </span>
  ) : (
    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200">
      Free
    </span>
  );
}

