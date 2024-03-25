import express from "express";
import prisma from "../utils/prisma.js";
// import { Prisma } from "@prisma/client";
import auth from "../middlewares/auth.js";
import { validateComment } from "../validators/comment.js";

const router = express.Router();

// 1. signed in user can comment on a specific post
router.post("/:petId", auth, async (req,res) => {
    const data = req.body;
    const petId = req.params.petId; // Access the petId from the URL

    const validationErrors = validateComment(data)

    if (Object.keys(validationErrors).length != 0) return res.status(400).send({
        error: validationErrors
    })
    
    prisma.comment.create({
        data: {
            userId: req.user.payload.id,
            petId: parseInt(petId), // Use the petId from the URL
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


// 2. users can see all comments on a specific post
router.get("/:petId", async (req,res) => {
    const petId = req.params.petId; // Access the petId from the URL
    
    try {
        // Query the database to fetch all comments for the given petId
        const comments = await prisma.comment.findMany({
            where: {
                petId: parseInt(petId),
            },
            include: {
                user:true, // Include user information for each comment
            },
        });

        // Send the comments as the response
        res.json(comments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({error: "Failed to fetch comments"});
    }
});

// 3. user who posted comment on a specific post can delete it
// router.delete("/:id", auth, async (req,res) => {
//     const commentId = req.params.id; // Access commentId from the URL

//     try {
//         // Check if the user is the author of the comment
//         const comment = await prisma.comment.findUnique({
//             where: {
//                 id: parseInt(commentId),
//             },
//             include: {
//                 user: true, // Include user information for the comment
//             },
//         });

//         if(!comment) {
//             return res.status(404).json({error: "Comment not found"});
//         }

//         if (comment.user.id !== req.user.payload.id) {
//             return res.status(403).json({error: "You are not authorized to delete this comment"});
//         }

//         // Delete comment
//         await prisma.comment.delete({
//             where: {
//                 id: parseInt(commentId),
//             },
//         });

//         res.status(200).json({ message: "Comment deleted successfully" });
//     } catch (error) {
//         console.error("Error deleting comment:", error);
//         res.status(500).json({ error: "Failed to delete comment" });
//     }
// });

export default router;