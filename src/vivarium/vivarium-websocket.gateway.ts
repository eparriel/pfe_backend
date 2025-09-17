import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { VivariumService } from './vivarium.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class VivariumWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(VivariumWebSocketGateway.name);
  private readonly deviceConnections = new Map<string, Socket>();

  constructor(private readonly vivariumService: VivariumService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Nettoyer les connexions d'appareils
    for (const [deviceId, socket] of this.deviceConnections.entries()) {
      if (socket.id === client.id) {
        this.deviceConnections.delete(deviceId);
        this.logger.log(`Device ${deviceId} disconnected`);
        break;
      }
    }
  }

  @SubscribeMessage('device_register')
  async handleDeviceRegister(
    @MessageBody() data: { deviceId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { deviceId } = data;
      
      // Vérifier que le vivarium existe
      const vivarium = await this.vivariumService.getVivariumByDeviceId(deviceId);
      if (!vivarium) {
        client.emit('error', { message: 'Vivarium not found' });
        return;
      }

      // Enregistrer la connexion de l'appareil
      this.deviceConnections.set(deviceId, client);
      
      // Mettre à jour le statut en ligne
      await this.vivariumService.updateDeviceStatus(deviceId, true);
      
      // Rejoindre la room du vivarium
      client.join(`vivarium_${vivarium.id}`);
      
      this.logger.log(`Device ${deviceId} registered and connected to vivarium ${vivarium.id}`);
      
      client.emit('device_registered', { 
        vivariumId: vivarium.id,
        message: 'Device registered successfully' 
      });

      // Notifier les clients de l'application mobile
      this.server.to(`vivarium_${vivarium.id}`).emit('device_online', {
        deviceId,
        vivariumId: vivarium.id,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this.logger.error(`Error registering device: ${error.message}`);
      client.emit('error', { message: 'Failed to register device' });
    }
  }

  @SubscribeMessage('device_heartbeat')
  async handleDeviceHeartbeat(
    @MessageBody() data: { deviceId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { deviceId } = data;
      
      // Mettre à jour le statut de l'appareil
      await this.vivariumService.updateDeviceStatus(deviceId, true);
      
      this.logger.debug(`Heartbeat received from device ${deviceId}`);
      
    } catch (error) {
      this.logger.error(`Error processing heartbeat: ${error.message}`);
    }
  }

  @SubscribeMessage('command_executed')
  async handleCommandExecuted(
    @MessageBody() data: { commandId: number; success: boolean; errorMessage?: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { commandId, success, errorMessage } = data;
      
      // Mettre à jour le statut de la commande
      const status = success ? 'EXECUTED' : 'FAILED';
      await this.vivariumService.updateCommandStatus(commandId, status as any, errorMessage);
      
      this.logger.log(`Command ${commandId} ${status.toLowerCase()}`);
      
      // Notifier les clients de l'application mobile
      this.server.emit('command_status_update', {
        commandId,
        status,
        errorMessage,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this.logger.error(`Error updating command status: ${error.message}`);
    }
  }

  @SubscribeMessage('join_vivarium')
  async handleJoinVivarium(
    @MessageBody() data: { vivariumId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { vivariumId } = data;
      
      // Rejoindre la room du vivarium
      client.join(`vivarium_${vivariumId}`);
      
      this.logger.log(`Client ${client.id} joined vivarium ${vivariumId}`);
      
      client.emit('joined_vivarium', { 
        vivariumId,
        message: 'Successfully joined vivarium room' 
      });

    } catch (error) {
      this.logger.error(`Error joining vivarium: ${error.message}`);
      client.emit('error', { message: 'Failed to join vivarium' });
    }
  }

  @SubscribeMessage('leave_vivarium')
  async handleLeaveVivarium(
    @MessageBody() data: { vivariumId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { vivariumId } = data;
      
      // Quitter la room du vivarium
      client.leave(`vivarium_${vivariumId}`);
      
      this.logger.log(`Client ${client.id} left vivarium ${vivariumId}`);
      
      client.emit('left_vivarium', { 
        vivariumId,
        message: 'Successfully left vivarium room' 
      });

    } catch (error) {
      this.logger.error(`Error leaving vivarium: ${error.message}`);
      client.emit('error', { message: 'Failed to leave vivarium' });
    }
  }

  // Méthodes pour envoyer des notifications aux clients
  async notifySensorDataUpdate(vivariumId: number, sensorData: any) {
    this.server.to(`vivarium_${vivariumId}`).emit('sensor_data_update', {
      vivariumId,
      sensorData,
      timestamp: new Date().toISOString(),
    });
  }

  async notifyNewCommand(vivariumId: number, command: any) {
    this.server.to(`vivarium_${vivariumId}`).emit('new_command', {
      vivariumId,
      command,
      timestamp: new Date().toISOString(),
    });
  }

  async notifyDeviceOffline(deviceId: string, vivariumId: number) {
    this.server.to(`vivarium_${vivariumId}`).emit('device_offline', {
      deviceId,
      vivariumId,
      timestamp: new Date().toISOString(),
    });
  }

  // Méthode pour envoyer une commande à un appareil spécifique
  async sendCommandToDevice(deviceId: string, command: any) {
    const deviceSocket = this.deviceConnections.get(deviceId);
    if (deviceSocket) {
      deviceSocket.emit('execute_command', command);
      this.logger.log(`Command sent to device ${deviceId}`);
      return true;
    } else {
      this.logger.warn(`Device ${deviceId} is not connected`);
      return false;
    }
  }
}

