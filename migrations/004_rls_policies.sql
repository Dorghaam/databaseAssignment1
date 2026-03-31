-- enables rls on every table and adds an allow all policy so nothing gets blocked
-- this is fine for a school project with no auth

ALTER TABLE reading_role ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON reading_role FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE reading_dealer_type ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON reading_dealer_type FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE reading_category ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON reading_category FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE reading_condition ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON reading_condition FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE reading_acquisition_type ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON reading_acquisition_type FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE reading_contact ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON reading_contact FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE reading_contact_role ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON reading_contact_role FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE reading_dealer_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON reading_dealer_info FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE reading_specialty ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON reading_specialty FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE reading_dealer_specialty ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON reading_dealer_specialty FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE reading_item ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON reading_item FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE reading_purchase ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON reading_purchase FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE reading_purchase_item ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON reading_purchase_item FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE reading_sale ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON reading_sale FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE reading_sale_item ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON reading_sale_item FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE reading_market_price ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON reading_market_price FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE reading_special_request ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON reading_special_request FOR ALL USING (true) WITH CHECK (true);
