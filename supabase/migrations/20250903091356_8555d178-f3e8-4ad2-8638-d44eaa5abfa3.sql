-- Update concert venues and add image URLs
UPDATE concerts 
SET 
  venue = 'Coca Cola Arena',
  city = 'Dubai',
  image_url = 'https://coca-cola-arena.com/files/event_banner_1332__1756820617.jpg'
WHERE title = 'AP DHILLON Live in Dubai';

UPDATE concerts 
SET 
  venue = 'Coca Cola Arena', 
  city = 'Dubai',
  image_url = 'https://coca-cola-arena.com/files/event_banner_1348__1752656517.jpg'
WHERE title = 'I AM HOME';

UPDATE concerts 
SET 
  venue = 'Al Nasr Leisureland',
  city = 'Dubai', 
  image_url = 'https://cdn.platinumlist.net/upload/event/promo/56380_upload689a0ea0e4d37_1754926752-0-en1754926758.jpg.webp'
WHERE title = 'Arrival of the Ethereal World Tour';