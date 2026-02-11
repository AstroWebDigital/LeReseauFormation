package com.example.backend.service;

import com.example.backend.entity.Alp; // 💡 NOUVEL IMPORT
import com.example.backend.entity.Vehicle;
import com.example.backend.entity.User;
import com.example.backend.repository.VehicleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.UUID;

@Service
public class VehicleService {

    private static final int DEFAULT_PAGE_SIZE = 20;
    // La valeur doit correspondre à la String utilisée dans la DB
    private static final String AVAILABLE_STATUS = "disponible";

    private final VehicleRepository vehicleRepository;

    // Si vous avez besoin d'un service pour Alp/User plus complexe, injectez-le ici.
    // private final AlpService alpService;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    /**
     * Crée un nouveau véhicule. Le lie à l'entité Alp de l'utilisateur connecté.
     */
    @Transactional
    public Vehicle createVehicle(Vehicle vehicle, User owner) {
        // 1. Vérification d'éligibilité (le lien ALP existe et est valide)
        Alp ownerAlp = owner.getAlp(); // Supposé disponible via l'entité User
        if (ownerAlp == null) {
            // Vous pourriez ajouter une vérification de statut Alp ici (ex: isVerified)
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "L'utilisateur doit avoir un compte Alp validé pour ajouter un véhicule.");
        }

        // 2. Initialisation des champs système
        vehicle.setAlp(ownerAlp); // 💡 Lier le véhicule à l'ALP de l'utilisateur
        vehicle.setStatus(AVAILABLE_STATUS); // Définit le statut par défaut
        vehicle.setListingDate(LocalDate.now()); // Définit la date de mise en ligne

        return vehicleRepository.save(vehicle);
    }

    /**
     * Met à jour un véhicule existant.
     */
    @Transactional
    public Vehicle updateVehicle(UUID id, Vehicle vehicleDetails, User currentUser) {
        Vehicle existingVehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Véhicule non trouvé."));

        // Vérification d'autorisation : Seul le propriétaire (via ALP) peut modifier
        if (!existingVehicle.getAlp().getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'êtes pas autorisé à modifier ce véhicule.");
        }

        // Mise à jour des champs transférés du DTO
        existingVehicle.setBrand(vehicleDetails.getBrand());
        existingVehicle.setModel(vehicleDetails.getModel());
        existingVehicle.setPlateNumber(vehicleDetails.getPlateNumber());
        existingVehicle.setType(vehicleDetails.getType());
        existingVehicle.setFuel(vehicleDetails.getFuel());
        existingVehicle.setTransmission(vehicleDetails.getTransmission());
        existingVehicle.setBaseDailyPrice(vehicleDetails.getBaseDailyPrice());
        existingVehicle.setMileage(vehicleDetails.getMileage());
        existingVehicle.setDefaultParkingLocation(vehicleDetails.getDefaultParkingLocation());

        // Mise à jour des champs optionnels/système
        if (vehicleDetails.getStatus() != null) {
            existingVehicle.setStatus(vehicleDetails.getStatus());
        }
        if (vehicleDetails.getLastMaintenanceDate() != null) {
            existingVehicle.setLastMaintenanceDate(vehicleDetails.getLastMaintenanceDate());
        }
        // NOTE: On ne devrait pas permettre de changer Alp ou ListingDate via un PUT classique

        return vehicleRepository.save(existingVehicle);
    }

    /**
     * Supprime un véhicule.
     */
    @Transactional
    public void deleteVehicle(UUID id, User currentUser) {
        Vehicle existingVehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Véhicule non trouvé."));

        // Vérification d'autorisation : Seul le propriétaire (via ALP) peut supprimer
        if (!existingVehicle.getAlp().getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'êtes pas autorisé à supprimer ce véhicule.");
        }

        vehicleRepository.delete(existingVehicle);
    }

    /**
     * Récupère un véhicule par son ID.
     */
    public Vehicle getVehicleById(UUID id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Véhicule non trouvé."));
    }

    /**
     * Récupère la liste des véhicules disponibles (logique demandée).
     */
    public Page<Vehicle> getAvailableVehicles(int page, int size) {
        int pageSize = (size > 0 && size <= DEFAULT_PAGE_SIZE) ? size : DEFAULT_PAGE_SIZE;

        // Tri par 'listingDate' décroissant (le plus récent en premier)
        Sort sort = Sort.by("listingDate").descending();

        Pageable pageable = PageRequest.of(page, pageSize, sort);

        return vehicleRepository.findByStatus(AVAILABLE_STATUS, pageable);
    }

    public Page<Vehicle> getVehiclesByAlpId(UUID alpId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return vehicleRepository.findByAlpId(alpId, pageable);
    }

    public Page<Vehicle> getVehiclesByUserId(UUID userId, int page, int size) {
        return vehicleRepository.findByAlpUserId(userId, PageRequest.of(page, size));
    }
}