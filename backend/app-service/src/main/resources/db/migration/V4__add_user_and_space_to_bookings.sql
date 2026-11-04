ALTER TABLE bookings
    ADD COLUMN user_id CHAR(36) NOT NULL,
    ADD COLUMN space_id INT NOT NULL,
    ADD CONSTRAINT fk_bookings_space
        FOREIGN KEY (space_id) REFERENCES spaces (id);

CREATE INDEX idx_bookings_user_id ON bookings (user_id);
