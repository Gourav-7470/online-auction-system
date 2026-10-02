package com.univ.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.univ.entity.User;
import com.univ.repository.UserRepository;

@Service
public class UserService {

	
	@Autowired
	private UserRepository userRepository;
	
	@Autowired
	private PasswordEncoder passwordEncoder;
	
	
	public User registerUser(User user) {
		
		//Check username is already registered or not
		if(userRepository.findByUsername(user.getUsername()).isPresent()) {
			throw new RuntimeException("Username already exists");
		}
		
		//Set Password and doest save in plain text in DB
		user.setPassword(passwordEncoder.encode(user.getPassword()));
		
		//Normal Registration ka default role
		if (user.getRole() == null || user.getRole().isBlank()) {
			user.setRole("USER");
		}
		
		return userRepository.save(user);
	}
	
	public User findByEmail(String email) {
		
		
		//Search by email
		return userRepository.findByEmail(email).orElse(null);
	}

	public User findByUsername(String username) {
		
		return userRepository.findByUsername(username).orElse(null);
	}
	

}


