-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ==========================
-- Drop tables if they exist (CASCADE will remove dependent objects like policies and triggers)
-- ==========================
drop table if exists transactions cascade;
drop table if exists sub_categories cascade;
drop table if exists main_categories cascade;
drop table if exists profiles cascade;

-- Drop the seed function if exists
drop function if exists public.seed_categories_for_new_user() cascade;

-- ==========================
-- Create tables
-- ==========================

create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz default now()
);

-- Enable RLS on profiles
alter table profiles enable row level security;

-- Policies on profiles
create policy select_own_profile on profiles
    for select using (auth.uid() = user_id);
create policy insert_own_profile on profiles
    for insert with check (auth.uid() = user_id);
create policy update_own_profile on profiles
    for update using (auth.uid() = user_id);
create policy delete_own_profile on profiles
    for delete using (auth.uid() = user_id);

create table main_categories (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    description text,
    created_at timestamptz not null default now(),
    unique(user_id, name)
);

create table sub_categories (
    id uuid primary key default gen_random_uuid(),
    main_category_id uuid not null references main_categories(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    description text,
    created_at timestamptz not null default now(),
    unique(user_id, main_category_id, name)
);

create table transactions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    main_category_id uuid references main_categories(id) on delete set null,
    sub_category_id uuid references sub_categories(id) on delete set null,
    transaction_date date not null,
    amount numeric(12,2) not null check (amount >= 0),
    description text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Indexes
create index idx_transactions_user_date
    on transactions (user_id, transaction_date desc);
create index idx_transactions_main_category
    on transactions (main_category_id);
create index idx_transactions_sub_category
    on transactions (sub_category_id);

-- Enable RLS
alter table main_categories enable row level security;
alter table sub_categories enable row level security;
alter table transactions enable row level security;

-- RLS policies for main_categories
create policy select_main_categories on main_categories
    for select using (auth.uid() = user_id);
create policy insert_main_categories on main_categories
    for insert with check (auth.uid() = user_id);
create policy update_main_categories on main_categories
    for update using (auth.uid() = user_id);
create policy delete_main_categories on main_categories
    for delete using (auth.uid() = user_id);

-- RLS policies for sub_categories
create policy select_sub_categories on sub_categories
    for select using (auth.uid() = user_id);
create policy insert_sub_categories on sub_categories
    for insert with check (auth.uid() = user_id);
create policy update_sub_categories on sub_categories
    for update using (auth.uid() = user_id);
create policy delete_sub_categories on sub_categories
    for delete using (auth.uid() = user_id);

-- RLS policies for transactions
create policy select_transactions on transactions
    for select using (auth.uid() = user_id);
create policy insert_transactions on transactions
    for insert with check (auth.uid() = user_id);
create policy update_transactions on transactions
    for update using (auth.uid() = user_id);
create policy delete_transactions on transactions
    for delete using (auth.uid() = user_id);

-- Function to seed default categories on profile insert
create or replace function public.seed_categories_for_new_user()
returns trigger
language plpgsql
as $$
declare
  new_user_id uuid := new.user_id;
begin
  begin
    insert into main_categories (user_id, name) values
      (new_user_id, 'pay your bills'),
      (new_user_id, 'money to invest'),
      (new_user_id, 'saving up for'),
      (new_user_id, 'pay down debt'),
      (new_user_id, 'guilt free spending'),
      (new_user_id, 'credit card'),
      (new_user_id, 'income'),
      (new_user_id, 'lend'),
      (new_user_id, 'borrow');

    insert into sub_categories (user_id, main_category_id, name)
    select new_user_id, mc.id, sub_name
    from main_categories mc
    join (
      values
        ('pay your bills', 'electricity'),
        ('pay your bills', 'water'),
        ('pay your bills', 'internet'),
        ('pay your bills', 'phone'),
        ('money to invest', 'stocks'),
        ('money to invest', 'crypto'),
        ('saving up for', 'vacation'),
        ('saving up for', 'house'),
        ('pay down debt', 'credit card'),
        ('pay down debt', 'loan'),
        ('guilt free spending', 'dining out'),
        ('guilt free spending', 'entertainment'),
        ('credit card', 'visa'),
        ('credit card', 'mastercard'),
        ('income', 'salary'),
        ('income', 'bonus'),
        ('lend', 'friends'),
        ('borrow', 'bank loan')
    ) as sub_data(main_cat_name, sub_name)
    on mc.name = sub_data.main_cat_name
    and mc.user_id = new_user_id;
  exception
    when others then
      raise notice 'Category seeding failed for user %: %', new_user_id, sqlerrm;
  end;

  return new;
end;
$$;

-- Trigger on profiles insert to seed categories
create trigger after_profile_insert
after insert on profiles
for each row
execute function public.seed_categories_for_new_user();
