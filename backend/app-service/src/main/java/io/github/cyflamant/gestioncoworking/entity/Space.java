package io.github.cyflamant.gestioncoworking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

/**
 * A space that can be booked (open-space seat, office or meeting room), with its rates.
 * The values are validated on the request (SpaceRequest); the database constraints are the last safety net.
 *
 * @author CFlamant
 */
@Entity
@Table(name = "spaces")
public class Space {

    public enum SpaceType {
        OPENSPACE, OFFICE, ROOM
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "type")
    @Enumerated(EnumType.STRING)
    private SpaceType type;

    @Column(name = "hour_rate", precision = 6, scale = 2)
    private BigDecimal hourRate;

    @Column(name = "half_day_rate", precision = 6, scale = 2)
    private BigDecimal halfDayRate;

    @Column(name = "day_rate", precision = 6, scale = 2)
    private BigDecimal dayRate;

    @Column(name = "month_rate", precision = 8, scale = 2)
    private BigDecimal monthRate;

    @Column(name = "name")
    private String name;

    // Copies everything but the id
    public void updateFrom(Space changes) {
        name = changes.name;
        type = changes.type;
        hourRate = changes.hourRate;
        halfDayRate = changes.halfDayRate;
        dayRate = changes.dayRate;
        monthRate = changes.monthRate;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public SpaceType getType() {
        return type;
    }

    public void setType(SpaceType type) {
        this.type = type;
    }

    public BigDecimal getHourRate() {
        return hourRate;
    }

    public void setHourRate(BigDecimal hourRate) {
        this.hourRate = hourRate;
    }

    public BigDecimal getHalfDayRate() {
        return halfDayRate;
    }

    public void setHalfDayRate(BigDecimal halfDayRate) {
        this.halfDayRate = halfDayRate;
    }

    public BigDecimal getDayRate() {
        return dayRate;
    }

    public void setDayRate(BigDecimal dayRate) {
        this.dayRate = dayRate;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getMonthRate() {
        return monthRate;
    }

    public void setMonthRate(BigDecimal monthRate) {
        this.monthRate = monthRate;
    }

}
