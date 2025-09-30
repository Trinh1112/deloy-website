package com.coffeeshop.service;

import com.coffeeshop.config.JwtTokenProvider;
import com.coffeeshop.entity.RefreshToken;
import com.coffeeshop.entity.User;
import com.coffeeshop.repository.RefreshTokenRepository;
import com.coffeeshop.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, UserRepository userRepository, JwtTokenProvider jwtTokenProvider) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public RefreshToken createRefreshToken(Long userId) {
        RefreshToken refreshToken = new RefreshToken();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        refreshToken.setUser(user);
        String token = jwtTokenProvider.generateRefreshToken(user.getEmail());//tạo token
        refreshToken.setToken(token);//gán thuộc tính
        refreshToken.setExpiryDate(Instant.now().plusMillis(604800000)); // 7 days
        return refreshTokenRepository.save(refreshToken);
    }
//Xác minh tính hợp lệ của refresh token
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);//hết hạn
            throw new RuntimeException("Refresh token expired");
        }
        if (!jwtTokenProvider.validateToken(token.getToken())) {//chuỗi JWT trong token.getToken() có hợp lệ không
            refreshTokenRepository.delete(token);
            throw new RuntimeException("Invalid refresh token");
        }
        return token;
     //Nếu token còn hạn và hợp lệ
    }
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    public void deleteByUserId(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }
}