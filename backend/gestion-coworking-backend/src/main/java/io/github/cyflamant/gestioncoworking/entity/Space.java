package io.github.cyflamant.gestioncoworking.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 *
 * @author CFlamant
 */

@Entity
@Table(name="spaces")
public class Space {
    
    public enum SpaceType {
    OpenSpace, Office, Room
}
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
}
