package io.github.cyflamant.gestioncoworking.controller;

import static io.github.cyflamant.gestioncoworking.SpaceFixtures.validSpace;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.github.cyflamant.gestioncoworking.entity.Space;
import io.github.cyflamant.gestioncoworking.security.SecurityConfig;
import io.github.cyflamant.gestioncoworking.service.InvalidSlotException;
import io.github.cyflamant.gestioncoworking.service.SpaceHasBookingsException;
import io.github.cyflamant.gestioncoworking.service.SpaceNotFoundException;
import io.github.cyflamant.gestioncoworking.service.SpaceService;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(SpaceController.class)
@Import(SecurityConfig.class)
@WithMockUser(roles = "ADMIN") // default user for every test in this class
class SpaceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SpaceService spaceService;

    @Test
    void findByIdReturnsSpace() throws Exception {
        // Arrange: the service returns space 1
        Space space = validSpace();
        space.setId(1);
        when(spaceService.findById(1)).thenReturn(space);

        // Act + Assert: GET returns 200 and the space as JSON
        mockMvc.perform(get("/api/spaces/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Bureau 1"))
                .andExpect(jsonPath("$.type").value("OFFICE"))
                .andExpect(jsonPath("$.monthRate").value(900.0));
    }

    @Test
    void findByIdReturns404WhenSpaceDoesNotExist() throws Exception {
        // Arrange: the service says space 99 doesn't exist
        when(spaceService.findById(99)).thenThrow(new SpaceNotFoundException(99));

        // Act + Assert: 404 with the French message in the body
        mockMvc.perform(get("/api/spaces/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Espace introuvable : 99"));
    }

    @Test
    void createReturns201WithCreatedSpace() throws Exception {
        // Arrange: the service gives the new space id 1, like the DB would
        when(spaceService.create(any(Space.class))).thenAnswer(invocation -> {
            Space space = invocation.getArgument(0);
            space.setId(1);
            return space;
        });

        // Act + Assert
        mockMvc.perform(post("/api/spaces")
                .contentType(MediaType.APPLICATION_JSON)
                .content(validSpaceJson()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Bureau 1"))
                .andExpect(jsonPath("$.type").value("OFFICE"));
    }

    private String validSpaceJson() {
        return """
                {
                  "name": "Bureau 1",
                  "type": "OFFICE",
                  "hourRate": 10.00,
                  "halfDayRate": 35.00,
                  "dayRate": 60.00,
                  "monthRate": 900.00
                }
                """;
    }

    @Test
    void createReturns400WhenNameIsBlank() throws Exception {
        // Act + Assert: blank name is rejected with the French message for that field
        mockMvc.perform(post("/api/spaces")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        { "name": "", "type": "OFFICE",
                          "hourRate": 10.00, "halfDayRate": 35.00, "dayRate": 60.00, "monthRate": 900.00 }
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").value("Champ obligatoire"));

        // The service is never reached
        verify(spaceService, never()).create(any());
    }

    @Test
    void createIgnoresIdInBody() throws Exception {
        when(spaceService.create(any(Space.class))).thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(post("/api/spaces")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        { "id": 5, "name": "Bureau 1", "type": "OFFICE",
                          "hourRate": 10.00, "halfDayRate": 35.00, "dayRate": 60.00, "monthRate": 900.00 }
                        """))
                .andExpect(status().isCreated());

        // The space handed to the service has no id, so save() inserts instead of
        // overwriting space 5
        ArgumentCaptor<Space> captor = ArgumentCaptor.forClass(Space.class);
        verify(spaceService).create(captor.capture());
        assertThat(captor.getValue().getId()).isNull();
    }

    @Test
    void createReturns400WhenTypeIsUnknown() throws Exception {
        mockMvc.perform(post("/api/spaces")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        { "name": "Bureau 1", "type": "GARAGE",
                        "hourRate": 10.00, "halfDayRate": 35.00, "dayRate": 60.00, "monthRate": 900.00 }
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.type").value("Valeur invalide"));

        verify(spaceService, never()).create(any());
    }

    @Test
    void createReturns400WhenJsonIsMalformed() throws Exception {
        mockMvc.perform(post("/api/spaces")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{ \"name\": \"Bureau 1\","))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Format JSON invalide"));

        verify(spaceService, never()).create(any());
    }

    @Test
    void findAllReturnsAllSpaces() throws Exception {
        Space office = validSpace();
        office.setId(1);
        Space room = validSpace();
        room.setId(2);
        room.setName("Salle 1");
        room.setType(Space.SpaceType.ROOM);
        when(spaceService.findAll()).thenReturn(List.of(office, room));

        mockMvc.perform(get("/api/spaces"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name").value("Bureau 1"))
                .andExpect(jsonPath("$[1].name").value("Salle 1"));
    }

    @Test
    void updateReturnsUpdatedSpace() throws Exception {
        when(spaceService.update(eq(1), any(Space.class))).thenAnswer(invocation -> {
            Space space = invocation.getArgument(1);
            space.setId(1);
            return space;
        });

        mockMvc.perform(put("/api/spaces/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(validSpaceJson()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Bureau 1"));
    }

    @Test
    void updateReturns404WhenSpaceDoesNotExist() throws Exception {
        when(spaceService.update(eq(99), any(Space.class))).thenThrow(new SpaceNotFoundException(99));

        mockMvc.perform(put("/api/spaces/99")
                .contentType(MediaType.APPLICATION_JSON)
                .content(validSpaceJson()))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteReturns204() throws Exception {
        mockMvc.perform(delete("/api/spaces/1"))
                .andExpect(status().isNoContent());

        verify(spaceService).delete(1);
    }

    @Test
    void deleteReturns404WhenSpaceDoesNotExist() throws Exception {
        doThrow(new SpaceNotFoundException(99)).when(spaceService).delete(99);

        mockMvc.perform(delete("/api/spaces/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteReturns409WhenSpaceHasBookings() throws Exception {
        doThrow(new SpaceHasBookingsException("Bureau 1")).when(spaceService).delete(1);

        mockMvc.perform(delete("/api/spaces/1"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Impossible de supprimer l'espace « Bureau 1 » : il a des réservations"));
    }

    @Test
    @WithMockUser(roles = "CLIENT") // overrides the class-level ADMIN
    void createReturns403ForClient() throws Exception {
        mockMvc.perform(post("/api/spaces")
                .contentType(MediaType.APPLICATION_JSON)
                .content(validSpaceJson()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.detail").value("Accès refusé"));

        verify(spaceService, never()).create(any());
    }

    @Test
    @WithMockUser(roles = "CLIENT")
    void findAllIsAllowedForClient() throws Exception {
        mockMvc.perform(get("/api/spaces"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "CLIENT")
    void updateReturns403ForClient() throws Exception {
        mockMvc.perform(put("/api/spaces/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(validSpaceJson()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.detail").value("Accès refusé"));

        verify(spaceService, never()).update(any(), any());
    }

    @Test
    @WithMockUser(roles = "CLIENT")
    void deleteReturns403ForClient() throws Exception {
        mockMvc.perform(delete("/api/spaces/1"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.detail").value("Accès refusé"));

        verify(spaceService, never()).delete(any());
    }

    @Test
    void findAvailableReturnsFreeSpaces() throws Exception {
        // Arrange: the service answers only for the exact slot and type of the request
        Space space = validSpace();
        space.setId(1);
        when(spaceService.findAvailable(LocalDateTime.of(2026, 12, 1, 9, 0), LocalDateTime.of(2026, 12, 1, 13, 0),
                Space.SpaceType.OFFICE)).thenReturn(List.of(space));

        mockMvc.perform(get("/api/spaces/available")
                .param("start", "2026-12-01T09:00:00")
                .param("end", "2026-12-01T13:00:00")
                .param("type", "OFFICE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("Bureau 1"));
    }

    @Test
    @WithAnonymousUser // visitors can search too
    void findAvailableIsAllowedForGuestWithoutType() throws Exception {
        when(spaceService.findAvailable(any(), any(), any())).thenReturn(List.of(validSpace()));

        mockMvc.perform(get("/api/spaces/available")
                .param("start", "2026-12-01T09:00:00")
                .param("end", "2026-12-01T13:00:00"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        verify(spaceService).findAvailable(any(), any(), isNull()); // no type: every type
    }

    @Test
    void findAvailableReturns400WhenStartIsMissing() throws Exception {
        mockMvc.perform(get("/api/spaces/available")
                .param("end", "2026-12-01T13:00:00"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Données invalides"))
                .andExpect(jsonPath("$.errors.start").value("Champ obligatoire"));

        verify(spaceService, never()).findAvailable(any(), any(), any());
    }

    @Test
    void findAvailableReturns400WhenDateIsInvalid() throws Exception {
        mockMvc.perform(get("/api/spaces/available")
                .param("start", "demain")
                .param("end", "2026-12-01T13:00:00"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Données invalides"))
                .andExpect(jsonPath("$.errors.start").value("Valeur invalide"));
    }

    @Test
    void findAvailableReturns400WhenTypeIsUnknown() throws Exception {
        mockMvc.perform(get("/api/spaces/available")
                .param("start", "2026-12-01T09:00:00")
                .param("end", "2026-12-01T13:00:00")
                .param("type", "CAVE"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Données invalides"))
                .andExpect(jsonPath("$.errors.type").value("Valeur invalide"));
    }

    @Test
    void findAvailableReturns400WhenEndIsNotAfterStart() throws Exception {
        when(spaceService.findAvailable(any(), any(), any())).thenThrow(new InvalidSlotException());

        mockMvc.perform(get("/api/spaces/available")
                .param("start", "2026-12-01T13:00:00")
                .param("end", "2026-12-01T09:00:00"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Données invalides"))
                .andExpect(jsonPath("$.errors.end").value("La fin doit être après le début"));
    }

}
