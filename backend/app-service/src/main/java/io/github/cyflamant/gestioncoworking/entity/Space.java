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

    @OneToMany(mappedBy = "space")
    private List<Booking> bookings = new ArrayList<>();
}
