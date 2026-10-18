-- ==============================================================================
-- UTSAVHUB PRODUCTION DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- Multi-Vendor Catering & Event Services Marketplace
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DROP TABLES IF EXIST (Order matters due to foreign keys)
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS subscription_transactions CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 3. PROFILES TABLE
-- Extends auth.users with marketplace role (client vs vendor)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('client', 'vendor')),
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. VENDORS TABLE
-- Business catalog, service packages, portfolio images, and subscription state
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Catering', 'Band Mela', 'Tent House', 'Shamiana', 'Lighting', 'Decoration', 'Sound & DJ', 'Photography')),
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Delhi NCR',
    description TEXT,
    pricing_packages JSONB NOT NULL DEFAULT '[
        {"id": "pkg_standard", "title": "Silver Package", "price": 450, "unit": "per plate / day", "description": "Standard setup with welcome drinks, 3 starters, 5 main courses, and 2 desserts."},
        {"id": "pkg_deluxe", "title": "Gold Royal Package", "price": 750, "unit": "per plate / day", "description": "Premium live counters, 5 mocktails, 5 appetizers, royal buffet, artisanal desserts."},
        {"id": "pkg_grand", "title": "Diamond Grandeur", "price": 1200, "unit": "per plate / day", "description": "Full luxury VIP layout with custom master chef menu, international delicacies, and dedicated captains."}
    ]'::jsonb,
    images TEXT[] NOT NULL DEFAULT ARRAY[
        'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop&q=80'
    ],
    is_subscribed BOOLEAN NOT NULL DEFAULT false,
    subscription_expires_at TIMESTAMPTZ,
    rating NUMERIC(2,1) NOT NULL DEFAULT 4.8,
    review_count INTEGER NOT NULL DEFAULT 24,
    bank_name TEXT,
    bank_account_number TEXT,
    bank_ifsc TEXT,
    bank_account_holder TEXT,
    upi_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. BOOKINGS TABLE
-- Event service leads from clients to vendors
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_date DATE NOT NULL,
    guest_count INTEGER NOT NULL CHECK (guest_count > 0),
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
    special_notes TEXT,
    total_estimated_amount NUMERIC(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CHATS TABLE
-- Real-time messaging per booking lead
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. SUBSCRIPTION TRANSACTIONS (RAZORPAY & BANK TRANSFER AUDIT)
CREATE TABLE subscription_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL DEFAULT 'Monthly Pro Vendor Membership',
    amount NUMERIC(10,2) NOT NULL DEFAULT 1499.00,
    currency TEXT NOT NULL DEFAULT 'INR',
    payment_method TEXT NOT NULL CHECK (payment_method IN ('razorpay', 'bank_transfer', 'upi')),
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    bank_reference_number TEXT, -- UTR / Transaction ID entered by vendor
    bank_receipt_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'verified', 'failed')) DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX idx_vendors_category ON vendors(category);
CREATE INDEX idx_vendors_is_subscribed ON vendors(is_subscribed);
CREATE INDEX idx_bookings_client_id ON bookings(client_id);
CREATE INDEX idx_bookings_vendor_id ON bookings(vendor_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_chats_booking_id ON chats(booking_id);
CREATE INDEX idx_chats_created_at ON chats(created_at);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_transactions ENABLE ROW LEVEL SECURITY;

-- 8. PROFILES POLICIES
-- Anyone authenticated can view profiles
CREATE POLICY "Public profiles are viewable by authenticated users"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 9. VENDORS POLICIES
-- Clients and visitors can view vendors who have an ACTIVE subscription
-- Vendors can view their own record even if expired/unsubscribed
CREATE POLICY "Public can view subscribed vendors"
    ON vendors FOR SELECT
    USING (is_subscribed = true OR auth.uid() = user_id);

-- Vendors can insert their business record
CREATE POLICY "Vendors can insert their own vendor record"
    ON vendors FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Vendors can update their own record
CREATE POLICY "Vendors can update their own vendor record"
    ON vendors FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 10. BOOKINGS POLICIES
-- Clients can see their own bookings; Vendors can see bookings assigned to their business
CREATE POLICY "Users can view relevant bookings"
    ON bookings FOR SELECT
    TO authenticated
    USING (
        client_id = auth.uid()
        OR vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
    );

-- Clients can create new bookings
CREATE POLICY "Clients can create bookings"
    ON bookings FOR INSERT
    TO authenticated
    WITH CHECK (client_id = auth.uid());

-- Both clients and vendors can update booking status (accept, reject, cancel, complete)
CREATE POLICY "Participants can update bookings"
    ON bookings FOR UPDATE
    TO authenticated
    USING (
        client_id = auth.uid()
        OR vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
    );

-- 11. CHATS POLICIES
-- Chat messages are visible only to participants of that booking
CREATE POLICY "Participants can view booking messages"
    ON chats FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.id = chats.booking_id
            AND (
                b.client_id = auth.uid()
                OR b.vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
            )
        )
    );

-- Participants can send messages
CREATE POLICY "Participants can insert booking messages"
    ON chats FOR INSERT
    TO authenticated
    WITH CHECK (
        sender_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.id = booking_id
            AND (
                b.client_id = auth.uid()
                OR b.vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
            )
        )
    );

-- 12. SUBSCRIPTION TRANSACTIONS POLICIES
CREATE POLICY "Vendors can view their own subscription records"
    ON subscription_transactions FOR SELECT
    TO authenticated
    USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors can submit subscription payments"
    ON subscription_transactions FOR INSERT
    TO authenticated
    WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

-- ==============================================================================
-- AUTOMATIC TRIGGER: ON AUTH USER CREATION -> CREATE PROFILE
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, phone)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'role', 'client'),
        COALESCE(new.raw_user_meta_data->>'phone', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- REALTIME ENABLEMENT FOR WEBSOCKET SYNCHRONIZATION
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE chats;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE vendors;

-- ==============================================================================
-- STORAGE BUCKET CONFIGURATION (Run in Supabase SQL editor)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-portfolio', 'vendor-portfolio', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Public can view vendor-portfolio
CREATE POLICY "Public Access to Vendor Portfolio"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'vendor-portfolio');

-- Authenticated vendors can upload to vendor-portfolio
CREATE POLICY "Authenticated Users Can Upload Portfolio Images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'vendor-portfolio');

-- Authenticated vendors can upload payment receipts
CREATE POLICY "Authenticated Users Can Upload Payment Receipts"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'payment-receipts');
