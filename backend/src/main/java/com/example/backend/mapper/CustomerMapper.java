package com.example.backend.mapper;

import com.example.backend.dto.CustomerDto;
import com.example.backend.entity.Alp; // On importe l'entité Alp
import org.springframework.stereotype.Component;

@Component
public class CustomerMapper {

    public CustomerDto toDto(Alp alp) {
        if (alp == null) return null;

        return CustomerDto.builder()
                .id(alp.getId() != null ? alp.getId().toString() : null)
                // Ajoute ici les autres champs que tu as dans ton Alp et CustomerDto
                // Exemple : .companyName(alp.getCompanyName())
                .build();
    }
}