export default function RejectionFeedbackBox(props: { feedback: string; label?: string; className?: string }) {
  const label = props.label ?? "Rejection feedback";
  return (
    <div
      className={[
        "rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-200",
        props.className ?? "",
      ].join(" ")}
    >
      {label}: {props.feedback}
    </div>
  );
}

