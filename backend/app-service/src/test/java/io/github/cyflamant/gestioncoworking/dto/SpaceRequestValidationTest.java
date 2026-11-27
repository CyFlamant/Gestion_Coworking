package io.github.cyflamant.gestioncoworking.dto;

import static org.assertj.core.api.Assertions.assertThat;

import io.github.cyflamant.gestioncoworking.entity.Space;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import java.math.BigDecimal;

import org.junit.jupiter.api.Test;

class SpaceRequestValidationTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void negativeRateIsRejected() {
        SpaceRequest request = request(Space.SpaceType.OFFICE, new BigDecimal("-1.00"), new BigDecimal("900.00"));
        assertThat(validator.validate(request)).isNotEmpty();
    }

    @Test
    void zeroRateIsAccepted() {
        SpaceRequest request = request(Space.SpaceType.OFFICE, BigDecimal.ZERO, new BigDecimal("900.00"));
        assertThat(validator.validate(request)).isEmpty();
    }

    @Test
    void missingTypeIsRejected() {
        SpaceRequest request = request(null, new BigDecimal("10.00"), new BigDecimal("900.00"));
        assertThat(validator.validate(request))
                .extracting(ConstraintViolation::getMessage)
                .containsExactly("Champ obligatoire");
    }

    @Test
    void negativeMonthRateIsRejected() {
        SpaceRequest request = request(Space.SpaceType.OFFICE, new BigDecimal("10.00"), new BigDecimal("-1.00"));
        assertThat(validator.validate(request)).isNotEmpty();
    }

    // Bureau 1 with valid half-day and day rates
    private SpaceRequest request(Space.SpaceType type, BigDecimal hourRate, BigDecimal monthRate) {
        return new SpaceRequest("Bureau 1", type, hourRate, new BigDecimal("35.00"), new BigDecimal("60.00"),
                monthRate);
    }

}
