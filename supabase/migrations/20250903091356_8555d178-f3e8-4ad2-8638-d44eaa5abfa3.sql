-- Update concert venues and add image URLs
UPDATE concerts 
SET 
  venue = 'Coca Cola Arena',
  city = 'Dubai',
  image_url = '/src/assets/ap-dhillon-concert.png'
WHERE title = 'AP DHILLON';

UPDATE concerts 
SET 
  venue = 'Coca Cola Arena', 
  city = 'Dubai',
  image_url = '/src/assets/sunidhi-chauhan-concert.png'
WHERE title = 'SUNIDHI CHAUHAN - I AM HOME';

UPDATE concerts 
SET 
  venue = 'Al Nasr Leisureland',
  city = 'Dubai', 
  image_url = '/src/assets/agam-concert.png'
WHERE title = 'Agam Live – Arrival of the Ethereal World Tour in Dubai';