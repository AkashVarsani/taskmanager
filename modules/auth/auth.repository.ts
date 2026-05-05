import db from "@/lib/db";

export class AuthRepository {
  static async findUserByEmail(email: string) {
    return db.user.findUnique({ where: { email } });
  }

  static async createUser(data: { email: string; name: string; password: string }) {
    return db.user.create({ data });
  }

  static async deleteUnverifiedUser(email: string) {
    return db.user.deleteMany({ where: { email, isVerified: false } });
  }

  static async findValidOTP(userId: string, hashedCode: string, purpose: string) {
    return db.oTP.findFirst({
      where: {
        userId,
        code: hashedCode,
        purpose,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  static async markOTPAsUsed(id: string) {
    return db.oTP.update({ where: { id }, data: { usedAt: new Date() } });
  }

  static async verifyUser(userId: string) {
    return db.user.update({ where: { id: userId }, data: { isVerified: true } });
  }

  static async updateUserPassword(userId: string, password: string) {
    return db.user.update({ where: { id: userId }, data: { password } });
  }
}
