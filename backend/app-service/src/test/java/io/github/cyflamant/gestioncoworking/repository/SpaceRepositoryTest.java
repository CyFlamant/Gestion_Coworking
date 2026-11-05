package io.github.cyflamant.gestioncoworking.repository;

import static org.assertj.core.api.Assertions.assertThat;

import io.github.cyflamant.gestioncoworking.entity.Space;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // use MariaDB, no embedded DB
class SpaceRepositoryTest {

    @Autowired
    private SpaceRepository spaceRepository;
    @Autowired
    private TestEntityManager entityManager;

    @Test
    void savedSpaceCanBeFoundById() {
        Space space = new Space();
        space.setName("Bureau 1");
        space.setType(Space.SpaceType.OFFICE);
        space.setHourRate(new BigDecimal("10.00"));
        space.setHalfDayRate(new BigDecimal("35.00"));
        space.setDayRate(new BigDecimal("60.00"));

        Space saved = spaceRepository.saveAndFlush(space); // INSERT runs now
        entityManager.clear(); // forget cached objects

        assertThat(spaceRepository.findById(saved.getId())) // real SELECT
                .get()
                .satisfies(found -> {
                    assertThat(found).isNotSameAs(space);
                    assertThat(found.getName()).isEqualTo("Bureau 1");
                    assertThat(found.getType()).isEqualTo(Space.SpaceType.OFFICE);
                    assertThat(found.getHourRate()).isEqualByComparingTo("10.00");
                    assertThat(found.getHalfDayRate()).isEqualByComparingTo("35.00");
                    assertThat(found.getDayRate()).isEqualByComparingTo("60.00");
                });
    }

}
