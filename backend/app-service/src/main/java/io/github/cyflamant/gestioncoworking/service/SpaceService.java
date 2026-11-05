package io.github.cyflamant.gestioncoworking.service;

import io.github.cyflamant.gestioncoworking.entity.Space;
import io.github.cyflamant.gestioncoworking.repository.SpaceRepository;
import org.springframework.stereotype.Service;

@Service
public class SpaceService {

    private final SpaceRepository spaceRepository;

    public SpaceService(SpaceRepository spaceRepository) {
        this.spaceRepository = spaceRepository;
    }

    public Space findById(Integer id) {
        return spaceRepository.findById(id)
                .orElseThrow(() -> new SpaceNotFoundException(id));
    }

    public Space create(Space space) {
        return spaceRepository.save(space);
    }
}
