-- creates all the main tables for contacts, items, purchases, sales, market prices, and special requests

CREATE TABLE reading_contact (
  contact_id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  street_address VARCHAR(100),
  city VARCHAR(50),
  province VARCHAR(50),
  postal_code VARCHAR(10)
);


CREATE TABLE reading_contact_role (
  contact_role_id SERIAL PRIMARY KEY,
  contact_id INT REFERENCES reading_contact(contact_id) ON DELETE CASCADE,
  role_id INT REFERENCES reading_role(role_id)
);


CREATE TABLE reading_dealer_info (
  dealer_info_id SERIAL PRIMARY KEY,
  contact_id INT REFERENCES reading_contact(contact_id) ON DELETE CASCADE,
  dealer_type_id INT REFERENCES reading_dealer_type(dealer_type_id)
);


CREATE TABLE reading_specialty (
  specialty_id SERIAL PRIMARY KEY,
  category_id INT REFERENCES reading_category(category_id),
  era VARCHAR(50),
  region VARCHAR(50),
  format VARCHAR(50)
);


CREATE TABLE reading_dealer_specialty (
  dealer_specialty_id SERIAL PRIMARY KEY,
  contact_id INT REFERENCES reading_contact(contact_id) ON DELETE CASCADE,
  specialty_id INT REFERENCES reading_specialty(specialty_id)
);


CREATE TABLE reading_item (
  item_id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  category_id INT REFERENCES reading_category(category_id),
  description VARCHAR(500),
  era VARCHAR(50),
  region VARCHAR(50),
  format VARCHAR(50),
  condition_id INT REFERENCES reading_condition(condition_id),
  quantity_on_hand INT NOT NULL DEFAULT 0
);


CREATE TABLE reading_purchase (
  purchase_id SERIAL PRIMARY KEY,
  contact_id INT REFERENCES reading_contact(contact_id),
  purchase_date DATE NOT NULL,
  acquisition_type_id INT REFERENCES reading_acquisition_type(acquisition_type_id),
  estate_donation_note VARCHAR(500)
);


CREATE TABLE reading_purchase_item (
  purchase_item_id SERIAL PRIMARY KEY,
  purchase_id INT REFERENCES reading_purchase(purchase_id) ON DELETE CASCADE,
  item_id INT REFERENCES reading_item(item_id),
  quantity INT NOT NULL,
  purchase_price DECIMAL(10,2) NOT NULL
);


CREATE TABLE reading_sale (
  sale_id SERIAL PRIMARY KEY,
  contact_id INT REFERENCES reading_contact(contact_id),
  sale_date DATE NOT NULL
);


CREATE TABLE reading_sale_item (
  sale_item_id SERIAL PRIMARY KEY,
  sale_id INT REFERENCES reading_sale(sale_id) ON DELETE CASCADE,
  item_id INT REFERENCES reading_item(item_id),
  quantity INT NOT NULL,
  sale_price DECIMAL(10,2) NOT NULL
);


CREATE TABLE reading_market_price (
  market_price_id SERIAL PRIMARY KEY,
  item_id INT REFERENCES reading_item(item_id),
  condition_id INT REFERENCES reading_condition(condition_id),
  price DECIMAL(10,2) NOT NULL,
  date_checked DATE NOT NULL,
  source VARCHAR(100) NOT NULL
);


CREATE TABLE reading_special_request (
  request_id SERIAL PRIMARY KEY,
  contact_id INT REFERENCES reading_contact(contact_id),
  description VARCHAR(500) NOT NULL,
  date_requested DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Open'
);
