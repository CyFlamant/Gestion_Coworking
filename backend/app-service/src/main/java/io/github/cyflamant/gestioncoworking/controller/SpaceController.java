package io.github.cyflamant.gestioncoworking.controller;

import io.github.cyflamant.gestioncoworking.dto.SpaceRequest;
import io.github.cyflamant.gestioncoworking.dto.SpaceResponse;
import io.github.cyflamant.gestioncoworking.entity.Space;
import io.github.cyflamant.gestioncoworking.service.SpaceService;
import jakarta.validation.Valid;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
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

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public SpaceResponse create(@Valid @RequestBody SpaceRequest request) {
        return SpaceResponse.from(spaceService.create(request.toEntity()));
    }

    @GetMapping
    public List<SpaceResponse> findAll() {
        return spaceService.findAll().stream()
                .map(SpaceResponse::from)
                .toList();
    }

    // Free spaces between start and end (local ISO date-times, e.g. 2026-12-01T09:00:00), optionally of one type.
    // The fixed path takes priority over /{id}.
    @GetMapping("/available")
    public List<SpaceResponse> findAvailable(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(required = false) Space.SpaceType type) {
        return spaceService.findAvailable(start, end, type).stream()
                .map(SpaceResponse::from)
                .toList();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public SpaceResponse update(@PathVariable Integer id, @Valid @RequestBody SpaceRequest request) {
        return SpaceResponse.from(spaceService.update(id, request.toEntity()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        spaceService.delete(id);
    }

}
