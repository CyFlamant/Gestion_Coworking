package io.github.cyflamant.gestioncoworking.dto;

import io.github.cyflamant.gestioncoworking.entity.Space;

import java.math.BigDecimal;

public record SpaceResponse(
        Integer id,
        String name,
        Space.SpaceType type,
        BigDecimal hourRate,
        BigDecimal halfDayRate,
        BigDecimal dayRate) {

    public static SpaceResponse from(Space space) {
        return new SpaceResponse(
                space.getId(),
                space.getName(),
                space.getType(),
                space.getHourRate(),
                space.getHalfDayRate(),
                space.getDayRate());
    }

}
