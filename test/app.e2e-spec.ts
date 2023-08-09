import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import mongoose from 'mongoose';
import { Category } from '../src/book/schemas/book.schema';

describe('Book & Auth Controller (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // beforeAll(() => {
  //   mongoose.connect(process.env.MONGODB_URL, function(){
  //     mongoose.connection.db.dropDatabase()
  //   })
  // })

  // afterAll(() => mongoose.disconnect())

  const user = {
    name: "Ceren1",
    email: "ceren1@gmail.com",
    password: '1234567'
  }

  const newBook = {
    title: "New Book",
    description: "Book description",
    author: "Author",
    price: 100,
    category: Category.CLASSICS,
  };

  let jwtToken: string = '';
  let bookCreated;

  describe('Auth', () => {
    it('(POST) - Register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send(user)
        .expect(201)
        .then((res) => {
          expect(res.body.token).toBeDefined();
        })
    });

    it('(POST) - Login user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: user.email, password: user.password })
        .expect(200)
        .then((res) => {
          expect(res.body.token).toBeDefined();
          jwtToken = res.body.token;
        })
    });
  })

  describe('Book', () => {
    it('(POST) - Create a new book', () => {
      return request(app.getHttpServer())
        .post('/books')
        .set('Authorization','Bearer ' + jwtToken)
        .send(newBook)
        .expect(201)
        .then((res) => {
          expect(res.body._id).toBeDefined();
          expect(res.body.title).toEqual(newBook.title);
          bookCreated = res.body;
        })
    });

    it('(GET) - Get all books', () => {
      return request(app.getHttpServer())
        .get('/books')
        .expect(200)
        .then((res) => {
          expect(res.body.length).toBe(1);
        })
    });

    it('(GET) - Get a book by ID', () => {
      return request(app.getHttpServer())
        .get(`/books/${bookCreated?._id}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeDefined();
          expect(res.body._id).toEqual(bookCreated._id)
        })
    });

    it('(PUT) - Update a Book by ID', async () => {
      const book = { title: 'Updated name' };
      return request(app.getHttpServer())
        .put(`/books/${bookCreated?._id}`)
        .set('Authorization', 'Bearer ' + jwtToken)
        .send(book)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.title).toEqual(book.title);
        });
    });

    it('(DELETE) - Delete a Book by ID', async () => {
      return request(app.getHttpServer())
        .delete(`/books/${bookCreated?._id}`)
        .set('Authorization', 'Bearer ' + jwtToken)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.deleted).toEqual(true);
        });
    });
  })


});
