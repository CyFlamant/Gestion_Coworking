package io.github.cyflamant.gestioncoworking.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.github.cyflamant.gestioncoworking.entity.Space;
import io.github.cyflamant.gestioncoworking.repository.SpaceRepository;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

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

    @Test
    void findAllReturnsAllSpaces() {
        // Arrange: the mock "database" contains two spaces
        Space office = validSpace();
        Space room = validSpace();
        room.setName("Salle 1");
        room.setType(Space.SpaceType.ROOM);
        when(spaceRepository.findAll()).thenReturn(List.of(office, room));

        // Act
        List<Space> spaces = spaceService.findAll();

        // Assert: same spaces, same order
        assertThat(spaces).containsExactly(office, room);
    }

    @Test
    void findAllReturnsEmptyListWhenNoSpaces() {
        // Arrange: the mock "database" is empty
        when(spaceRepository.findAll()).thenReturn(List.of());

        // Act
        List<Space> spaces = spaceService.findAll();

        // Assert: an empty list, not null
        assertThat(spaces).isEmpty();
    }

    @Test
    void updateThrowsWhenSpaceDoesNotExist() {
        when(spaceRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> spaceService.update(99, validSpace()))
                .isInstanceOf(SpaceNotFoundException.class)
                .hasMessage("Espace introuvable : 99");
        verify(spaceRepository, never()).save(any());
    }

    @Test
    void updateCopiesFieldsAndSaves() {
        Space existing = validSpace();
        when(spaceRepository.findById(1)).thenReturn(Optional.of(existing));
        when(spaceRepository.save(existing)).thenReturn(existing);

        Space changes = validSpace();
        changes.setName("Salle 2");
        changes.setType(Space.SpaceType.ROOM);
        changes.setHourRate(new BigDecimal("15.00"));
        changes.setHalfDayRate(new BigDecimal("50.00"));
        changes.setDayRate(new BigDecimal("90.00"));

        Space updated = spaceService.update(1, changes);

        assertThat(updated).isSameAs(existing);
        assertThat(updated.getName()).isEqualTo("Salle 2");
        assertThat(updated.getType()).isEqualTo(Space.SpaceType.ROOM);
        assertThat(updated.getHourRate()).isEqualByComparingTo("15.00");
        assertThat(updated.getHalfDayRate()).isEqualByComparingTo("50.00");
        assertThat(updated.getDayRate()).isEqualByComparingTo("90.00");
        verify(spaceRepository).save(existing);
    }

    @Test
    void deleteThrowsWhenSpaceDoesNotExist() {
        when(spaceRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> spaceService.delete(99))
                .isInstanceOf(SpaceNotFoundException.class)
                .hasMessage("Espace introuvable : 99");
        verify(spaceRepository, never()).delete(any());
    }

    @Test
    void deleteRemovesSpace() {
        // Arrange: space 1 exists
        Space space = validSpace();
        when(spaceRepository.findById(1)).thenReturn(Optional.of(space));

        // Act
        spaceService.delete(1);

        // Assert: the repository was asked to delete exactly this space
        verify(spaceRepository).delete(space);
    }

    @Test
    void deleteThrowsWhenSpaceHasBookings() {
        // Arrange: space 1 exists, but the DB refuses the delete (FK from bookings)
        Space space = validSpace();
        when(spaceRepository.findById(1)).thenReturn(Optional.of(space));
        doThrow(new DataIntegrityViolationException("fk_bookings_space"))
                .when(spaceRepository).delete(space);

        assertThatThrownBy(() -> spaceService.delete(1))
                .isInstanceOf(SpaceHasBookingsException.class)
                .hasMessage("Impossible de supprimer l'espace 1 : il a des réservations");
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
