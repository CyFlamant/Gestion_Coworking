package io.github.cyflamant.gestioncoworking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
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
    @NotNull(message = "Champ obligatoire")
    private BigDecimal hourRate;

    @Column(name = "half_day_rate", precision = 6, scale = 2)
    @NotNull(message = "Champ obligatoire")
    private BigDecimal halfDayRate;

    @Column(name = "day_rate", precision = 6, scale = 2)
    @NotNull(message = "Champ obligatoire")
    private BigDecimal dayRate;

    @Column(name = "name")
    @NotBlank(message = "Champ obligatoire")
    private String name;

    @OneToMany(mappedBy = "space")
    private List<Booking> bookings = new ArrayList<>();

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

    public List<Booking> getBookings() {
        return bookings;
    }

    public void setBookings(List<Booking> bookings) {
        this.bookings = bookings;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

}
