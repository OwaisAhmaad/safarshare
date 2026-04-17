import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicle.dto';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(ownerId: number, createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const vehicle = this.vehicleRepository.create({
      ...createVehicleDto,
      owner_id: ownerId,
    });
    return this.vehicleRepository.save(vehicle);
  }

  async findAllByOwner(ownerId: number): Promise<Vehicle[]> {
    return this.vehicleRepository.find({
      where: { owner_id: ownerId },
    });
  }

  async findOne(id: number): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }
    return vehicle;
  }

  async update(id: number, ownerId: number, updateVehicleDto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    if (vehicle.owner_id !== ownerId) {
      throw new ForbiddenException('You can only modify your own vehicles');
    }
    
    await this.vehicleRepository.update(id, updateVehicleDto);
    return this.findOne(id);
  }

  async remove(id: number, ownerId: number): Promise<void> {
    const vehicle = await this.findOne(id);
    if (vehicle.owner_id !== ownerId) {
      throw new ForbiddenException('You can only delete your own vehicles');
    }
    await this.vehicleRepository.softDelete(id);
  }

  async verify(id: number, verified: boolean): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    vehicle.verified = verified;
    return this.vehicleRepository.save(vehicle);
  }
}
