import express from "express";
import prisma from "../utils/prisma.js";
import { Prisma } from "@prisma/client";
import auth from "../middlewares/auth.js";

const router = express.Router();


//1. sign in user can upload post
router.post("/",auth,async (req,res) => {
    const data = req.body;
    
    prisma.pet.create({
        data: {
            userId:req.user.payload.id,
            ...data, 
        }
    })
    .then((pet) => {
        return res.json(pet);
    })
    .catch((err) => {
        if (
            err instanceof Prisma.PrismaClientKnownRequestError && err.code ==="P2002") {
                const formattedError = {};
                formattedError[`${err.meta.target[0]}`] = "already taken";

                return res.status(500).send({
                    error:formattedError,  //error handling
                });
            }
            throw err; // if this happens, our backend application will crash and not respond to the client. because we don't recognize this error yet, we don't know how to handle it in a friendly manner. we intentionally throw an error so that the error monitoring service we'll use in production will notice this error and notify us and we can then add error handling to take care of previously unforeseen errors.
    });
});

//2. everyone can view all posts
router.get("/",async (req,res) => {
    const allpetposts = await prisma.pet.findMany();
    res.json (allpetposts);
});

//3. view pet post by petId (individual post)
router.get("/:id",async (req,res) =>{
    const petId = parseInt(req.params.id);
    const petPostByUser = await prisma.pet.findUnique({
        where:{
            id: petId,
        },
    });
    res.json(petPostByUser);
});

//4. sign in user can view post by pet status = lost
router.get("/lost",async (req,res) => {
    try{
    const lostPetPosts = await prisma.pet.findMany({
        where:{
            pet_status: 'lost' // Filter by pet_status = 'lost'
        }
    });
    res.json(lostPetPosts);
} catch (error) {
    console.error("Error retrieving lost pet posts:", error);
    res.status(500).json({error: "Internal Server Error"});
}
});

//5. sign in user can view post by pet status = found
router.get("/found",async (req,res) => {
    try{
    const foundPetPosts = await prisma.pet.findMany({
        where:{
            pet_status: 'found' // Filter by pet_status = 'found'
        }
    });
    res.json(foundPetPosts);
} catch (error) {
    console.error("Error retrieving found pet posts:", error);
    res.status(500).json({error: "Internal Server Error"});
}
});

//6. user who upload post can update post by petId
router.put("/:id", auth, async (req, res) => {
    //to retrive petId from req parameters
    const petId = parseInt(req.paras.id);
    //to retrive updated pet data from req body
    const petData = req.body;

    const currentPetPost = await prisma.pet.findUnique({
        where:{
            id: petId,
        },
    });
    //if petpost not found,return 404
    if(!currentPetPost) {
        return res.status(404).send({ error: "Post not found" });
  }

    //update pet data in database
    const updatePet = await prisma.pet.update({
        where:{
            id: petId,
        },
        data: petData,
    });
    return res.status(200).json(updatePet);
});

//7. user who upload post can delete post by petId
router.delete("/:id", async (req,res) => {
    const petId = parseInt(req.params.id);
    const petData = await prisma.pet.findUnique({
        where:{
            id:petId,
        },
    });
    if (!pet) {
        return res.status(404).send({ error: "Post not found" });
      }
      // Perform actions when the user is authorized
      //  delete the image
      await prisma.pet.delete({
        where: {
          id: petId,
        },
      });
      // Send a success response
      return res.status(200).send({ message: "Post deleted successfully" });
    });


//8. user can view own posts posted by userId
router.get("/users/:id",auth, async (req,res) => {
    try{
    const userId = parseInt(req.user.payload.id);
    const pet = await prisma.pet.findMany({
        where:{
            userId : userId,
        },
    });
    return res.json(pet);
} catch (error) {
    console.error("Error retrieving pet post by user ID", error);
    return res.status(500).send({error: "Internal Server Error"});
}
});

export default router;