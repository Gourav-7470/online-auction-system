package com.univ.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.univ.entity.User;

@Service
public class CustomUserDetailsService implements UserDetailsService {
	
	@Autowired
	private UserService userService;
	
	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException{
		
		User user= userService.findByUsername(username);
		
		if(user == null) {
			throw new UsernameNotFoundException("User not found by username: "+username);
			
		}
		String rawRole = user.getRole();
		String role = (rawRole != null && !rawRole.isBlank())
				? rawRole.replace("ROLE_", "").trim().toUpperCase()
				: "USER";

		return org.springframework.security.core.userdetails.User
				.withUsername(user.getUsername())
				.password(user.getPassword())
				.roles(role)
				.build();
	}

}
