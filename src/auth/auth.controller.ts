import { Controller } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Body, Post } from "@nestjs/common/decorators";
import { AuthDto } from "./dto";
@Controller()
export class AuthController{
    constructor(private authService: AuthService) {}

    @Post('signin')
    login(@Body() dto: AuthDto) {
        return this.authService.login(dto);
    }
    @Post('signup')
    signup(@Body() dto : AuthDto) {
        return this.authService.signup(dto);
    }
}