package io.github.cyflamant.gestioncoworking.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.github.cyflamant.gestioncoworking.entity.Space;
import io.github.cyflamant.gestioncoworking.repository.SpaceRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;

@ExtendWith(MockitoExtension.class)
class SpaceServiceTest {

    @Mock
    private SpaceRepository spaceRepository;

    @InjectMocks
    private SpaceService spaceService;

    @Test
    void findByIdThrowsWhenSpaceDoesNotExist() {
        when(spaceRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> spaceService.findById(99))
                .isInstanceOf(SpaceNotFoundException.class)
                .hasMessage("Espace introuvable : 99");

    }

    @Test
    void findByIdReturnsSpaceWhenItExists() {
        Space space = new Space();
        when(spaceRepository.findById(1)).thenReturn(Optional.of(space));

        assertThat(spaceService.findById(1)).isSameAs(space);

    }

    @Test
    void createSavesAndReturnsSpace() {
        Space space = validSpace();
        when(spaceRepository.save(space)).thenReturn(space);

        Space created = spaceService.create(space);

        assertThat(created).isSameAs(space);
        verify(spaceRepository).save(space);
    }

    private Space validSpace() {
        Space space = new Space();
        space.setName("Bureau 1");
        space.setType(Space.SpaceType.OFFICE);
        space.setHourRate(new BigDecimal("10.00"));
        space.setHalfDayRate(new BigDecimal("35.00"));
        space.setDayRate(new BigDecimal("60.00"));
        return space;
    }

}
