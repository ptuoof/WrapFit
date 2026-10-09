import { Module } from '@nestjs/common';
import { StorageMaintenanceTask } from './storage-maintenance.task';

/** API process only (AppModule): the worker imports StorageModule too, and one process running the sweep is enough. */
@Module({ providers: [StorageMaintenanceTask] })
export class StorageMaintenanceModule {}
