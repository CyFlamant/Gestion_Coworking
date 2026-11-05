package io.github.cyflamant.gestioncoworking.service;

import io.github.cyflamant.gestioncoworking.entity.Space;
import io.github.cyflamant.gestioncoworking.repository.SpaceRepository;

import java.util.List;

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

    public List<Space> findAll() {
        return spaceRepository.findAll();
    }

    public Space update(Integer id, Space changes) {
        Space existing = findById(id);
        existing.setName(changes.getName());
        existing.setType(changes.getType());
        existing.setHourRate(changes.getHourRate());
        existing.setHalfDayRate(changes.getHalfDayRate());
        existing.setDayRate(changes.getDayRate());

        return spaceRepository.save(existing);
    }

}
