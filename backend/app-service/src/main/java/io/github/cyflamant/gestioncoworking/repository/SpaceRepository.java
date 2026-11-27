package io.github.cyflamant.gestioncoworking.repository;

import io.github.cyflamant.gestioncoworking.entity.Space;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SpaceRepository extends JpaRepository<Space, Integer> {

    // Spaces with no booking overlapping [start, end); a null type means every type.
    // A booking that ends when the slot starts (or starts when it ends) does not overlap.
    @Query("""
            select s from Space s
            where (:type is null or s.type = :type)
              and not exists (select b from Booking b
                              where b.space = s and b.startDateTime < :end and b.endDateTime > :start)
            order by s.id
            """)
    List<Space> findAvailable(LocalDateTime start, LocalDateTime end, Space.SpaceType type);

}
