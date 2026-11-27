-- Demo spaces for the development database: the same seven spaces as the front end's mock
-- (frontend/app/src/lib/mock/db.js). Never run it on a production database.
--
-- Run by hand from backend/app-service, once Flyway has created the tables (start the app once):
--   C:\xampp\mysql\bin\mysql.exe -u root gestion_coworking -e "source dev-data/demo-spaces.sql"
--
-- A space whose name already exists is left as it is, so running the script again adds nothing.

INSERT INTO spaces (name, type, hour_rate, half_day_rate, day_rate, month_rate)
SELECT demo.name, demo.type, demo.hour_rate, demo.half_day_rate, demo.day_rate, demo.month_rate
FROM (
    SELECT 'Openspace 1' AS name, 'OPENSPACE' AS type, 4 AS hour_rate, 14 AS half_day_rate, 25 AS day_rate, 250 AS month_rate
    UNION ALL SELECT 'Openspace 2', 'OPENSPACE', 4, 14, 25, 250
    UNION ALL SELECT 'Openspace 3', 'OPENSPACE', 4, 14, 25, 250
    UNION ALL SELECT 'Bureau 1', 'OFFICE', 9, 30, 50, 700
    UNION ALL SELECT 'Bureau 2', 'OFFICE', 9, 30, 50, 700
    UNION ALL SELECT 'Salle Atelier', 'ROOM', 25, 80, 140, 2000
    UNION ALL SELECT 'Salle Studio', 'ROOM', 35, 110, 190, 2800
) AS demo
WHERE NOT EXISTS (SELECT 1 FROM spaces WHERE spaces.name = demo.name);
