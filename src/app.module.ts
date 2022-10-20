import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import config from './config/config';
import databaseConfig from './config/database.config';
import { User, UserSchema } from './schemas/user.schema';
import { UserService } from './services/user/user.service';
import { AuthService } from './services/auth/auth.service';
import { UserController } from './api/v1/user/user.controller';
import { AuthController } from './api/v1/auth/auth.controller';
import { CryptoService } from './services/crypto/crypto.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthStrategy } from './services/auth/auth.strategy';
import { SmsService } from './services/sms/sms.service';
import { AppController } from './api/v1/app/app.controller';
import { FileService } from './services/file/file.service';
import { FileController } from './api/v1/file/file.controller';
import { Vehicle, VehicleSchema } from './schemas/vehicle.schema';
import { Client, ClientSchema } from './schemas/client.schema';
import { Contract, ContractSchema } from './schemas/contract.schema';
import { VehicleType, VehicleTypeSchema } from './schemas/vehicle-type.schema';
import { VehicleTypeController } from './api/v1/vehicle-type/vehicle-type.controller';
import { VehicleTypeService } from 'src/services/vehicle-type/vehicle-type.service';
import { VehicleService } from './services/vehicle/vehicle.service';
import { ClientService } from './services/client/client.service';
import { ClientController } from './api/v1/client/client.controller';
import { VehicleController } from './api/v1/vehicle/vehicle.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config, databaseConfig],
    }),
    MongooseModule.forRoot(databaseConfig().dbUrl, {
      dbName: process.env.DB_NAME,
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Vehicle.name, schema: VehicleSchema }]),
    MongooseModule.forFeature([{ name: Client.name, schema: ClientSchema }]),
    MongooseModule.forFeature([
      { name: Contract.name, schema: ContractSchema },
    ]),
    MongooseModule.forFeature([
      { name: VehicleType.name, schema: VehicleTypeSchema },
    ]),
    JwtModule.register({
      secret: process.env.APP_SECRET,
      signOptions: { expiresIn: '10000s' },
    }),
    PassportModule,
  ],
  controllers: [
    UserController,
    AuthController,
    AppController,
    VehicleTypeController,
    FileController,
    ClientController,
    VehicleController,
  ],
  providers: [
    UserService,
    AuthService,
    AuthStrategy,
    CryptoService,
    SmsService,
    FileService,
    VehicleTypeService,
    VehicleService,
    ClientService,
  ],
})
export class AppModule {}
