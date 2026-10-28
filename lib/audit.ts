import { prisma } from "@/lib/prisma";

export function audit(userId: string, action: string, targetType: string, targetId?: string, detail?: object) {
  return prisma.auditLog.create({ data: { userId, action, targetType, targetId, detail } });
}
