interface IUser {
    _id: string,
    name: string,
    email: string,
    password: string,
    role: string,
    playlist: string[];
}
declare global {
    namespace Express {
      // Augment the built‐in Request interface
      interface Request {
        user?: IUser;
      }
    }
  }