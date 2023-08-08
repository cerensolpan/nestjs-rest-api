import { Test, TestingModule } from "@nestjs/testing"
import { BookService } from "./book.service"
import { Book, Category } from "./schemas/book.schema"
import { getModelToken } from "@nestjs/mongoose"
import mongoose, { Model } from "mongoose"
import { BadRequestException, NotFoundException } from "@nestjs/common"
import { CreateBookDto } from "./dto/create-book.dto"
import { User } from "../auth/schemas/user.schema"

describe('BookService', () => {

    let bookService: BookService
    let model: Model<Book> | any;

    const mockBook = {
        _id: "64ce3083fa5d977f915668f7",
        user: "64ccfdc34095fc087eb34560",
        title: "Book",
        description: "Bookdescription",
        author: "Author",
        price: 150,
        category: Category.ADVENTURE,
        createdAt: "2023-08-05T21:42:05.124Z",
        updatedAt: "2023-08-05T21:42:05.124Z",
        __v: 0
    }

    const mockUser = {
        _id: "64ccfdc34095fc087eb34560",
        name: "Ceren",
        email: "ceren@gmail.com",
    }

    const mockBookService = {
        find: jest.fn(),
        create: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findByIdAndDelete: jest.fn()
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BookService,
                {
                    provide: getModelToken(Book.name),
                    useValue: mockBookService
                }
            ]
        }).compile()

        bookService = module.get<BookService>(BookService);
        model = module.get<Model<Book>>(getModelToken(Book.name))
    });

    describe('findAll', () => {
        it('should return an array of books', async () => {
            const query = { page: '1', keyword: 'test' };

            jest.spyOn(model, 'find').mockImplementation(
                () => ({
                    limit: () => ({
                        skip: jest.fn().mockResolvedValue([mockBook])
                    })
                } as any)
            )
            const result = await bookService.findAll(query);
            expect(model.find).toHaveBeenCalledWith({
                title: {
                    $regex: 'test',
                    $options: 'i'
                }
            })
            expect(result).toEqual([mockBook])
        })
    })

    describe('create', () => {
        it('should create and return a book', async () => {
            const newBook = {
                title: "New Book",
                description: "Book description",
                author: "Author",
                price: 100,
                category: Category.CLASSICS,
            };

            jest.spyOn(model, 'create').mockImplementationOnce(() => Promise.resolve(mockBook));

            const result = await bookService.create(
                newBook as CreateBookDto,
                mockUser as User,
            )

            expect(result).toEqual(mockBook as unknown as Book);
        });
    });

    describe('findById', () => {
        it('should find and return a book by ID', async () => {
            jest.spyOn(model, 'findById').mockResolvedValue(mockBook);

            const result = await bookService.findById(mockBook._id);

            expect(model.findById).toHaveBeenCalledWith(mockBook._id);
            expect(result).toEqual(mockBook);
        })

        it('should throw BadRequestException if invalid ID is provided', async () => {
            const id = 'invalid-id';

            const isValidObjectIdMock = jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(false);

            await expect(bookService.findById(id)).rejects.toThrow(BadRequestException);

            expect(isValidObjectIdMock).toHaveBeenCalledWith(id);
            isValidObjectIdMock.mockRestore();
        })

        it('should throw NotFoundException if book is not found', async () => {
            jest.spyOn(model, 'findById').mockResolvedValue(null);

            await expect(bookService.findById(mockBook._id)).rejects.toThrow(NotFoundException);

            expect(model.findById).toHaveBeenCalledWith(mockBook._id);
        })
    })

    describe('updateById', () => {
        it('should update and return a book', async () => {
            const updatedBook = {
                ...mockBook, title: 'Updated Name'
            };
            const book = { title: 'Updated Name' };

            jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValue(updatedBook);

            const result = await bookService.updateById(
                mockBook._id, book as any
            )

            expect(model.findByIdAndUpdate).toHaveBeenCalledWith(mockBook._id, book, {
                new: true,
                runValidators: true
            });

            expect(result.title).toEqual(book.title)
        });
    });

    describe('deleteById', () => {
        it('should delete and return a book', async () => {

            jest.spyOn(model, 'findByIdAndDelete').mockResolvedValue(mockBook);

            const result = await bookService.deleteById(
                mockBook._id
            )

            expect(model.findByIdAndDelete).toHaveBeenCalledWith(mockBook._id);

            expect(result).toEqual(mockBook)
        });
    });
})