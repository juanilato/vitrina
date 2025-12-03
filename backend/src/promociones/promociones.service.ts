import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePromocionDto } from './dto/create-promocion.dto';
import { UpdatePromocionDto } from './dto/update-promocion.dto';

@Injectable()
export class PromocionesService {
    constructor(private prisma: PrismaService) { }

    private get prismaClient(): any {
        return this.prisma;
    }

    async create(data: CreatePromocionDto) {
        const { productosIds, ...promocionData } = data;

        return this.prisma.$transaction(async (tx) => {
            const promocion = await (tx as any).promocion.create({
                data: {
                    ...promocionData,
                    configuracion: promocionData.configuracion as any,
                },
            });

            if (productosIds && productosIds.length > 0) {
                await (tx as any).promocionProducto.createMany({
                    data: productosIds.map((productoId) => ({
                        promocionId: promocion.id,
                        productoId,
                    })),
                });
            }

            return promocion;
        });
    }

    async findAllByEmpresa(empresaId: string) {
        return this.prismaClient.promocion.findMany({
            where: { empresaId },
            include: {
                productos: {
                    include: {
                        producto: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async update(id: string, data: UpdatePromocionDto) {
        const { productosIds, ...promocionData } = data;

        return this.prisma.$transaction(async (tx) => {
            const promocion = await (tx as any).promocion.update({
                where: { id },
                data: {
                    ...promocionData,
                    configuracion: promocionData.configuracion as any,
                },
            });

            if (productosIds !== undefined) {
                // Eliminar relaciones existentes
                await (tx as any).promocionProducto.deleteMany({
                    where: { promocionId: id },
                });

                // Crear nuevas relaciones
                if (productosIds.length > 0) {
                    await (tx as any).promocionProducto.createMany({
                        data: productosIds.map((productoId) => ({
                            promocionId: id,
                            productoId,
                        })),
                    });
                }
            }

            return promocion;
        });
    }

    async remove(id: string) {
        return this.prismaClient.promocion.delete({
            where: { id },
        });
    }

    async calculateOrderDiscounts(
        empresaId: string,
        items: { productoId: string; cantidad: number; precioBase: number }[]
    ): Promise<{
        totalDiscount: number;
        itemDiscounts: Map<string, { discount: number; promotionName: string }>;
        promocionesAplicadas: Array<{ nombre: string; tipo: string; descuentoAplicado: number }>;
    }> {
        const promotions = await this.findAllByEmpresa(empresaId);
        const activePromotions = promotions.filter((p: any) => p.activo);

        const itemDiscounts = new Map<string, { discount: number; promotionName: string }>();
        const promocionesMap = new Map<string, { nombre: string; tipo: string; descuentoAplicado: number }>();
        let totalDiscount = 0;

        // Helper to check days
        const isDayApplicable = (config: any) => {
            if (!config?.diasAplicables || config.diasAplicables.length === 0) return true;
            const days = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
            const currentDay = days[new Date().getDay()];
            return config.diasAplicables.includes(currentDay);
        };

        for (const item of items) {
            let bestDiscount = 0;
            let bestPromoName = '';

            for (const promo of activePromotions as any[]) {
                // 1. Check Scope
                if (promo.alcance === 'SELECCIONADOS') {
                    const isIncluded = promo.productos.some((p: any) => p.productoId === item.productoId);
                    if (!isIncluded) continue;
                }

                // 2. Check Days
                if (!isDayApplicable(promo.configuracion)) continue;

                // 3. Calculate Discount based on Type
                let currentDiscount = 0;
                const config = promo.configuracion;

                if (promo.tipo === 'CANTIDAD') {
                    // "Por Cantidad" or "Por Producto" (Simple Discount)
                    if (item.cantidad >= (config.cantidadCompra || 1)) {
                        const percentage = config.porcentajeDescuento || 0;
                        currentDiscount = (item.precioBase * item.cantidad * percentage) / 100;
                    }
                } else if (promo.tipo === 'BXPY') {
                    // "Buy X Pay Y" (e.g., 2x1)
                    const buy = config.cantidadLleva || 1;
                    const pay = config.cantidadPaga || 1;

                    if (item.cantidad >= buy) {
                        const freeItems = Math.floor(item.cantidad / buy) * (buy - pay);
                        currentDiscount = freeItems * item.precioBase;
                    }
                }

                if (currentDiscount > bestDiscount) {
                    bestDiscount = currentDiscount;
                    bestPromoName = promo.nombre;
                }
            }

            if (bestDiscount > 0) {
                // Use a composite key or just product ID if unique per item line
                // Assuming one line per product ID in the input array for simplicity,
                // but if multiple lines have same product, we might need index.
                // For now, map by productID.
                itemDiscounts.set(item.productoId, { discount: bestDiscount, promotionName: bestPromoName });
                totalDiscount += bestDiscount;

                // Track unique promotions applied
                if (!promocionesMap.has(bestPromoName)) {
                    // Find the promotion type
                    const appliedPromo = activePromotions.find((p: any) => p.nombre === bestPromoName);
                    promocionesMap.set(bestPromoName, {
                        nombre: bestPromoName,
                        tipo: appliedPromo?.tipo || 'CANTIDAD',
                        descuentoAplicado: bestDiscount
                    });
                } else {
                    // Accumulate discount if the same promotion applies to multiple items
                    const existingPromo = promocionesMap.get(bestPromoName);
                    if (existingPromo) {
                        existingPromo.descuentoAplicado += bestDiscount;
                    }
                }
            }
        }

        return {
            totalDiscount,
            itemDiscounts,
            promocionesAplicadas: Array.from(promocionesMap.values())
        };
    }
}
