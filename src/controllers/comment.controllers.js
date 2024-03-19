import express from "express";
import prisma from "../utils/prisma.js";
// import { Prisma } from "@prisma/client";
import auth from "../middlewares/auth.js";

const router = express.Router();

// 1. signed in user can comment on a specific post
router.post("/:petId", auth, async (req,res) => {
    const data = req.body;
    const petId = req.params.petId; // Access the petId from the URL
    
    prisma.comment.create({
        data: {
            userId:req.user.payload.id,
            petId: petId, // Use the petId from the URL
            ...data, 
        }
    })
    .then((comment) => {
        return res.json(comment);
    })
    .catch((err) => {
        // handle errors
        console.error("Error creating comment:", err);
        res.status(500).json({error: "Failed to create comment"});
    });
});

export default router;

// 2. users can see all comments on a specific post

