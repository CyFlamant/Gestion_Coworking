package io.github.cyflamant.gestioncoworking.entity;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import static org.assertj.core.api.Assertions.assertThat;

class SpaceValidationTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void negativeRateIsRejected() {
        Space space = validSpace();
        space.setHourRate(new BigDecimal("-1.00"));
        assertThat(validator.validate(space)).isNotEmpty();
    }

    @Test
    void zeroRateIsAccepted() {
        Space space = validSpace();
        space.setHourRate(BigDecimal.ZERO);
        assertThat(validator.validate(space)).isEmpty();
    }

    @Test
    void missingTypeIsRejected() {
        Space space = validSpace();
        space.setType(null);
        assertThat(validator.validate(space))
                .extracting(ConstraintViolation::getMessage)
                .containsExactly("Champ obligatoire");
    }

    @Test
    void negativeMonthRateIsRejected() {
        Space space = validSpace();
        space.setMonthRate(new BigDecimal("-1.00"));
        assertThat(validator.validate(space)).isNotEmpty();
    }

    private Space validSpace() {
        Space space = new Space();
        space.setName("Bureau 1");
        space.setType(Space.SpaceType.OFFICE);
        space.setHourRate(new BigDecimal("10.00"));
        space.setHalfDayRate(new BigDecimal("35.00"));
        space.setDayRate(new BigDecimal("60.00"));
        space.setMonthRate(new BigDecimal("900.00"));
        return space;
    }

}
