package com.univ.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import com.univ.dto.BidUpdateDTO;

@Controller
public class BidWebSocketController {

    @MessageMapping("/bid")
    @SendTo("/topic/bid")
    public BidUpdateDTO sendBidUpdate(BidUpdateDTO bid) {

        return bid;
    }
}