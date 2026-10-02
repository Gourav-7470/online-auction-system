package com.univ.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.univ.entity.User;
import com.univ.service.JwtService;
import com.univ.service.UserService;

@RestController
public class UserController {

	private final PasswordEncoder passwordEncoder;

	@Autowired
	private JwtService jwtService;

	@Autowired
	private UserService userService;

	UserController(PasswordEncoder passwordEncoder) {
		this.passwordEncoder = passwordEncoder;
	}
	
	//Test
	@GetMapping("/test")
	public String test() {
		return "JWT AUTHENTICATION SUCCUSFULL";
	}

	// Register Method
	@PostMapping("/register")
	public User registerUser(@RequestBody User user) {

		return userService.registerUser(user);
	}
//
//	// Login Method
//	@PostMapping("/login")
//	public String login(@RequestBody User user) {
//		
//		System.out.println("LOGIN METHOD CALLED");
//
//		User existingUser = userService.findByUsername(user.getUsername());
//
//		if (existingUser == null) {
//			System.out.println("USER NOT FOUND");
//			return "User not found";
//		}
//		if (!passwordEncoder.matches(user.getPassword(), existingUser.getPassword())) {
//			System.out.println("INVALID PASSWORD");
//			return "Invalid Password";
//		}
//
//		String token = jwtService.generationToken(existingUser.getUsername(), existingUser.getRole());
//
//		System.out.println("GENERATED TOKEN = " + token);
//
//		return token;
//	}

	@PostMapping("/login")
	public String login(@RequestBody User user) {

	    User existingUser = userService.findByUsername(user.getUsername());

	    if (existingUser == null) {
	        return "User not found";
	    }

	    if (!passwordEncoder.matches(
	            user.getPassword(),
	            existingUser.getPassword())) {
	        return "Invalid Password";
	    }

	    String token = jwtService.generationToken(
	            existingUser.getUsername(),
	            existingUser.getRole()
	    );

	    System.out.println("================================");
	    System.out.println("USERNAME : " + existingUser.getUsername());
	    System.out.println("ROLE     : " + existingUser.getRole());
	    System.out.println("TOKEN    : " + token);
	    System.out.println("================================");

	    return token;
	}
	@GetMapping("/user/dashboard")
	public String userDashboard() {
		return "USER DASHBOARD";
	}
	@GetMapping("/admin/dashboard")
	public String adminDashboard() {
		return "ADMIN DASHBOARD";
	}
}
