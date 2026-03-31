export const inventoryItems = [
  { id: 1, title: "Atlas of the Ancient World", category: "Map", description: "Detailed atlas covering Mediterranean civilizations from 3000 BCE to 500 CE", era: "Ancient", region: "Mediterranean", format: "Folio", condition: "Good", quantity: 1, price: 2400.00, dateAcquired: "2025-12-15" },
  { id: 2, title: "The Canterbury Tales — First Illustrated Edition", category: "Book", description: "Rare illustrated edition of Chaucer's Canterbury Tales, woodcut prints", era: "Medieval", region: "England", format: "Quarto", condition: "Fair", quantity: 1, price: 8500.00, dateAcquired: "2025-11-20" },
  { id: 3, title: "Nova Scotia Coastal Survey 1782", category: "Map", description: "British naval survey of the Nova Scotia coastline during the American Revolution", era: "18th Century", region: "Atlantic Canada", format: "Sheet", condition: "Good", quantity: 2, price: 1800.00, dateAcquired: "2026-01-05" },
  { id: 4, title: "The Gentleman's Magazine Vol. XII", category: "Periodical", description: "Complete volume of The Gentleman's Magazine, 1742", era: "18th Century", region: "England", format: "Octavo", condition: "Fine", quantity: 1, price: 950.00, dateAcquired: "2026-01-18" },
  { id: 5, title: "Birds of America — Plate 42", category: "Book", description: "Hand-colored engraving from Audubon's Birds of America, depicting the Purple Martin", era: "19th Century", region: "North America", format: "Double Elephant Folio", condition: "Fine", quantity: 1, price: 12000.00, dateAcquired: "2025-10-30" },
  { id: 6, title: "Map of Upper and Lower Canada 1815", category: "Map", description: "Detailed political map showing townships and settlements post-War of 1812", era: "19th Century", region: "Canada", format: "Folio", condition: "Poor", quantity: 1, price: 600.00, dateAcquired: "2026-02-01" },
  { id: 7, title: "Encyclopédie — Plate Volume III", category: "Book", description: "Diderot's Encyclopédie plate volume covering mechanical arts and trades", era: "18th Century", region: "France", format: "Folio", condition: "Good", quantity: 1, price: 3200.00, dateAcquired: "2025-09-14" },
  { id: 8, title: "The Illustrated London News — 1860 Bound", category: "Periodical", description: "Full year bound volume of The Illustrated London News, 1860", era: "19th Century", region: "England", format: "Folio", condition: "Fair", quantity: 1, price: 450.00, dateAcquired: "2026-02-10" },
  { id: 9, title: "Ptolemy's Geographia — 1540 Reprint", category: "Map", description: "Basel reprint of Ptolemy's world maps with hand-colored engravings", era: "Renaissance", region: "Europe", format: "Folio", condition: "Good", quantity: 1, price: 5600.00, dateAcquired: "2025-08-22" },
  { id: 10, title: "Canadian Almanac and Directory 1899", category: "Periodical", description: "Annual reference containing statistics, government listings, and trade data", era: "19th Century", region: "Canada", format: "Octavo", condition: "Fair", quantity: 3, price: 180.00, dateAcquired: "2026-02-18" },
];

export const contacts = [
  { id: 1, firstName: "Margaret", lastName: "Whitfield", phone: "902-555-0142", email: "m.whitfield@eastcoastbooks.ca", street: "214 Barrington Street", city: "Halifax", province: "NS", postalCode: "B3J 1Y2", roles: ["Customer", "Collector"], dealerType: null, specialties: [] },
  { id: 2, firstName: "Thomas", lastName: "Beaulieu", phone: "514-555-0198", email: "tbeaulieu@montrealauctions.com", street: "88 Rue Saint-Paul", city: "Montreal", province: "QC", postalCode: "H2Y 1G7", roles: ["Dealer"], dealerType: "Auction House", specialties: [{ category: "Book", era: "18th Century", region: "France", format: "Folio" }, { category: "Map", era: "Renaissance", region: "Europe", format: "Folio" }] },
  { id: 3, firstName: "Susan", lastName: "Park", phone: "416-555-0233", email: "spark@parkantiques.ca", street: "55 Queen Street West", city: "Toronto", province: "ON", postalCode: "M5H 2M8", roles: ["Dealer", "Collector"], dealerType: "Emporium", specialties: [{ category: "Map", era: "19th Century", region: "Canada", format: "Sheet" }] },
  { id: 4, firstName: "James", lastName: "Macintyre", phone: "902-555-0177", email: "jmacintyre@dal.ca", street: "6299 South Street", city: "Halifax", province: "NS", postalCode: "B3H 4R2", roles: ["Customer"], dealerType: null, specialties: [] },
  { id: 5, firstName: "Eleanor", lastName: "Chambers", phone: "613-555-0321", email: "eleanor.chambers@gmail.com", street: "12 Rideau Canal Lane", city: "Ottawa", province: "ON", postalCode: "K1N 8S7", roles: ["Estate Contact"], dealerType: null, specialties: [] },
  { id: 6, firstName: "Robert", lastName: "Fong", phone: "604-555-0456", email: "rfong@pacificrarebooks.com", street: "1122 Granville Street", city: "Vancouver", province: "BC", postalCode: "V6Z 1L2", roles: ["Dealer"], dealerType: "Brokerage", specialties: [{ category: "Book", era: "19th Century", region: "North America", format: "Octavo" }, { category: "Periodical", era: "19th Century", region: "England", format: "Folio" }] },
  { id: 7, firstName: "Claire", lastName: "Dumont", phone: "418-555-0289", email: "cdumont@antiquaria.ca", street: "340 Grande Allée", city: "Quebec City", province: "QC", postalCode: "G1R 2H8", roles: ["Dealer", "Customer"], dealerType: "Individual", specialties: [{ category: "Book", era: "Medieval", region: "England", format: "Quarto" }] },
  { id: 8, firstName: "William", lastName: "Thornton", phone: "506-555-0134", email: "wthornton@nbhistory.org", street: "77 King Street", city: "Saint John", province: "NB", postalCode: "E2L 1G5", roles: ["Customer", "Collector"], dealerType: null, specialties: [] },
];

