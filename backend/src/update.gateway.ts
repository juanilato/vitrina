/*
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';


// Origen que puede usar el socket, metodos y credenciales 
@WebSocketGateway({
  cors: {
      origin: ["*"],
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
      credentials: true,
  },
})
export class UpdateGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server!: Server;

  private activeUsers = new Map<string, Set<string>>();

  constructor(
    private notificacionService: NotificacionService,
    private readonly mensajeService: MensajeService,
  ) {}

  // ========== CONEXIONES ==========

  // Método que se ejecuta cuando un cliente se conecta
  handleConnection(client: Socket) {}

  // Método que se ejecuta cuando un cliente se desconecta
  handleDisconnect(client: Socket) {
    for (const [username, socketIds] of this.activeUsers.entries()) {
      if (socketIds.has(client.id)) {
        socketIds.delete(client.id);
        if (socketIds.size === 0) {
          this.activeUsers.delete(username);
        }
        break;
      }
    }
    this.server.emit('notificacion', { tipo: "updateUsers", payload: Array.from(this.activeUsers.keys()) });
  }

  // Método para registrar un usuario (usuario asignado a un socket)
  @SubscribeMessage('registerUser')
  registerUser(client: Socket, payload: { username: string }) {
    const { username } = payload;
    if (username) {
      if (!this.activeUsers.has(username)) {
        this.activeUsers.set(username, new Set());
      }
      this.activeUsers.get(username)!.add(client.id);
      
      this.server.emit('notificacion', { tipo: "updateUsers", payload: Array.from(this.activeUsers.keys()) });
    } else {
    }
  }
  

  // ========== NOTIFICACIONES ==========

  // Metodo para manejar la creación de notificaciones y el envío a los usuarios
@SubscribeMessage('notificacion')
async handleNotificacion(
  client: Socket, 
  data: { puesto: string; jerarquia?: string[]; contenido: string; remitenteId: string, tipo: string, eliminable?: boolean, userId?: string }
) {

  if (data.userId) {
    await this.notificacionService.crearNotificacionUsuario(
      data.contenido,
      !!data.eliminable,
      data.userId,
      data.tipo,
      data.remitenteId
    );

    const socketIds = this.activeUsers.get(data.userId.toString());
    if (socketIds) {
      socketIds.forEach(socketId => {
        this.server.to(socketId).emit('notificacion', {
          tipo: "puesto",
          payload: {
            contenido: data.contenido,
            remitenteId: data.remitenteId,
            tipo: data.tipo,
          }
        });
      });
    }
  } else {
 
    const jerarquias = (Array.isArray(data.jerarquia) ? data.jerarquia : [data.jerarquia]).filter((j): j is string => typeof j === 'string' && j !== undefined);

    const { id, destinatarios } = await this.notificacionService.crearNotificacionParaJerarquias(
      data.puesto,
      jerarquias,
      data.contenido,
      data.remitenteId,
      data.tipo,
      !!data.eliminable
    );

    const payload = {
      tipo: "puesto",
      payload: { id, ...data }
    };
    

    destinatarios.forEach((usuario) => {
      const socketIds = this.activeUsers.get(usuario);
      if (socketIds) {
        socketIds.forEach(socketId => {
          this.server.to(socketId).emit('notificacion', payload);
        });
      }
    });
  }
}

  // Método para manejar la creación de mensajes  y el envío a los usuarios
  @SubscribeMessage('sendMessage')
  async handleMessage(
    client: Socket,
    payload: { remitenteId: string; destinatarioId: string; contenido: string }
  ) {
    const { remitenteId, destinatarioId, contenido } = payload;
    const mensaje = await this.mensajeService.crearMensaje(remitenteId, destinatarioId, contenido);
   
    const destinatarioSocketIds = this.activeUsers.get(destinatarioId.toString());

    if (destinatarioSocketIds) {
      destinatarioSocketIds.forEach(socketId => {
        this.server.to(socketId).emit('notificacion', { tipo: "mensaje", payload: mensaje });
        this.server.to(socketId).emit('notificacion', {
          tipo: "usuario",
          payload: {
            contenido: mensaje.contenido,
            remitenteId: mensaje.remitenteId,
            tipo: "mensaje"
          }
        });
      });
    } else {
    }
  }

  // Metodo para manejar el estado de mensaje leido en usuario
  @SubscribeMessage('mensajeLeido')
  async handleMensajeLeido(
    client: Socket,
    mensaje: { id: string; remitenteId: string; destinatarioId: string }
  ) {
    try {
      const remitenteSocketIds = this.activeUsers.get(mensaje.remitenteId.toString());
      if (remitenteSocketIds) {
        remitenteSocketIds.forEach(socketId => {
          this.server.to(socketId).emit('notificacion', {
            tipo: "mensajeLeido",
            payload: mensaje
          });
        });
      } else {
      }
    } catch (error) {
      console.error('Error al marcar mensaje como leído:', error);
    }
  }
}



*/