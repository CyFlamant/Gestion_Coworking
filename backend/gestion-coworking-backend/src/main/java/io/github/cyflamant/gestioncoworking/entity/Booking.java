/**
 *
 * @author CFlamant
 */

package io.github.cyflamant.gestioncoworking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;



@Entity
@Table(name="bookings")
public class Booking {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name="start_date_time")
    @NotNull(message = "Champ obligatoire")
    private LocalDateTime startDateTime;    
    
    @Column(name="end_date_time")
    @NotNull(message = "Champ obligatoire")
    private LocalDateTime endDateTime;     


}
