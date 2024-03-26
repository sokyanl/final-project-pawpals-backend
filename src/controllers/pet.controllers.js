import express from "express";
import prisma from "../utils/prisma.js";
import { Prisma } from "@prisma/client";
import auth from "../middlewares/auth.js";
import { validatorPet } from "../validators/pet.js";

const router = express.Router();

// Function to geocode the address using MapTiler Geocoding API(Search by name)
async function geocodeAddress(locationName, apiKey) {
  const apiUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(
    locationName
  )}.json?key=${apiKey}`;
  //using encodeURIComponent() to handle special characters
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch data from MapTiler Geocoding API");
    }
    //if successful,parses the json response and extracts the latitude and longitude coordinates from the response data
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].geometry.coordinates;
      return { latitude, longitude };
    } else {
      throw new Error("No matching location found");
    }
  } catch (error) {
    console.error("Error geocoding address:", error);
    // throw error;
  }
}

// Endpoint to allow signed-in users to upload pet posts with geocoding
router.post("/", auth, async (req, res) => {
  const data = req.body;
  const apiKey = process.env.MAPTILER_API_KEY;
  const validationErrors = validatorPet(data);

  try {
    if (Object.keys(validationErrors).length != 0)
      return res.status(400).send({
        error: validationErrors,
      });
    // Geocode the address to obtain latitude and longitude coordinates
    const { latitude, longitude } = await geocodeAddress(
      data.pet_location,
      apiKey
    );
    // Store the pet details in the database, including the obtained coordinates
    const newPetPost = await prisma.pet.create({
      data: {
        user: { connect: { id: req.user.payload.id } },
        ...data,
        latitude,
        longitude,
      },
    });

    // Respond with the newly created pet object
    res.status(200).json(newPetPost);
  } catch (error) {
    console.error("Error adding pet:", error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const formattedError = {};
      formattedError[`${error.meta.target[0]}`] = "already taken";
      return res.status(500).send({
        error: formattedError, //error handling
      });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

// 1. sign in user can upload post DONE
// router.post("/", auth, async (req,res) => {
//     const data = req.body;
// const validationErrors = validatorPet(data);

//     prisma.pet.create({
//         data: {
//             userId:req.user.payload.id,
//             ...data,
//         }
//     })
//     .then((pet) => {
//         return res.json(pet);
//     })
//     .catch((err) => {
//         if (
//             err instanceof Prisma.PrismaClientKnownRequestError && err.code ==="P2002") {
//                 const formattedError = {};
//                 formattedError[`${err.meta.target[0]}`] = "already taken";

//                 return res.status(500).send({
//                     error:formattedError,  //error handling
//                 });
//             }
//             throw err; // if this happens, our backend application will crash and not respond to the client. because we don't recognize this error yet, we don't know how to handle it in a friendly manner. we intentionally throw an error so that the error monitoring service we'll use in production will notice this error and notify us and we can then add error handling to take care of previously unforeseen errors.
//     });
// });

//2. everyone can view all posts DONE
router.get("/", async (req, res) => {
  const allpetposts = await prisma.pet.findMany();
  res.json(allpetposts);
});

//3. sign in user can view post by pet status = lost
router.get("/lost", async (req, res) => {
  try {
    const lostPetPosts = await prisma.pet.findMany({
      where: {
        pet_status: "lost", // Filter by pet_status = 'lost'
      },
    });
    res.json(lostPetPosts);
  } catch (error) {
    console.error("Error retrieving lost pet posts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//4. sign in user can view post by pet status = found
router.get("/found", async (req, res) => {
  try {
    const foundPetPosts = await prisma.pet.findMany({
      where: {
        pet_status: "found", // Filter by pet_status = 'found'
      },
    });
    res.json(foundPetPosts);
  } catch (error) {
    console.error("Error retrieving found pet posts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 9. everyone can view post by pet status = reunited
router.get("/reunited", async (req, res) => {
  try {
    const reunitedPetPosts = await prisma.pet.findMany({
      where: {
        pet_status: "reunited",
      },
    });
    res.json(reunitedPetPosts);
  } catch (error) {
    console.error("Error retrieving reunited pet posts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//5. view pet post by petId (individual post) DONE
router.get("/:id", async (req, res) => {
  const petId = parseInt(req.params.id);
  const petPostByUser = await prisma.pet.findUnique({
    where: {
      id: petId,
    },
    include: {
      user: true,
      Comment: {
        include: {
          user: true,
        },
      },
    },
  });
  res.json(petPostByUser);
});

//6. user who upload post can update post by petId DONE
router.put("/:id", auth, async (req, res) => {
  //to retrive petId from req parameters
  const petId = parseInt(req.params.id);
  //to retrive updated pet data from req body
  const petData = req.body;
  const validationErrors = validatorPet(petData);

  if (Object.keys(validationErrors).length != 0)
      return res.status(400).send({
        error: validationErrors,
      });

  const currentPetPost = await prisma.pet.findUnique({
    where: {
      id: petId,
    },
  });
  //if petpost not found,return 404
  if (!currentPetPost) {
    return res.status(404).send({ error: "Post not found" });
  }

  //update pet data in database
  const updatePet = await prisma.pet.update({
    where: {
      id: petId,
    },
    data: petData,
  });
  return res.status(200).json(updatePet);
});

//7. user who upload post can delete post by petId DONE
router.delete("/:id", async (req, res) => {
  const petId = parseInt(req.params.id);
  const petData = await prisma.pet.findUnique({
    where: {
      id: petId,
    },
  });
  if (!petData) {
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

// //8. user can view own posts posted by userId
router.get("/users/:id", auth, async (req, res) => {
  try {
    const userId = parseInt(req.user.payload.id);
    const pet = await prisma.pet.findMany({
      where: {
        userId: userId,
      },
      include: {
        user: true,
      },
    });
    return res.json(pet);
  } catch (error) {
    console.error("Error retrieving pet post by user ID", error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

// 9. user who posted comment on a specific post can delete it
router.delete("/:id/comment", auth, async (req, res) => {
  const petId = req.params.id; // Access petId from the URL
  const commentId = req.query.commentId; // Access commentId from the query parameters

  try {
    // Check if the user is the author of the comment
    const comment = await prisma.comment.findUnique({
      where: {
        id: parseInt(commentId),
        petId: parseInt(petId),
      },
      include: {
        user: true, // Include user information for the comment
      },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.user.id !== req.user.payload.id) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this comment" });
    }

    // Delete comment
    await prisma.comment.delete({
      where: {
        id: parseInt(commentId),
      },
    });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

export default router;
