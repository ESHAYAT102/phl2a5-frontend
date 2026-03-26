"use client";

export default function PaidIdeaUnlockBanner(props: {
  canCheckout: boolean;
  checkoutLoading: boolean;
  onCheckout: () => void;
}) {
  return (
    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
      <div className="text-lg font-semibold text-amber-900 dark:text-amber-200">This is a paid idea.</div>
      <div className="mt-2 text-sm text-amber-800 dark:text-amber-100">
        Purchase is required to view details, vote, or comment.
      </div>
      <div className="mt-4">
        {props.canCheckout ? (
          <button
            type="button"
            disabled={props.checkoutLoading}
            onClick={props.onCheckout}
            className="rounded-lg bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-60"
          >
            {props.checkoutLoading ? "Processing..." : "Pay to Unlock (Mock)"}
          </button>
        ) : (
          <a href="/login" className="text-sm font-medium text-amber-900 underline dark:text-amber-200">
            Login to purchase
          </a>
        )}
      </div>
    </div>
  );
}