export const purchases = [
  { id: 1, contactId: 2, date: "2025-12-15", acquisitionType: "Dealer", donationNote: "", lineItems: [{ itemId: 1, quantity: 1, price: 2100.00 }] },
  { id: 2, contactId: 5, date: "2025-11-20", acquisitionType: "Estate", donationNote: "Three volumes of poetry donated to Dalhousie University Library per estate instructions.", lineItems: [{ itemId: 2, quantity: 1, price: 7200.00 }] },
  { id: 3, contactId: 3, date: "2026-01-05", acquisitionType: "Dealer", donationNote: "", lineItems: [{ itemId: 3, quantity: 2, price: 1500.00 }, { itemId: 6, quantity: 1, price: 400.00 }] },
  { id: 4, contactId: 7, date: "2026-01-18", acquisitionType: "Individual", donationNote: "", lineItems: [{ itemId: 4, quantity: 1, price: 800.00 }] },
  { id: 5, contactId: 6, date: "2025-10-30", acquisitionType: "Dealer", donationNote: "", lineItems: [{ itemId: 5, quantity: 1, price: 10500.00 }] },
  { id: 6, contactId: 2, date: "2026-02-10", acquisitionType: "Dealer", donationNote: "", lineItems: [{ itemId: 8, quantity: 1, price: 350.00 }, { itemId: 10, quantity: 3, price: 120.00 }] },
];

export const sales = [
  { id: 1, contactId: 1, date: "2026-01-10", lineItems: [{ itemId: 7, quantity: 1, price: 3800.00 }] },
  { id: 2, contactId: 4, date: "2026-01-25", lineItems: [{ itemId: 9, quantity: 1, price: 6200.00 }] },
  { id: 3, contactId: 8, date: "2026-02-05", lineItems: [{ itemId: 3, quantity: 1, price: 2100.00 }] },
  { id: 4, contactId: 1, date: "2026-02-14", lineItems: [{ itemId: 4, quantity: 1, price: 1100.00 }, { itemId: 10, quantity: 1, price: 220.00 }] },
  { id: 5, contactId: 3, date: "2026-02-20", lineItems: [{ itemId: 8, quantity: 1, price: 550.00 }] },
];

export const marketPrices = [
  { id: 1, itemId: 1, condition: "Good", price: 2400.00, dateChecked: "2026-02-01", source: "Auction House" },
  { id: 2, itemId: 1, condition: "Fine", price: 3100.00, dateChecked: "2026-02-01", source: "Dealer Catalogue" },
  { id: 3, itemId: 2, condition: "Fair", price: 8500.00, dateChecked: "2026-01-15", source: "Auction House" },
  { id: 4, itemId: 2, condition: "Good", price: 11000.00, dateChecked: "2026-01-15", source: "Website" },
  { id: 5, itemId: 3, condition: "Good", price: 1800.00, dateChecked: "2026-01-20", source: "Dealer Catalogue" },
  { id: 6, itemId: 5, condition: "Fine", price: 12000.00, dateChecked: "2025-12-10", source: "Auction House" },
  { id: 7, itemId: 5, condition: "Good", price: 9500.00, dateChecked: "2025-12-10", source: "Website" },
  { id: 8, itemId: 9, condition: "Good", price: 5600.00, dateChecked: "2026-02-15", source: "Phone Quote" },
  { id: 9, itemId: 1, condition: "Good", price: 2200.00, dateChecked: "2025-10-15", source: "Website" },
  { id: 10, itemId: 1, condition: "Good", price: 2350.00, dateChecked: "2025-12-01", source: "Auction House" },
  { id: 11, itemId: 5, condition: "Fine", price: 11500.00, dateChecked: "2025-09-20", source: "Auction House" },
  { id: 12, itemId: 2, condition: "Fair", price: 8000.00, dateChecked: "2025-08-05", source: "Website" },
];

export const specialRequests = [
  { id: 1, contactId: 1, description: "Looking for a first edition of Susanna Moodie's 'Roughing It in the Bush' in Good or better condition.", dateRequested: "2026-01-08", status: "Open" },
  { id: 2, contactId: 4, description: "Seeking any 18th-century maps of Prince Edward Island or Cape Breton.", dateRequested: "2025-12-20", status: "Open" },
  { id: 3, contactId: 8, description: "Wants bound volumes of The Maritime Farmer magazine, any year before 1900.", dateRequested: "2025-11-15", status: "Fulfilled" },
  { id: 4, contactId: 3, description: "Looking for Audubon prints — any North American bird species, plates 1 through 100, in Fine condition.", dateRequested: "2026-02-12", status: "Open" },
];
