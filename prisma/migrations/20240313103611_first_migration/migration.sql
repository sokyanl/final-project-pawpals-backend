-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pet" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "pet_type" TEXT NOT NULL,
    "pet_breed" TEXT NOT NULL,
    "pet_colour" TEXT NOT NULL,
    "pet_gender" TEXT NOT NULL,
    "pet_age" INTEGER,
    "pet_description" TEXT NOT NULL,
    "pet_location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longtitude" DOUBLE PRECISION,
    "pet_status" TEXT NOT NULL,
    "pet_image_url" TEXT NOT NULL,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Pet_pet_image_url_key" ON "Pet"("pet_image_url");

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
