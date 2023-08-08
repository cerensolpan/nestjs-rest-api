import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";


describe('AuthController', () => {

    let authService: AuthService;
    let authController: AuthController;

    const mockUser = {
        _id: "64ccfdc34095fc087eb34560",
        name: "Ceren",
        email: "ceren@gmail.com",
    }

    let jwtToken = 'jwtToken'

    const mockAuthService = {
        signUp: jest.fn().mockResolvedValueOnce(jwtToken),
        login: jest.fn().mockResolvedValueOnce(jwtToken),
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService
                }
            ]
        }).compile()

        authService = module.get<AuthService>(AuthService);
        authController = module.get<AuthController>(AuthController);
    });

    it('should be defined', () => {
        expect(authController).toBeDefined();
    });

    describe('signUp', () => { 
        it('should register a new user',async()=>{
            const signUpDto = {
                name: "Ceren",
                email: "ceren@gmail.com",
                password: '123456'
            }

            const result = await authController.signUp(signUpDto);
            expect(authService.signUp).toHaveBeenCalled();
            expect(result).toEqual(jwtToken)
        } )
     })

     describe('login', () => { 
        it('should login user',async()=>{
            const loginDto = {
                email: "ceren@gmail.com",
                password: '123456'
            }

            const result = await authController.login(loginDto);
            expect(authService.login).toHaveBeenCalled();
            expect(result).toEqual(jwtToken)
        } )
     })

})