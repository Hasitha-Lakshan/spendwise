-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Drop tables if they exist (CASCADE removes dependent objects)
drop table if exists transactions cascade;
drop table if exists sub_categories cascade;
drop table if exists categories cascade;
drop table if exists profiles cascade;

drop function if exists public.seed_categories_for_new_user() cascade;

-- Create profiles
create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy select_own_profile on profiles
    for select using (auth.uid() = user_id);
create policy insert_own_profile on profiles
    for insert with check (auth.uid() = user_id);
create policy update_own_profile on profiles
    for update using (auth.uid() = user_id);
create policy delete_own_profile on profiles
    for delete using (auth.uid() = user_id);

-- Categories table
create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique(user_id, name)
);

-- Subcategories linked to categories
create table sub_categories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique(user_id, category_id, name)
);

-- Transactions table
create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references categories(id) on delete set null,
  sub_category_id uuid references sub_categories(id) on delete set null,
  transaction_date date not null,
  amount numeric(12,2) not null check (amount >= 0),
  type text not null check (type in ('expense', 'income', 'lend', 'borrow')),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_transactions_user_date on transactions (user_id, transaction_date desc);
create index idx_transactions_category on transactions (category_id);
create index idx_transactions_sub_category on transactions (sub_category_id);

-- Enable RLS
alter table categories enable row level security;
alter table sub_categories enable row level security;
alter table transactions enable row level security;

-- RLS policies for categories
create policy select_categories on categories
  for select using (auth.uid() = user_id);
create policy insert_categories on categories
  for insert with check (auth.uid() = user_id);
create policy update_categories on categories
  for update using (auth.uid() = user_id);
create policy delete_categories on categories
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

-- Function to seed default categories and sub-categories on profile insert
create or replace function public.seed_categories_for_new_user()
returns trigger
language plpgsql
as $$
declare
  new_user_id uuid := new.user_id;
begin
  begin
    -- Insert categories
    insert into categories (user_id, name) values
      (new_user_id, 'PAY YOUR BILLS'),
      (new_user_id, 'MONEY TO INVEST'),
      (new_user_id, 'SAVING UP FOR'),
      (new_user_id, 'PAY DOWN DEBT'),
      (new_user_id, 'GUILT FREE SPENDING'),
      (new_user_id, 'Credit Card'),
      (new_user_id, 'INCOME'),
      (new_user_id, 'Lend'),
      (new_user_id, 'Borrow');

    -- Insert subcategories
    insert into sub_categories (user_id, category_id, name)
    select new_user_id, c.id, s.sub_name
    from categories c
    join (
      values
      ('PAY YOUR BILLS', 'Mortgage/Rent'),
      ('PAY YOUR BILLS', 'Bike Maintenance'),
      ('PAY YOUR BILLS', 'Cell Phone'),
      ('PAY YOUR BILLS', 'Internet'),
      ('PAY YOUR BILLS', 'Utilities (Electric, Heat, Gas, etc.)'),
      ('PAY YOUR BILLS', 'Groceries'),
      ('PAY YOUR BILLS', 'Transportation (Gas/Repairs/Transit)'),
      ('PAY YOUR BILLS', 'Healthcare'),
      ('PAY YOUR BILLS', 'Other'),
      ('PAY YOUR BILLS', 'Student Loan Payments'),
      ('PAY YOUR BILLS', 'Insurance'),
      ('PAY YOUR BILLS', 'Pet Care'),
      ('PAY YOUR BILLS', 'Self Care'),
      ('PAY YOUR BILLS', 'House renovation'),
      ('PAY YOUR BILLS', 'Subscriptions'),
      ('PAY YOUR BILLS', 'House hold items'),

      ('MONEY TO INVEST', 'stock market'),
      ('MONEY TO INVEST', 'crypto'),

      ('INCOME', 'Employment'),
      ('INCOME', 'Repaid Debt'),
      ('INCOME', 'Gift'),
      ('INCOME', 'Loan'),
      ('INCOME', 'Insurance'),
      ('INCOME', 'CC Cashback'),

      ('SAVING UP FOR', 'Car'),
      ('SAVING UP FOR', 'Downpayment for a Home'),
      ('SAVING UP FOR', 'Vacation'),
      ('SAVING UP FOR', 'Emergency Fund'),
      ('SAVING UP FOR', 'Wedding'),

      ('PAY DOWN DEBT', 'Auto Loan'),
      ('PAY DOWN DEBT', 'Mortgage'),
      ('PAY DOWN DEBT', 'Credit Card Debt'),
      ('PAY DOWN DEBT', 'Personal Loan'),
      ('PAY DOWN DEBT', 'Debt Owed'),

      ('GUILT FREE SPENDING', 'Entertainment'),
      ('GUILT FREE SPENDING', 'Dining/Eating Out'),
      ('GUILT FREE SPENDING', 'Clothing'),
      ('GUILT FREE SPENDING', 'Shopping'),
      ('GUILT FREE SPENDING', 'Hobbies'),
      ('GUILT FREE SPENDING', 'Memberships/Subscriptions'),
      ('GUILT FREE SPENDING', 'Personal Care'),
      ('GUILT FREE SPENDING', 'Gifts'),
      ('GUILT FREE SPENDING', 'Charity'),

      ('Credit Card', 'Monthly Settlement'),
      ('Credit Card', 'Minimum Payment'),

      ('Lend', 'Friends'),
      ('Borrow', 'Bank Loan')
    ) as s(category_name, sub_name) on c.name = s.category_name;

  exception when others then
    raise notice 'Category seeding failed for user %: %', new_user_id, sqlerrm;
  end;

  return new;
end;
$$;

-- Trigger on profiles insert to seed categories and subcategories
create trigger after_profile_insert
after insert on profiles
for each row
execute function public.seed_categories_for_new_user();
