package io.github.cyflamant.gestioncoworking;

import io.github.cyflamant.gestioncoworking.entity.Space;

import java.math.BigDecimal;

// Valid spaces for the tests, not saved
public final class SpaceFixtures {

    private SpaceFixtures() {
    }

    // Bureau 1, an office
    public static Space validSpace() {
        return space("Bureau 1", Space.SpaceType.OFFICE);
    }

    // Rates: 10.00 per hour, 35.00 per half-day, 60.00 per day, 900.00 per month
    public static Space space(String name, Space.SpaceType type) {
        Space space = new Space();
        space.setName(name);
        space.setType(type);
        space.setHourRate(new BigDecimal("10.00"));
        space.setHalfDayRate(new BigDecimal("35.00"));
        space.setDayRate(new BigDecimal("60.00"));
        space.setMonthRate(new BigDecimal("900.00"));
        return space;
    }

}
