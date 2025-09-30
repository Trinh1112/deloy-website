package com.coffeeshop.service;

import com.coffeeshop.config.JwtTokenProvider;
import com.coffeeshop.dto.LoginRequest;
import com.coffeeshop.dto.RegisterRequest;
import com.coffeeshop.dto.TokenResponse;
import com.coffeeshop.dto.UserDTO;
import com.coffeeshop.entity.RefreshToken;
import com.coffeeshop.entity.Role;
import com.coffeeshop.entity.User;
import com.coffeeshop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
//AuthService là một lớp service trong ứng dụng,
// chịu trách nhiệm xử lý các tác vụ liên quan đến xác thực và quản lý người dùng:
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;

    public AuthService(AuthenticationManager authenticationManager, JwtTokenProvider jwtTokenProvider, UserRepository userRepository, BCryptPasswordEncoder passwordEncoder, RefreshTokenService refreshTokenService) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional
    //Xử lý đăng nhập, xác thực thông tin người dùng và trả về access token và refresh token.
    public TokenResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password())
        );
        String accessToken = jwtTokenProvider.generateToken(authentication);
        User user = userRepository.findByEmail(loginRequest.email())
                .orElseThrow(() -> new RuntimeException("User not found"));
        System.out.println("Deleting old refresh tokens for user: " + user.getId());
        refreshTokenService.deleteByUserId(user.getId());
        System.out.println("Creating new refresh token for user: " + user.getId());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
        System.out.println("Refresh token created: " + refreshToken.getToken());
        return new TokenResponse(accessToken, refreshToken.getToken());
    }

    public String register(RegisterRequest registerRequest) {
        if (userRepository.findByEmail(registerRequest.email()).isPresent()) {//ktra email exists
            throw new RuntimeException("Email already exists.");
        }

        User user = new User();
        user.setName(registerRequest.name());////gán các thuộc tính
        user.setPhoneNumber(registerRequest.phoneNumber());
        user.setEmail(registerRequest.email());
        user.setPassword(passwordEncoder.encode(registerRequest.password()));
        user.setRole(Role.CUSTOMER);//gán rode mặc định

        userRepository.save(user);
        return "User registered successfully.";
    }

    @Transactional
    public TokenResponse refreshToken(String refreshToken) {
        System.out.println("Refreshing token: " + refreshToken);
        RefreshToken token = refreshTokenService.findByToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));
        refreshTokenService.verifyExpiration(token);//để kiểm tra xem refresh token còn hiệu lực hay không
        String accessToken = jwtTokenProvider.generateTokenFromUsername(token.getUser().getEmail());
        refreshTokenService.deleteByUserId(token.getUser().getId());//cũ
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(token.getUser().getId());//mới
        System.out.println("New refresh token created: " + newRefreshToken.getToken());
        return new TokenResponse(accessToken, newRefreshToken.getToken());
    }
//Lấy thông tin người dùng hiện tại dựa trên JWT.
    public UserDTO getCurrentUser(String token) {
        String email = jwtTokenProvider.getUsernameFromJWT(token);//lấy email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new UserDTO(user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }
}