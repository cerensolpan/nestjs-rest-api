import { Model } from "mongoose";
import { AuthService } from "./auth.service"
import { User } from "./schemas/user.schema";
import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcryptjs';
import { ConflictException, UnauthorizedException } from "@nestjs/common";

describe('AuthService', () => {
    let authService: AuthService;
    let model: Model<User> | any;
    let jwtService: JwtService;

    let token = 'jwtToken'

    const mockUser = {
        _id: "64ccfdc34095fc087eb34560",
        name: "Ceren",
        email: "ceren@gmail.com",
    }

    const mockAuthService = {
        create: jest.fn(),
        findOne: jest.fn(),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                JwtService,
                {
                    provide: getModelToken(User.name),
                    useValue: mockAuthService
                }
            ]
        }).compile()

        authService = module.get<AuthService>(AuthService);
        model = module.get<Model<User>>(getModelToken(User.name));
        jwtService = module.get<JwtService>(JwtService);
    });

    it('should be defined', () => {
        expect(authService).toBeDefined();
    })

    describe('signUp', () => {

        const signUpDto = {
            name: "Ceren",
            email: "ceren@gmail.com",
            password: '123456'
        }
        // hash-create-sign
        it('should register the new user', async () => {
            jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
            jest.spyOn(model, 'create').mockImplementationOnce(() => Promise.resolve(mockUser));

            jest.spyOn(jwtService, 'sign').mockReturnValue('jwtToken');

            const result = await authService.signUp(signUpDto)

            expect(bcrypt.hash).toHaveBeenCalled();
            expect(result).toEqual({token})

        })

        it('should throw duplicate email entered', async () => {
            jest.spyOn(model, 'create').mockImplementationOnce(() => Promise.reject({code:11000}));

            await expect(authService.signUp(signUpDto)).rejects.toThrow(ConflictException)

        })
    })

    describe('login',()=>{

        const loginDto = {
            email: "ceren@gmail.com",
            password: '123456'
        }
        // findOne-compare-sign
        it('should login user and return the token',async()=>{
            jest.spyOn(model,'findOne').mockResolvedValueOnce(mockUser);
            jest.spyOn(bcrypt,'compare').mockResolvedValueOnce(true);
            jest.spyOn(jwtService,'sign').mockReturnValue(token);

            const result = await authService.login(loginDto);

            expect(result).toEqual({token}) 
        })

        it('should throw invalid email error',async()=>{
            jest.spyOn(model,'findOne').mockResolvedValueOnce(null);

            expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException)
        })

        it('should throw invalid password error',async()=>{
            jest.spyOn(model,'findOne').mockResolvedValueOnce(mockUser);
            jest.spyOn(bcrypt,'compare').mockResolvedValueOnce(false);

            expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException)
        })
    })
})