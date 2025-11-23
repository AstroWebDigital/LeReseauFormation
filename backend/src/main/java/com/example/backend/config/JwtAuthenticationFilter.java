package com.example.backend.config;

import com.example.backend.service.CustomUserDetailsService;
import com.example.backend.service.JwtService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. On récupère le header Authorization
        final String authHeader = request.getHeader("Authorization");
        String jwt = null;
        String userEmail = null;

        // Si pas de header ou ne commence pas par "Bearer ", on laisse passer la requête telle quelle
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. On extrait le token sans le "Bearer "
        jwt = authHeader.substring(7);

        // 3. On essaye d’en extraire l’email (subject)
        try {
            userEmail = jwtService.extractUsername(jwt);
        } catch (JwtException ex) { // ExpiredJwtException est déjà un JwtException
            // ⛔ Token expiré OU invalide → on NE bloque PAS la requête
            System.out.println("JWT expiré ou invalide : " + ex.getMessage());
            filterChain.doFilter(request, response);
            return;
        }

        // 4. Si on a bien un userEmail et que personne n’est encore authentifié dans le contexte :
        if (userEmail != null &&
                SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

            // isTokenValid(token, username) → on passe le username, pas l'objet UserDetails
            if (jwtService.isTokenValid(jwt, userDetails.getUsername())) {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 5. On continue la chaîne
        filterChain.doFilter(request, response);
    }
}
