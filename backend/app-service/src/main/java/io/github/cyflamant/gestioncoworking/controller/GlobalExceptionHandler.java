package io.github.cyflamant.gestioncoworking.controller;

import io.github.cyflamant.gestioncoworking.service.InvalidSlotException;
import io.github.cyflamant.gestioncoworking.service.SpaceHasBookingsException;
import io.github.cyflamant.gestioncoworking.service.SpaceNotFoundException;
import tools.jackson.core.JacksonException;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

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
            return invalidField(cause.getPath().getLast().getPropertyName(), "Valeur invalide");
        }
        // Syntax error or empty body: no field to point at
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Format JSON invalide");
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ProblemDetail handleMissingParameter(MissingServletRequestParameterException ex) {
        return invalidField(ex.getParameterName(), "Champ obligatoire");
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ProblemDetail handleParameterTypeMismatch(MethodArgumentTypeMismatchException ex) {
        // A query parameter Spring can't convert (bad date, unknown enum constant)
        return invalidField(ex.getName(), "Valeur invalide");
    }

    @ExceptionHandler(InvalidSlotException.class)
    public ProblemDetail handleInvalidSlot(InvalidSlotException ex) {
        return invalidField("end", ex.getMessage());
    }

    @ExceptionHandler(SpaceHasBookingsException.class)
    public ProblemDetail handleSpaceHasBookings(SpaceHasBookingsException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ProblemDetail handleAccessDenied(AccessDeniedException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Accès refusé");
    }

    private ProblemDetail invalidField(String field, String message) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Données invalides");
        problem.setProperty("errors", Map.of(field, message));
        return problem;
    }

}
