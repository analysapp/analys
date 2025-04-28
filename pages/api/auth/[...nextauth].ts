import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "seu@email.com" },
        password: { label: "Senha", type: "password" },
      },
      authorize(credentials) {
        // Aqui simulamos um login apenas para teste
        if (
          credentials?.email === "admin@analys.com" &&
          credentials?.password === "123456"
        ) {
          return {
            id: "1", // <-- Aqui já estamos retornando o ID!
            name: "Administrador Analys",
            email: "admin@analys.com",
          };
        }

        // Se o login não for válido
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login", // Redirecionar para nossa página de login
  },
  callbacks: {
    async session({ session, token, user }) {
      if (session?.user && token?.sub) {
        session.user.id = token.sub; // <-- Aqui adicionamos o ID na sessão!
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
