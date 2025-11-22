package com.example.backend.service;

import com.example.backend.entity.Vehicle;
import com.example.backend.repository.VehicleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class VehicleService {

    private static final int DEFAULT_PAGE_SIZE = 20; // Limite de 20 par défaut

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    /**
     * Récupère une page de véhicules disponibles, avec pagination.
     *
     * @param page Le numéro de la page à récupérer (commence à 0).
     * @param size La taille de la page (nombre d'éléments).
     * @return Une Page<Vehicle> contenant les véhicules disponibles.
     */
    public Page<Vehicle> getAvailableVehicles(int page, int size) {
        int pageSize = (size > 0 && size <= DEFAULT_PAGE_SIZE) ? size : DEFAULT_PAGE_SIZE;
        Sort sort = Sort.by("listingDate").descending();
        Pageable pageable = PageRequest.of(page, pageSize, sort);
        String availableStatus = "disponible";
        return vehicleRepository.findByStatus(availableStatus, pageable);
    }
}