"use client";

import { blockUser, unblockUser } from "@/app/blokady/actions";

export default function BlockUserButton({
  userId,
  userName,
  isBlocked,
  returnTo,
}: {
  userId: string;
  userName: string;
  isBlocked: boolean;
  returnTo?: "/wiadomosci";
}) {
  if (isBlocked) {
    return (
      <form action={unblockUser}>
        <input type="hidden" name="user_id" value={userId} />
        <button
          type="submit"
          className="rounded-full border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          Odblokuj użytkownika
        </button>
      </form>
    );
  }

  return (
    <form
      action={blockUser}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Zablokować użytkownika ${userName}? Nie będziecie mogli do siebie pisać.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="user_id" value={userId} />
      {returnTo && <input type="hidden" name="return_to" value={returnTo} />}
      <button
        type="submit"
        className="rounded-full border border-red-200 px-5 py-3 text-sm font-bold text-red-700 hover:bg-red-50"
      >
        Zablokuj użytkownika
      </button>
    </form>
  );
}
