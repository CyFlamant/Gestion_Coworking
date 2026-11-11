package io.github.cyflamant.gestioncoworking.controller;

import io.github.cyflamant.gestioncoworking.service.SpaceHasBookingsException;
import io.github.cyflamant.gestioncoworking.service.SpaceNotFoundException;
import tools.jackson.core.JacksonException;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(SpaceNotFoundException.class)
    public ProblemDetail handleSpaceNotFound(SpaceNotFoundException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errors.putIfAbsent(error.getField(), error.getDefaultMessage()));

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Données invalides");
        problem.setProperty("errors", errors);
        return problem;
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ProblemDetail handleUnreadableBody(HttpMessageNotReadableException ex) {
        // A field has a value Jackson can't convert (wrong type, unknown enum constant)
        if (ex.getCause() instanceof JacksonException cause && !cause.getPath().isEmpty()) {
            String field = cause.getPath().getLast().getPropertyName();
            ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Données invalides");
            problem.setProperty("errors", Map.of(field, "Valeur invalide"));
            return problem;
        }
        // Syntax error or empty body: no field to point at
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Format JSON invalide");
    }

    @ExceptionHandler(SpaceHasBookingsException.class)
    public ProblemDetail handleSpaceHasBookings(SpaceHasBookingsException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
    }

}
