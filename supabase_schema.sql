-- 1. SCHOOLS Tablosuna Abonelik Sütunlarını Ekle
-- Bu kod, okulların abonelik durumunu ve deneme süresi bitiş tarihini takip eder.

ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'TRIALING',
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '14 days');

-- 2. USER_PROFILES Tablosuna Rol ve Okul ID Bilgilerini Doğrula
-- Kullanıcıların yetkilerini (İdareci/Öğretmen) ve hangi okula ait olduklarını belirler.

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'İDARECİ',
ADD COLUMN IF NOT EXISTS school_id TEXT;

-- 3. Ödeme Geçmişi İçin Opsiyonel Tablo (İleride lazım olabilir)
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id TEXT,
    amount DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    status TEXT, -- 'SUCCESS', 'FAILED'
    transaction_id TEXT, -- iyzico/Stripe'dan dönen ID
    created_at TIMESTAMPTZ DEFAULT now()
);
