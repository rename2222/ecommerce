package com.example.demo.contoller;

import com.example.demo.entity.User;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    private UserService userService;
    @GetMapping
    public List<User> geAllUser(){
        return userService.getAllUser();
    }
    @PostMapping
    public User createUser(@RequestBody User user){
        return userService.createUser(user);
    }
    @GetMapping("/{id}")
    public ResponseEntity<User> UserById(@PathVariable String id){
        Optional<User> user = userService.getUserById(id);
        return user.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());

    }
    @GetMapping("/email/{email}")
    public ResponseEntity<User> userByEmail(@PathVariable String email ){
        Optional<User> user = userService.getUserByemail(email);
        return user.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id){
          userService.deleteUser(id);
          return ResponseEntity.ok().build();
    }

}














































