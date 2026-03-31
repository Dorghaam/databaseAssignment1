-- seeds all tables with the mock data from the original app
-- lookup tables are already seeded in 001 so this only does the core tables

-- contacts (ids 1 through 8 matching the original mockdata)
INSERT INTO reading_contact (first_name, last_name, phone, email, street_address, city, province, postal_code) VALUES
  ('Margaret', 'Whitfield', '902-555-0142', 'm.whitfield@eastcoastbooks.ca', '214 Barrington Street', 'Halifax', 'NS', 'B3J 1Y2'),
  ('Thomas', 'Beaulieu', '514-555-0198', 'tbeaulieu@montrealauctions.com', '88 Rue Saint-Paul', 'Montreal', 'QC', 'H2Y 1G7'),
  ('Susan', 'Park', '416-555-0233', 'spark@parkantiques.ca', '55 Queen Street West', 'Toronto', 'ON', 'M5H 2M8'),
  ('James', 'Macintyre', '902-555-0177', 'jmacintyre@dal.ca', '6299 South Street', 'Halifax', 'NS', 'B3H 4R2'),
  ('Eleanor', 'Chambers', '613-555-0321', 'eleanor.chambers@gmail.com', '12 Rideau Canal Lane', 'Ottawa', 'ON', 'K1N 8S7'),
  ('Robert', 'Fong', '604-555-0456', 'rfong@pacificrarebooks.com', '1122 Granville Street', 'Vancouver', 'BC', 'V6Z 1L2'),
  ('Claire', 'Dumont', '418-555-0289', 'cdumont@antiquaria.ca', '340 Grande Allee', 'Quebec City', 'QC', 'G1R 2H8'),
  ('William', 'Thornton', '506-555-0134', 'wthornton@nbhistory.org', '77 King Street', 'Saint John', 'NB', 'E2L 1G5');


-- contact roles (role_id: 1=customer, 2=collector, 3=dealer, 4=estate contact)
INSERT INTO reading_contact_role (contact_id, role_id) VALUES
  (1, 1),  -- margaret is customer
  (1, 2),  -- margaret is collector
  (2, 3),  -- thomas is dealer
  (3, 3),  -- susan is dealer
  (3, 2),  -- susan is collector
  (4, 1),  -- james is customer
  (5, 4),  -- eleanor is estate contact
  (6, 3),  -- robert is dealer
  (7, 3),  -- claire is dealer
  (7, 1),  -- claire is customer
  (8, 1),  -- william is customer
  (8, 2);  -- william is collector


-- dealer info (dealer_type_id: 1=auction house, 2=brokerage, 3=emporium, 4=individual)
INSERT INTO reading_dealer_info (contact_id, dealer_type_id) VALUES
  (2, 1),  -- thomas is auction house
  (3, 3),  -- susan is emporium
  (6, 2),  -- robert is brokerage
  (7, 4);  -- claire is individual


-- specialties (category_id: 1=book, 2=map, 3=periodical)
INSERT INTO reading_specialty (category_id, era, region, format) VALUES
  (1, '18th Century', 'France', 'Folio'),          -- specialty 1 for thomas
  (2, 'Renaissance', 'Europe', 'Folio'),            -- specialty 2 for thomas
  (2, '19th Century', 'Canada', 'Sheet'),            -- specialty 3 for susan
  (1, '19th Century', 'North America', 'Octavo'),    -- specialty 4 for robert
  (3, '19th Century', 'England', 'Folio'),           -- specialty 5 for robert
  (1, 'Medieval', 'England', 'Quarto');              -- specialty 6 for claire


-- dealer specialties (links dealers to their specialties)
INSERT INTO reading_dealer_specialty (contact_id, specialty_id) VALUES
  (2, 1),  -- thomas specialty 1
  (2, 2),  -- thomas specialty 2
  (3, 3),  -- susan specialty 3
  (6, 4),  -- robert specialty 4
  (6, 5),  -- robert specialty 5
  (7, 6);  -- claire specialty 6


