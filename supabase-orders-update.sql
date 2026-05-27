-- ============================================================
-- UHA SHOP — Orders table update
-- Run this in Supabase SQL Editor AFTER supabase-setup.sql
-- ============================================================

-- Add order_number column
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number text;

-- Update RLS policies for orders
-- Drop old restrictive policies
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;

-- Allow anyone to insert orders (supports guest checkout)
CREATE POLICY "Anyone can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read orders (admin panel needs all orders)
CREATE POLICY "Anyone can read orders"
  ON public.orders FOR SELECT
  USING (true);

-- Allow anyone to update orders (admin status changes)
CREATE POLICY "Anyone can update orders"
  ON public.orders FOR UPDATE
  USING (true);
