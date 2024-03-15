import { PrismaClient, Prisma } from '@prisma/client'
import request from "supertest"
import app from "../../app.js"

//a function to clean test database
async function cleanupDatabase() {
    const prisma = new PrismaClient();
    const modelNames = Prisma.dmmf.datamodel.models.map((model) => model.name); //retrieve all schema models

    return Promise.all(
        modelNames.map((modelName) => prisma[modelName.toLowerCase()].deleteMany()) //delete all records
    );
}

//declare the endpoint we are using
describe("POST /users", () => {
    const user = {
        name: 'John',
        email: 'john9@example.com',
        password: 'insecure',
    }

    //clear test DB before testing
    beforeAll(async () => {
        await cleanupDatabase()
    })

    //clear test DB after testing
    afterAll(async () => {
        await cleanupDatabase()
    })

    //run test case
    it("with valid data should return 200", async () => { //stating test name
        const response = await request(app) //making http request
            .post("/users")
            .send(user) //sending object as payload
            .set('Accept', 'application/json') //expect JSON response

        //expect response to be what we hardcode
        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBeTruthy(); //id to not be false/undefined/null //added () on my own.
        expect(response.body.name).toBe(user.name);
        expect(response.body.email).toBe(user.email);
        expect(response.body.password).toBe(undefined); //not wanting password to be returned, hence setting it as undefined
    });

    it("with same email should fail", async () => {
        const response = await request(app)
            .post("/users")
            .send(user)
            .set('Accept', 'application/json')
        expect(response.statusCode).toBe(500);
        expect(response.body.error).toBeTruthy();
        expect(response.body.error.email).toBe('email already taken');
    });

    it("with invalid password should fail", async () => {
        user.email = "unique@example.com"
        user.password = "short"
        const response = await request(app)
            .post("/users")
            .send(user)
            .set('Accept', 'application/json')
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBeTruthy();
        expect(response.body.error.password).toBe('should be at least 8 characters');
    });

    //my turn
    it("with invalid email format should fail", async () => {
        user.email = "wrongformat.example-com"
        const response = await request(app)
            .post("/users")
            .send(user)
            .set('Accept', 'application/json')
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBeTruthy();
        expect(response.body.error.email).toBe('format is invalid');
    });

    it("with blank name should fail", async () => {
        user.name = ""
        const response = await request(app)
            .post("/users")
            .send(user)
            .set('Accept', 'application/json')
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBeTruthy();
        expect(response.body.error.name).toBe('cannot be blank');
    });
})