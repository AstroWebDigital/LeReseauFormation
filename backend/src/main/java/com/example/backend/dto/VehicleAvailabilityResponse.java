package com.example.backend.dto;

import com.example.backend.entity.VehicleAvailability;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;
import java.util.UUID;

public record VehicleAvailabilityResponse(
        UUID id,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate endDate
) {
    public static VehicleAvailabilityResponse from(VehicleAvailability slot) {
        return new VehicleAvailabilityResponse(slot.getId(), slot.getStartDate(), slot.getEndDate());
    }
}
