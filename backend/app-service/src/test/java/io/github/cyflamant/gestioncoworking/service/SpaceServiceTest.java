package io.github.cyflamant.gestioncoworking.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import io.github.cyflamant.gestioncoworking.repository.SpaceRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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

}
