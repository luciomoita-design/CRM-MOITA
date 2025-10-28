import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/server/prisma';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { logger } from '@/server/logger';

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login'
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user?.senha_hash || !user.ativo) {
          return null;
        }
        const valid = await bcrypt.compare(credentials.password, user.senha_hash);
        if (!valid) {
          logger.warn({ email: credentials.email }, 'Senha inválida');
          return null;
        }
        return {
          id: user.id,
          email: user.email,
          name: user.nome,
          role: user.role
        } as any;
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ''
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    }
  }
};
