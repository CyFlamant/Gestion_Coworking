package io.github.cyflamant.gestioncoworking.dto;

import io.github.cyflamant.gestioncoworking.entity.Space;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public record SpaceRequest(
        @NotBlank(message = "Champ obligatoire") String name,

        @NotNull(message = "Champ obligatoire") Space.SpaceType type,

        @NotNull(message = "Champ obligatoire") @PositiveOrZero(message = "Le tarif ne peut pas être négatif") BigDecimal hourRate,

        @NotNull(message = "Champ obligatoire") @PositiveOrZero(message = "Le tarif ne peut pas être négatif") BigDecimal halfDayRate,

        @NotNull(message = "Champ obligatoire") @PositiveOrZero(message = "Le tarif ne peut pas être négatif") BigDecimal dayRate,

        @NotNull(message = "Champ obligatoire") @PositiveOrZero(message = "Le tarif ne peut pas être négatif") BigDecimal monthRate) {

    public Space toEntity() {
        Space space = new Space();
        space.setName(name);
        space.setType(type);
        space.setHourRate(hourRate);
        space.setHalfDayRate(halfDayRate);
        space.setDayRate(dayRate);
        space.setMonthRate(monthRate);
        return space;
    }

}
