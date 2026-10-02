//package com.univ;
//
//import org.springframework.boot.SpringApplication;
//
//import org.springframework.boot.autoconfigure.SpringBootApplication;
//
//@SpringBootApplication
//public class OnlineAuctionSystemApplication {
//
//	public static void main(String[] args) {
//		SpringApplication.run(OnlineAuctionSystemApplication.class, args);
//}
//}
package com.univ;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class OnlineAuctionSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(OnlineAuctionSystemApplication.class, args);
    }
}