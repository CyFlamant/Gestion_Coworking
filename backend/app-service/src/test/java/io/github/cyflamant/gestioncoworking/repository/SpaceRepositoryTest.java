package io.github.cyflamant.gestioncoworking.repository;

import static org.assertj.core.api.Assertions.assertThat;

import io.github.cyflamant.gestioncoworking.entity.Space;
import io.github.cyflamant.gestioncoworking.entity.Booking;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // use MariaDB, no embedded DB
class SpaceRepositoryTest {

    @Autowired
    private SpaceRepository spaceRepository;
    @Autowired
    private TestEntityManager entityManager;

    @Test
    void savedSpaceCanBeFoundById() {
        Space space = new Space();
        space.setName("Bureau 1");
        space.setType(Space.SpaceType.OFFICE);
        space.setHourRate(new BigDecimal("10.00"));
        space.setHalfDayRate(new BigDecimal("35.00"));
        space.setDayRate(new BigDecimal("60.00"));
        space.setMonthRate(new BigDecimal("900.00"));

        Space saved = spaceRepository.saveAndFlush(space); // INSERT runs now
        entityManager.clear(); // forget cached objects

        assertThat(spaceRepository.findById(saved.getId())) // real SELECT
                .get()
                .satisfies(found -> {
                    assertThat(found).isNotSameAs(space);
                    assertThat(found.getName()).isEqualTo("Bureau 1");
                    assertThat(found.getType()).isEqualTo(Space.SpaceType.OFFICE);
                    assertThat(found.getHourRate()).isEqualByComparingTo("10.00");
                    assertThat(found.getHalfDayRate()).isEqualByComparingTo("35.00");
                    assertThat(found.getDayRate()).isEqualByComparingTo("60.00");
                    assertThat(found.getMonthRate()).isEqualByComparingTo("900.00");
                });
    }

    // Slot searched by the findAvailable tests: Tuesday 1 December 2026, 9:00 to 13:00.
    // The database may already hold other spaces and bookings, so the tests only look at their own spaces.
    private static final LocalDateTime START = LocalDateTime.of(2026, 12, 1, 9, 0);
    private static final LocalDateTime END = LocalDateTime.of(2026, 12, 1, 13, 0);

    @Test
    void findAvailableLeavesOutSpaceBookedDuringSlot() {
        Space booked = persistSpace("Bureau réservé", Space.SpaceType.OFFICE);
        persistBooking(booked, START.plusHours(1), END.plusHours(1)); // 10:00-14:00 overlaps the end of the slot
        entityManager.flush();
        entityManager.clear();

        assertThat(spaceRepository.findAvailable(START, END, null))
                .extracting(Space::getId)
                .doesNotContain(booked.getId());
    }

    @Test
    void findAvailableReturnsSpaceBookedOnAnotherDay() {
        Space free = persistSpace("Bureau libre", Space.SpaceType.OFFICE);
        persistBooking(free, START.plusDays(1), END.plusDays(1));
        entityManager.flush();
        entityManager.clear();

        assertThat(spaceRepository.findAvailable(START, END, null))
                .extracting(Space::getId)
                .contains(free.getId());
    }

    @Test
    void findAvailableIgnoresBookingsThatOnlyTouchTheSlot() {
        Space space = persistSpace("Bureau voisin", Space.SpaceType.OFFICE);
        persistBooking(space, START.minusHours(1), START); // 8:00-9:00, ends when the slot starts
        persistBooking(space, END, END.plusHours(1)); // 13:00-14:00, starts when the slot ends
        entityManager.flush();
        entityManager.clear();

        assertThat(spaceRepository.findAvailable(START, END, null))
                .extracting(Space::getId)
                .contains(space.getId());
    }

    @Test
    void findAvailableFiltersByType() {
        Space room = persistSpace("Salle libre", Space.SpaceType.ROOM);
        Space office = persistSpace("Bureau libre", Space.SpaceType.OFFICE);
        entityManager.flush();
        entityManager.clear();

        List<Space> available = spaceRepository.findAvailable(START, END, Space.SpaceType.ROOM);

        assertThat(available).extracting(Space::getType).containsOnly(Space.SpaceType.ROOM);
        assertThat(available).extracting(Space::getId)
                .contains(room.getId())
                .doesNotContain(office.getId());
    }

    @Test
    void findAvailableReturnsEveryTypeWithoutType() {
        Space room = persistSpace("Salle libre", Space.SpaceType.ROOM);
        Space office = persistSpace("Bureau libre", Space.SpaceType.OFFICE);
        entityManager.flush();
        entityManager.clear();

        assertThat(spaceRepository.findAvailable(START, END, null))
                .extracting(Space::getId)
                .contains(room.getId(), office.getId());
    }

    private Space persistSpace(String name, Space.SpaceType type) {
        Space space = new Space();
        space.setName(name);
        space.setType(type);
        space.setHourRate(new BigDecimal("10.00"));
        space.setHalfDayRate(new BigDecimal("35.00"));
        space.setDayRate(new BigDecimal("60.00"));
        space.setMonthRate(new BigDecimal("900.00"));
        return entityManager.persist(space);
    }

    private void persistBooking(Space space, LocalDateTime start, LocalDateTime end) {
        Booking booking = new Booking();
        booking.setSpace(space);
        booking.setUserId(UUID.fromString("00000000-0000-0000-0000-000000000001"));
        booking.setStartDateTime(start);
        booking.setEndDateTime(end);
        entityManager.persist(booking);
    }

}
