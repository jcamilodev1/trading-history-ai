-- Create accounts table
create table public.accounts (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null default auth.uid (),
  name text not null,
  broker text null,
  initial_balance numeric null,
  currency text not null default 'USD',
  is_default boolean default false,
  created_at timestamp with time zone not null default now(),
  constraint accounts_pkey primary key (id),
  constraint accounts_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
);

-- Add account_id to trades table
alter table public.trades
add column account_id uuid null;

-- Add foreign key constraint to trades
alter table public.trades
add constraint trades_account_id_fkey foreign key (account_id) references public.accounts (id) on delete cascade;

-- Enable RLS on accounts
alter table public.accounts enable row level security;

-- Create policies for accounts
create policy "Enable read access for own accounts"
on public.accounts for select
to authenticated
using (auth.uid() = user_id);

create policy "Enable insert access for own accounts"
on public.accounts for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Enable update access for own accounts"
on public.accounts for update
to authenticated
using (auth.uid() = user_id);

create policy "Enable delete access for own accounts"
on public.accounts for delete
to authenticated
using (auth.uid() = user_id);

-- Create a Default Account for existing users and link existing trades to it
DO $$
DECLARE
    default_account_id uuid;
    user_record RECORD;
BEGIN
    -- Iterate over all users who have trades but no accounts
    FOR user_record IN 
        SELECT DISTINCT user_id FROM public.trades WHERE account_id IS NULL
    LOOP
        -- Create a default account for this user
        INSERT INTO public.accounts (user_id, name, is_default)
        VALUES (user_record.user_id, 'Default Account', true)
        RETURNING id INTO default_account_id;

        -- Update existing trades for this user to belong to the new default account
        UPDATE public.trades
        SET account_id = default_account_id
        WHERE user_id = user_record.user_id AND account_id IS NULL;
    END LOOP;
END $$;
