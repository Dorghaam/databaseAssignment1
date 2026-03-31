-- creates all the small lookup tables that other tables reference

CREATE TABLE reading_role (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(30) NOT NULL
);

INSERT INTO reading_role (role_name) VALUES
  ('Customer'),
  ('Collector'),
  ('Dealer'),
  ('Estate Contact');


CREATE TABLE reading_dealer_type (
  dealer_type_id SERIAL PRIMARY KEY,
  type_name VARCHAR(50) NOT NULL
);

INSERT INTO reading_dealer_type (type_name) VALUES
  ('Auction House'),
  ('Brokerage'),
  ('Emporium'),
  ('Individual');


CREATE TABLE reading_category (
  category_id SERIAL PRIMARY KEY,
  category_name VARCHAR(50) NOT NULL
);

INSERT INTO reading_category (category_name) VALUES
  ('Book'),
  ('Map'),
  ('Periodical');


CREATE TABLE reading_condition (
  condition_id SERIAL PRIMARY KEY,
  condition_name VARCHAR(20) NOT NULL
);

INSERT INTO reading_condition (condition_name) VALUES
  ('Fine'),
  ('Good'),
  ('Fair'),
  ('Poor');


CREATE TABLE reading_acquisition_type (
  acquisition_type_id SERIAL PRIMARY KEY,
  type_name VARCHAR(50) NOT NULL
);

INSERT INTO reading_acquisition_type (type_name) VALUES
  ('Individual'),
  ('Dealer'),
  ('Estate');
