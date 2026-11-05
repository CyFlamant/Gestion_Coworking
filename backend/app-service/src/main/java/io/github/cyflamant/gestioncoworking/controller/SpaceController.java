package io.github.cyflamant.gestioncoworking.controller;

import io.github.cyflamant.gestioncoworking.dto.SpaceResponse;
import io.github.cyflamant.gestioncoworking.service.SpaceService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/spaces")
public class SpaceController {

    private final SpaceService spaceService;

    public SpaceController(SpaceService spaceService) {
        this.spaceService = spaceService;
    }

    @GetMapping("/{id}")
    public SpaceResponse findById(@PathVariable Integer id) {
        return SpaceResponse.from(spaceService.findById(id));
    }

}
