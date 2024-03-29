import { query } from 'faunadb';
import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import { fauna } from '../../../services/faunadb';

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scope: 'read:user',
    }),
  ],
  // jwt: {
  //   signingKey: process.env.SIGNING_KEY,
  // },
  callbacks: {
    async signIn(user, account, profile) {
      const { email } = user;

     try { 
      await fauna.query(
        query.If(
          query.Not(
            query.Exists(
              query.Match(
                query.Index('user_by_email'),
                query.Casefold(user.email)
              )
              )
            ),
          query.Create(
            query.Collection('users'),
            { data: { email }}
          ),
            query.Get(
            query.Match(
            query.Index('user_by_email'),
            query.Casefold(user.email)
            )
          )
        )
      )
        return true;

      } catch {
        return false;
      }
    }
  }
})