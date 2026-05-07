package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ReservedDateRangeDto {
    private String startDate; // "yyyy-MM-dd"
    private String endDate;   // "yyyy-MM-dd"
    private String status;
}
