revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.guard_role_change() from public, anon, authenticated;
revoke execute on function public.claim_orders() from public, anon;
grant execute on function public.claim_orders() to authenticated;
revoke execute on function public.has_bought(uuid) from public, anon;
grant execute on function public.has_bought(uuid) to authenticated;
-- is_staff / is_owner stay callable: the security rules use them for every visitor, and they only reveal the caller's own role.
