package io.github.cyflamant.gestioncoworking.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import io.github.cyflamant.gestioncoworking.entity.Booking;
import io.github.cyflamant.gestioncoworking.entity.Space;
import io.github.cyflamant.gestioncoworking.service.SpaceNotFoundException;
import io.github.cyflamant.gestioncoworking.service.SpaceService;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;

@WebMvcTest(SpaceController.class)
class SpaceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SpaceService spaceService;

    @Test
    void findByIdReturnsSpace() throws Exception {
        // Arrange: the service returns space 1
        Space space = new Space();
        space.setId(1);
        space.setName("Bureau 1");
        space.setType(Space.SpaceType.OFFICE);
        space.setHourRate(new BigDecimal("10.00"));
        space.setHalfDayRate(new BigDecimal("35.00"));
        space.setDayRate(new BigDecimal("60.00"));
        when(spaceService.findById(1)).thenReturn(space);

        // Act + Assert: GET returns 200 and the space as JSON
        mockMvc.perform(get("/api/spaces/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Bureau 1"))
                .andExpect(jsonPath("$.type").value("OFFICE"));
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
    void findByIdDoesNotExposeBookings() throws Exception {
        // Arrange: space 1 has a booking that points back to it (like a real JPA
        // relation)
        Space space = validSpace();
        space.setId(1);
        Booking booking = new Booking();
        booking.setSpace(space);
        space.getBookings().add(booking);
        when(spaceService.findById(1)).thenReturn(space);

        // Act + Assert: the JSON has no bookings field
        mockMvc.perform(get("/api/spaces/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.bookings").doesNotExist());

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
                  "dayRate": 60.00
                }
                """;
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
