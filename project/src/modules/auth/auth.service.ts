import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import axios from 'axios';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { AuthLoginDto, AuthRegisterDto, AuthUpdateDto } from 'src/dto/auth.dto';
import { QueryParams } from 'src/dto/request.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: AuthRegisterDto) {
    try {
      const saltRounds = 10;

      const checkEmail = await this.prisma.user.findFirst({
        where: {
          email: registerDto.email,
        },
      });
      if (checkEmail) {
        throw new Error('Email already exists');
      }

      const bcryptPassword = await bcrypt.hash(
        registerDto.password,
        saltRounds,
      );
      const user = await this.prisma.user.create({
        data: {
          name: registerDto.name,
          email: registerDto.email,
          password: bcryptPassword,
        },
      });

      if (!user) {
        throw new Error('Failed to create user');
      }
      const profileURL = `${process.env.SVC_DB_PROFILE}/api/v1/profile?userId=${user.id}`;

      const profile = await axios.post(profileURL, {
        authorId: user.id,
        display_name: user.name,
        gender: '',
        birthday: new Date('0000-00-00'),
        horoscope: '',
        zodiac: '',
        height: 0,
        weight: 0,
        image: '',
      });

      return user;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Unexpected error occurred';
      const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(message, status);
    }
  }

  async findAll(params: QueryParams) {
    let QueryArr = [];

    // const skip = params.per_page * (params.page - 1);
    const take = params.per_page;

    if (params.username) {
      QueryArr.push({
        name: params.username,
      });
    }

    const [total_data, datas] = await this.prisma.$transaction([
      this.prisma.user.count({
        where: {
          AND: QueryArr,
        },
      }),
      this.prisma.user.findMany({
        where: {
          AND: QueryArr,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
        take,
        orderBy: {
          id: params.sort,
        },
      }),
    ]);

    return {
      datas,
      total_data,
    };
  }

  async login(authLoginDto: AuthLoginDto, res: Response) {
    try {
      const checkEmail = await this.prisma.user.findFirst({
        where: {
          email: authLoginDto.email,
        },
      });

      if (!checkEmail) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Invalid email or password',
        });
      }

      const passwordMatch = await bcrypt.compare(
        authLoginDto.password,
        checkEmail?.password ?? '',
      );

      if (!passwordMatch) {
        throw new Error('Invalid email or password');
      }

      const payload = {
        id: checkEmail.id,
        email: checkEmail.email,
        name: checkEmail.name,
      };

      const token = await this.jwtService.signAsync(
        { payload },
        { expiresIn: '10000000h' },
      );
      return {
        payload,
        access_token: token,
      };
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Unexpected error occurred';
      const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(message, status);
    }
  }

  async authCheck(params: QueryParams, req: Request) {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        console.error('Token is missing or invalid.');
      }
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is not set');
      }
      const compare = jwt.verify(token ?? '', jwtSecret) as {
        payload: {
          id: number;
          email: string;
          name: string;
        };
      };
      const userId = compare.payload.id;

      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

      return user;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Unexpected error occurred';
      const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(message, status);
    }
  }

  async logout(req: Request, res: Response) {
    const token = req.header('Authorization');
    if (!token) {
      console.error('Token is missing or invalid.');
    }
    const blackListToken = await this.prisma.blacklistedToken.create({
      data: {
        token: token ?? '',
        expiresAt: new Date(),
      },
    });

    return blackListToken;
  }

  async updateUser(updateDTO: AuthUpdateDto, params: QueryParams, req: any) {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        console.error('Token is missing or invalid.');
      }
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is not set');
      }
      const compare = jwt.verify(token, jwtSecret) as {
        payload: { email: string };
      };
      const email = compare.payload.email;
      if (email !== params.email) console.log('email', email);

      const arrQuery = [];
      if (params.user_id) {
        arrQuery.push({
          id: params.user_id,
        });
      }

      if (params.email) {
        arrQuery.push({
          email: params.email,
        });
      }

      const userData = await this.prisma.user.findFirst({
        where: {
          AND: arrQuery,
        },
      });

      if (!userData) {
        throw new Error('User not found');
      }
      if (updateDTO.name) {
        userData.name = updateDTO.name;
      }

      if (updateDTO.password) {
        userData.password = updateDTO.password;
      }

      const update = await this.prisma.user.update({
        where: { email: userData.email },
        data: {
          name: updateDTO.name,
          password: updateDTO.password,
        },
      });

      return update;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Unexpected error occurred';
      const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(message, status);
    }
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({ where });
  }
}
