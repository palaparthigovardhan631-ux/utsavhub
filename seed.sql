-- ==============================================================================
-- UTSAVHUB REAL-WORLD PRODUCTION SEED DATA
-- Authentic Event Services & Catering Providers
-- ==============================================================================

-- Sample Vendors with active subscriptions (visible in marketplace feed)
-- Note: In production with live Supabase auth, vendors are linked to real auth.users.
-- This seed provides instant real data for testing the catalog, pricing, packages, and booking.

DO $$
DECLARE
    client_profile_id UUID := gen_random_uuid();
    vendor_profile_1 UUID := gen_random_uuid();
    vendor_profile_2 UUID := gen_random_uuid();
    vendor_profile_3 UUID := gen_random_uuid();
    vendor_profile_4 UUID := gen_random_uuid();
    vendor_profile_5 UUID := gen_random_uuid();
    v1_id UUID := gen_random_uuid();
    v2_id UUID := gen_random_uuid();
    v3_id UUID := gen_random_uuid();
    v4_id UUID := gen_random_uuid();
    v5_id UUID := gen_random_uuid();
    booking_1_id UUID := gen_random_uuid();
BEGIN
    -- 1. Insert Demo Profiles
    INSERT INTO profiles (id, email, full_name, role, phone)
    VALUES
    (client_profile_id, 'client.demo@utsavhub.com', 'Aarav Sharma', 'client', '+91 98765 43210'),
    (vendor_profile_1, 'royal.rasoi@utsavhub.com', 'Rajesh Aggarwal', 'vendor', '+91 98111 22334'),
    (vendor_profile_2, 'jea.band@utsavhub.com', 'Gurpreet Singh', 'vendor', '+91 98222 33445'),
    (vendor_profile_3, 'shree.tent@utsavhub.com', 'Ramesh Chandra Verma', 'vendor', '+91 98333 44556'),
    (vendor_profile_4, 'maharaja.shamiana@utsavhub.com', 'Vikram Rathore', 'vendor', '+91 98444 55667'),
    (vendor_profile_5, 'lumina.lights@utsavhub.com', 'Anil Deshmukh', 'vendor', '+91 98555 66778')
    ON CONFLICT (id) DO NOTHING;

    -- 2. Insert Authentic Vendors across categories
    -- VENDOR 1: Royal Rasoi Caterers (Catering)
    INSERT INTO vendors (
        id, user_id, business_name, category, phone, address, city, description,
        pricing_packages, images, is_subscribed, subscription_expires_at, rating, review_count,
        bank_name, bank_account_number, bank_ifsc, bank_account_holder, upi_id
    ) VALUES (
        v1_id,
        vendor_profile_1,
        'Royal Rasoi Gourmet Caterers',
        'Catering',
        '+91 98111 22334',
        '42, Ring Road, South Extension Part II',
        'Delhi NCR',
        'Award-winning 5-star wedding & corporate caterers specializing in Awadhi, Mughlai, Punjabi, and authentic Gujarati live thalis with 25+ years of heritage.',
        '[
            {"id": "pkg_silver", "title": "Silver Heritage Buffet", "price": 650, "unit": "per plate", "description": "3 Mocktails, 4 Starters (Paneer Tikka, Dahi Kebab, Spring Rolls, Hara Bhara), 6 Main Courses, Dal Makhani, Assorted Breads, Kulfi & Gulab Jamun."},
            {"id": "pkg_gold", "title": "Gold Shahi Feast", "price": 950, "unit": "per plate", "description": "5 Artisanal Mocktails, 6 Live Appetizers, 2 Live Pasta & Chaat Counters, 8 Main Courses (Paneer Lababdar, Dum Aloo Kashmiri, Dal Bukhara), 4 Exotic Desserts."},
            {"id": "pkg_royal", "title": "Imperial Maharaja Banquet", "price": 1450, "unit": "per plate", "description": "Full Signature VIP Experience: International Sushi bar, Tandoori live pavilion, 10 Main courses, Awadhi Biryani, Jalebi Rabri live counter, Dedicated Master Captains."}
        ]'::jsonb,
        ARRAY[
            'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80'
        ],
        true,
        NOW() + INTERVAL '45 days',
        4.9,
        86,
        'State Bank of India',
        '30987654321',
        'SBIN0001234',
        'Royal Rasoi Catering LLP',
        'royalrasoi@oksbi'
    ) ON CONFLICT (user_id) DO NOTHING;

    -- VENDOR 2: Master Jea Brass Band (Band Mela)
    INSERT INTO vendors (
        id, user_id, business_name, category, phone, address, city, description,
        pricing_packages, images, is_subscribed, subscription_expires_at, rating, review_count,
        bank_name, bank_account_number, bank_ifsc, bank_account_holder, upi_id
    ) VALUES (
        v2_id,
        vendor_profile_2,
        'Master Jea Royal Brass Band',
        'Band Mela',
        '+91 98222 33445',
        'Shop 14, Chandni Chowk Near Town Hall',
        'Delhi NCR',
        'Prestigious 35-piece royal brass band procession with antique Victorian horse carriage (Bagghi), uniform fanfare trumpeters, flower doli, and Punjabi dhol troupe.',
        '[
            {"id": "pkg_band_basic", "title": "Classic Baraat Band", "price": 25000, "unit": "per event", "description": "16 Uniformed brass musicians, 2 Punjabi dhol players, battery trolley lighting."},
            {"id": "pkg_band_royal", "title": "Royal Brass & Dhol Symphony", "price": 55000, "unit": "per event", "description": "25 Royal musicians, 4 Nashik dhol players, 2 Shenai players, crystal chandelier lights, vintage flower Bagghi."},
            {"id": "pkg_band_vip", "title": "Maharaja Imperial Procession", "price": 95000, "unit": "per event", "description": "35-member orchestra, elephant/vintage car escort coordination, hydraulic trolley, fire cold pyro display, synchronized brass fanfare."}
        ]'::jsonb,
        ARRAY[
            'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80'
        ],
        true,
        NOW() + INTERVAL '30 days',
        4.8,
        52,
        'Punjab National Bank',
        '0123002100054321',
        'PUNB0012300',
        'Master Jea Band',
        'jeaband@okpnb'
    ) ON CONFLICT (user_id) DO NOTHING;

    -- VENDOR 3: Shree Ram Tent & Infrastructure (Tent House)
    INSERT INTO vendors (
        id, user_id, business_name, category, phone, address, city, description,
        pricing_packages, images, is_subscribed, subscription_expires_at, rating, review_count,
        bank_name, bank_account_number, bank_ifsc, bank_account_holder, upi_id
    ) VALUES (
        v3_id,
        vendor_profile_3,
        'Shree Ram German Hangar & Tent House',
        'Tent House',
        '+91 98333 44556',
        'Sector 18, Noida & Chattarpur Mandir Road',
        'Delhi NCR',
        'Turnkey wedding infrastructure provider specializing in all-weather German Hangars, waterproof air-conditioned marquees, red carpet pathways, and modular staging.',
        '[
            {"id": "pkg_tent_intimate", "title": "Lawn & Mehendi Setup (300 Guests)", "price": 75000, "unit": "complete setup", "description": "Canopy tents, bohemian seating, low diwans with vibrant bolster pillows, stage truss, and entrance arch."},
            {"id": "pkg_tent_grand", "title": "AC German Hangar Pavilion (800 Guests)", "price": 180000, "unit": "complete setup", "description": "Fully waterproof 10,000 sq ft insulated German Hangar, centralized tower ACs, wooden carpeted floor, grand 40ft stage."},
            {"id": "pkg_tent_palace", "title": "Palace Theme Mega Pavilion (1500+ Guests)", "price": 350000, "unit": "complete setup", "description": "Custom Rajasthani carved fiber pillars, velvet ceiling drapery, multi-tier banquet stages, dining hall partition, VIP green rooms."}
        ]'::jsonb,
        ARRAY[
            'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=800&auto=format&fit=crop&q=80'
        ],
        true,
        NOW() + INTERVAL '60 days',
        4.7,
        41,
        'HDFC Bank',
        '50200098765432',
        'HDFC0002345',
        'Shree Ram Tent House Pvt Ltd',
        'shreeram.tents@okhdfcbank'
    ) ON CONFLICT (user_id) DO NOTHING;

    -- VENDOR 4: Maharaja Royal Shamiana & Draping (Shamiana)
    INSERT INTO vendors (
        id, user_id, business_name, category, phone, address, city, description,
        pricing_packages, images, is_subscribed, subscription_expires_at, rating, review_count,
        bank_name, bank_account_number, bank_ifsc, bank_account_holder, upi_id
    ) VALUES (
        v4_id,
        vendor_profile_4,
        'Maharaja Royal Shamiana Decor',
        'Shamiana',
        '+91 98444 55667',
        'Plot 88, Udyog Vihar Phase 4',
        'Delhi NCR',
        'Handcrafted traditional royal Shamianas, Banarasi silk canopies, hand-block printed ceiling fabrics, and royal Mughal style garden pavilions.',
        '[
            {"id": "pkg_shamiana_classic", "title": "Traditional Yellow & Red Shamiana", "price": 35000, "unit": "per setup", "description": "50x50 ft traditional floral print shamiana, ceiling tassels, side jali walls, bolster seating for 150 guests."},
            {"id": "pkg_shamiana_mughal", "title": "Royal Sheesh Mahal Shamiana", "price": 85000, "unit": "per setup", "description": "Mirror work embroidered ceilings, velvet side curtains, brass lanterns, royal divan seating with silk cushions."}
        ]'::jsonb,
        ARRAY[
            'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&auto=format&fit=crop&q=80'
        ],
        true,
        NOW() + INTERVAL '20 days',
        4.8,
        33,
        'ICICI Bank',
        '001205001234',
        'ICIC0000012',
        'Maharaja Shamiana Works',
        'maharajashamiana@okicici'
    ) ON CONFLICT (user_id) DO NOTHING;

    -- VENDOR 5: Lumina High-Tech Stage & Architectural Lighting (Lighting)
    INSERT INTO vendors (
        id, user_id, business_name, category, phone, address, city, description,
        pricing_packages, images, is_subscribed, subscription_expires_at, rating, review_count,
        bank_name, bank_account_number, bank_ifsc, bank_account_holder, upi_id
    ) VALUES (
        v5_id,
        vendor_profile_5,
        'Lumina Intelligent Event Lighting',
        'Lighting',
        '+91 98555 66778',
        'C-12, Okhla Industrial Area Phase 1',
        'Delhi NCR',
        'State-of-the-art DMX architectural illumination, Sharpy moving beams, LED pixel tunnels, warm fairy light canopies, and programmed ambient stage lights.',
        '[
            {"id": "pkg_light_warm", "title": "Fairy Light Dream Canopy", "price": 40000, "unit": "per night", "description": "10,000 warm white micro-LED fairy lights covering lawn trees, pathway hanging chandeliers, entrance tunnel."},
            {"id": "pkg_light_concert", "title": "Concert & Sangeet Stage Truss", "price": 90000, "unit": "per night", "description": "16 Sharpy 10R beam fixtures, 24 RGBWA LED par cans, 4 haze machines, CO2 jet blast cannons, professional lighting controller technician."}
        ]'::jsonb,
        ARRAY[
            'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop&q=80'
        ],
        true,
        NOW() + INTERVAL '40 days',
        4.9,
        67,
        'Axis Bank',
        '912010045678901',
        'UTIB0000123',
        'Lumina Lighting Solutions',
        'luminalights@okaxis'
    ) ON CONFLICT (user_id) DO NOTHING;

    -- 3. Insert Initial Active Booking & Chat Message for Demo Flow
    INSERT INTO bookings (
        id, client_id, vendor_id, event_type, event_date, guest_count, status,
        special_notes, total_estimated_amount
    ) VALUES (
        booking_1_id,
        client_profile_id,
        v1_id,
        'Grand Wedding Reception',
        CURRENT_DATE + INTERVAL '14 days',
        450,
        'confirmed',
        'Need pure vegetarian live counter for Jains and Awadhi chaat stall.',
        427500.00
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO chats (booking_id, sender_id, message, created_at)
    VALUES
    (booking_1_id, client_profile_id, 'Namaste Rajesh ji, we are confirming the Gold Shahi Feast for 450 guests on our reception day.', NOW() - INTERVAL '2 hours'),
    (booking_1_id, vendor_profile_1, 'Namaste Aarav ji! Thank you for choosing Royal Rasoi. Our executive chef and service team are locked in for your date. We will make it grand!', NOW() - INTERVAL '1 hour 45 minutes'),
    (booking_1_id, client_profile_id, 'Please ensure the separate Jain live counter is placed next to the mocktail lounge.', NOW() - INTERVAL '30 minutes'),
    (booking_1_id, vendor_profile_1, 'Noted with priority! Our head captain Mr. Sharma will manage the Jain counter personally.', NOW() - INTERVAL '15 minutes')
    ON CONFLICT (id) DO NOTHING;

END $$;
