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
describe("POST /auth", () => {
    const user = {
        email: 'matthew7@example.com',
        password: 'stronglysecured',
    }

    //clear test DB and create a user using the sign up endpoint before running tests
    beforeAll(async () => {
        await cleanupDatabase();

        const response = await request(app)
            .post("/users")
            .send({
                name: 'Matthew',
                email: 'matthew7@example.com',
                password: 'stronglysecured',
            });
    })

    //clear test DB after testing
    afterAll(async () => {
        await cleanupDatabase()
    })

    //run test case
    it("allow user with correct credentials to sign in by returning accessToken", async () => { //stating test name
        const response = await request(app) //making http request
            .post("/auth")
            .send(user) //sending object as payload
            .set('Accept', 'application/json') //expect JSON response

        //expect response to be what we hardcode
        expect(response.statusCode).toBe(200);
        expect(response.body.accessToken).toBeTruthy();
    });

    it("with wrong email should fail with statuscode 401 and no accessToken", async () => { //stating test name
        const response = await request(app) //making http request
            .post("/auth")
            .send({
                email: 'matthew@example.com',
                password: 'stronglysecured'
            }) //sending object as payload
            .set('Accept', 'application/json') //expect JSON response

        //expect response to be what we hardcode
        expect(response.statusCode).toBe(401);
        expect(response.body.accessToken).toBeFalsy();
        expect(response.body.error).toBe('Email address or password not valid');
    });

    it("with wrong password should fail with statuscode 401 and no accessToken", async () => { //stating test name
        const response = await request(app) //making http request
            .post("/auth")
            .send({
                email: 'matthew7@example.com',
                password: 'stwonglysecured'
            }) //sending object as payload
            .set('Accept', 'application/json') //expect JSON response

        //expect response to be what we hardcode
        expect(response.statusCode).toBe(401);
        expect(response.body.accessToken).toBeFalsy();
        expect(response.body.error).toBe('Email address or password not valid');
    });
})