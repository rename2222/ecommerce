package com.example.demo.service;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
@Service
public class UserService {
    @Autowired
    private UserRepository userRepo;

    public List<User> getAllUser(){
        return userRepo.findAll()   ;
    }
    public Optional<User> getUserById(String id){
        return userRepo.findById(id);
    }
    public User createUser(User user){
        return  (User) userRepo.save(user);
    }
    public User updateUser(String id, User userDetails) {
        Optional<User> user = userRepo.findById(id);
        if (user.isPresent()) {
            User existingUser = user.get();
            existingUser.setUsername(userDetails.getUsername());
            existingUser.setEmail(userDetails.getEmail());
            existingUser.setPassword(userDetails.getPassword());
            existingUser.setRole(userDetails.getRole());
            existingUser.setEnabled(userDetails.isEnabled());
            return (User) userRepo.save(existingUser);
        }
        return null;
    }
    public boolean deleteUser(String id){
        Optional<User> user = getUserById(id);
        if(!user.isPresent()){
            userRepo.deleteById(id);
            return true;
        }
        return false;


    }

    public Optional<User> getUserByemail(String email) {
        return userRepo.findByemail(email);
    }
}