-- items (category_id: 1=book, 2=map, 3=periodical | condition_id: 1=fine, 2=good, 3=fair, 4=poor)
INSERT INTO reading_item (title, category_id, description, era, region, format, condition_id, quantity_on_hand) VALUES
  ('Atlas of the Ancient World', 2, 'Detailed atlas covering Mediterranean civilizations from 3000 BCE to 500 CE', 'Ancient', 'Mediterranean', 'Folio', 2, 1),
  ('The Canterbury Tales — First Illustrated Edition', 1, 'Rare illustrated edition of Chaucer''s Canterbury Tales, woodcut prints', 'Medieval', 'England', 'Quarto', 3, 1),
  ('Nova Scotia Coastal Survey 1782', 2, 'British naval survey of the Nova Scotia coastline during the American Revolution', '18th Century', 'Atlantic Canada', 'Sheet', 2, 2),
  ('The Gentleman''s Magazine Vol. XII', 3, 'Complete volume of The Gentleman''s Magazine, 1742', '18th Century', 'England', 'Octavo', 1, 1),
  ('Birds of America — Plate 42', 1, 'Hand colored engraving from Audubon''s Birds of America, depicting the Purple Martin', '19th Century', 'North America', 'Double Elephant Folio', 1, 1),
  ('Map of Upper and Lower Canada 1815', 2, 'Detailed political map showing townships and settlements post War of 1812', '19th Century', 'Canada', 'Folio', 4, 1),
  ('Encyclopedie — Plate Volume III', 1, 'Diderot''s Encyclopedie plate volume covering mechanical arts and trades', '18th Century', 'France', 'Folio', 2, 1),
  ('The Illustrated London News — 1860 Bound', 3, 'Full year bound volume of The Illustrated London News, 1860', '19th Century', 'England', 'Folio', 3, 1),
  ('Ptolemy''s Geographia — 1540 Reprint', 2, 'Basel reprint of Ptolemy''s world maps with hand colored engravings', 'Renaissance', 'Europe', 'Folio', 2, 1),
  ('Canadian Almanac and Directory 1899', 3, 'Annual reference containing statistics, government listings, and trade data', '19th Century', 'Canada', 'Octavo', 3, 3);


-- purchases (acquisition_type_id: 1=individual, 2=dealer, 3=estate)
INSERT INTO reading_purchase (contact_id, purchase_date, acquisition_type_id, estate_donation_note) VALUES
  (2, '2025-12-15', 2, NULL),
  (5, '2025-11-20', 3, 'Three volumes of poetry donated to Dalhousie University Library per estate instructions.'),
  (3, '2026-01-05', 2, NULL),
  (7, '2026-01-18', 1, NULL),
  (6, '2025-10-30', 2, NULL),
  (2, '2026-02-10', 2, NULL);


-- purchase line items
INSERT INTO reading_purchase_item (purchase_id, item_id, quantity, purchase_price) VALUES
  (1, 1, 1, 2100.00),
  (2, 2, 1, 7200.00),
  (3, 3, 2, 1500.00),
  (3, 6, 1, 400.00),
  (4, 4, 1, 800.00),
  (5, 5, 1, 10500.00),
  (6, 8, 1, 350.00),
  (6, 10, 3, 120.00);


-- sales
INSERT INTO reading_sale (contact_id, sale_date) VALUES
  (1, '2026-01-10'),
  (4, '2026-01-25'),
  (8, '2026-02-05'),
  (1, '2026-02-14'),
  (3, '2026-02-20');


-- sale line items
INSERT INTO reading_sale_item (sale_id, item_id, quantity, sale_price) VALUES
  (1, 7, 1, 3800.00),
  (2, 9, 1, 6200.00),
  (3, 3, 1, 2100.00),
  (4, 4, 1, 1100.00),
  (4, 10, 1, 220.00),
  (5, 8, 1, 550.00);


-- market prices (condition_id: 1=fine, 2=good, 3=fair, 4=poor)
INSERT INTO reading_market_price (item_id, condition_id, price, date_checked, source) VALUES
  (1, 2, 2400.00, '2026-02-01', 'Auction House'),
  (1, 1, 3100.00, '2026-02-01', 'Dealer Catalogue'),
  (2, 3, 8500.00, '2026-01-15', 'Auction House'),
  (2, 2, 11000.00, '2026-01-15', 'Website'),
  (3, 2, 1800.00, '2026-01-20', 'Dealer Catalogue'),
  (5, 1, 12000.00, '2025-12-10', 'Auction House'),
  (5, 2, 9500.00, '2025-12-10', 'Website'),
  (9, 2, 5600.00, '2026-02-15', 'Phone Quote'),
  (1, 2, 2200.00, '2025-10-15', 'Website'),
  (1, 2, 2350.00, '2025-12-01', 'Auction House'),
  (5, 1, 11500.00, '2025-09-20', 'Auction House'),
  (2, 3, 8000.00, '2025-08-05', 'Website');


-- special requests
INSERT INTO reading_special_request (contact_id, description, date_requested, status) VALUES
  (1, 'Looking for a first edition of Susanna Moodie''s Roughing It in the Bush in Good or better condition.', '2026-01-08', 'Open'),
  (4, 'Seeking any 18th century maps of Prince Edward Island or Cape Breton.', '2025-12-20', 'Open'),
  (8, 'Wants bound volumes of The Maritime Farmer magazine, any year before 1900.', '2025-11-15', 'Fulfilled'),
  (3, 'Looking for Audubon prints, any North American bird species, plates 1 through 100, in Fine condition.', '2026-02-12', 'Open');
