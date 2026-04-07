-- drops the old "allow all" policies and replaces them with authenticated only
-- run this in your supabase sql editor after enabling auth

DROP POLICY IF EXISTS "Allow all" ON reading_role;
CREATE POLICY "Authenticated only" ON reading_role FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all" ON reading_dealer_type;
CREATE POLICY "Authenticated only" ON reading_dealer_type FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all" ON reading_category;
CREATE POLICY "Authenticated only" ON reading_category FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all" ON reading_condition;
CREATE POLICY "Authenticated only" ON reading_condition FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all" ON reading_acquisition_type;
CREATE POLICY "Authenticated only" ON reading_acquisition_type FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all" ON reading_contact;
CREATE POLICY "Authenticated only" ON reading_contact FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all" ON reading_contact_role;
CREATE POLICY "Authenticated only" ON reading_contact_role FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all" ON reading_dealer_info;
CREATE POLICY "Authenticated only" ON reading_dealer_info FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all" ON reading_specialty;
CREATE POLICY "Authenticated only" ON reading_specialty FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all" ON reading_dealer_specialty;
CREATE POLICY "Authenticated only" ON reading_dealer_specialty FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all" ON reading_item;
CREATE POLICY "Authenticated only" ON reading_item FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all" ON reading_purchase;
CREATE POLICY "Authenticated only" ON reading_purchase FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all" ON reading_purchase_item;
CREATE POLICY "Authenticated only" ON reading_purchase_item FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all" ON reading_sale;
CREATE POLICY "Authenticated only" ON reading_sale FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all" ON reading_sale_item;
CREATE POLICY "Authenticated only" ON reading_sale_item FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all" ON reading_market_price;
CREATE POLICY "Authenticated only" ON reading_market_price FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow all" ON reading_special_request;
CREATE POLICY "Authenticated only" ON reading_special_request FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
