import { sql } from "./config/db.js";
import TryCatch from "./TryCatch.js";
import { redisClient } from "./index.js";
import axios from "axios";
import { Request, Response, NextFunction } from "express";
import IUser from "./middleware.js";

type AuthRequest = Request & { user?: IUser };

const CACHE_EXPIRY = 1800; // 30 minutes cache expiry


export const getAllAlbum = TryCatch(async (req, res) => {
    let albums;

    if (redisClient.isReady) {
        albums = await redisClient.get("albums");
    }

    if (albums) {
        console.log("cache hit: albums");
        res.json(JSON.parse(albums));
        return;
    } else {
        console.log("cache miss: albums");
        albums = await sql`SELECT * FROM albums`;

        if (redisClient.isReady) {
            await redisClient.set("albums", JSON.stringify(albums), { EX: CACHE_EXPIRY });
        }

        res.json(albums);
    }
});


export const getAllsongs = TryCatch(async (req, res) => {
    let songs;

    if (redisClient.isReady) {
        songs = await redisClient.get("songs");
    }

    if (songs) {
        console.log("cache hit: songs");
        res.json(JSON.parse(songs));
        return;
    } else {
        console.log("cache miss: songs");
        songs = await sql`SELECT * FROM songs`;

        if (redisClient.isReady) {
            await redisClient.set("songs", JSON.stringify(songs), { EX: CACHE_EXPIRY });
        }

        res.json(songs);
    }
});


export const getAllSongsOfAlbum = TryCatch(async (req, res) => {
    const { id } = req.params;
    let album, songs;

    if (redisClient.isReady) {
        const cachedData = await redisClient.get(`album:${id}`);
        if (cachedData) {
            console.log(`cache hit: album:${id}`);
            res.json(JSON.parse(cachedData));
            return;
        }
    }

    album = await sql`SELECT * FROM albums WHERE id = ${id}`;
    if (album.length === 0) {
        res.status(404).json({ message: "No album with this id" });
        return;
    }

    songs = await sql`SELECT * FROM songs WHERE album_id = ${id}`;
    const response = { songs, album: album[0] };

    if (redisClient.isReady) {
        await redisClient.set(`album:${id}`, JSON.stringify(response), { EX: CACHE_EXPIRY });
    }

    res.json(response);
});

export const getSingleSong = TryCatch(async (req, res) => {
    const { id } = req.params;
    const song = await sql`SELECT * FROM songs WHERE id = ${id}`;

    if (song.length === 0) {
        res.status(404).json({ message: "No song with this id" });
        return;
    }

    res.json(song[0]);
});
export const searchAlbum = async (req: AuthRequest, res: Response) => {
    try {
        console.log("Extracting and validating `q`");
        const q = (req.query.q as string || "").trim();
        if (!q) {
            console.error("Error: Query param `q` is required");
            res.status(400).json({ message: "Query param `q` is required" });
            return;
        }

        console.log("Querying Postgres for albums");
        const rows = await sql`
          SELECT id, title, thumbnail
          FROM albums
          WHERE title ILIKE ${"%" + q + "%"}
          ORDER BY title
          LIMIT 50
        `;

        const albums = rows as Array<{ id: string, title: string; thumbnail: string }>;

        console.log("Recording search term for albums");
        const token = (req.headers.token as string) || "";
        const userId = req.user!._id;
        console.log(`User ID in search-album: ${userId}`);
        console.log(`User service URL: ${process.env.User_URL}`);

        axios.patch(
          `${process.env.User_URL}/api/v1/user/${userId}/search-history`,
          { term: q },
          { headers: { token } }
        ).catch(console.error);

        console.log("Responding with albums");
        res.json({ albums });

    } catch (error) {
        console.error("Caught in searchAlbum:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

  
  
  /**
   * GET /songs/search?q=keyword
   */
  export const searchSong = TryCatch(async (req: AuthRequest, res: Response) => {
    try {
        console.log("Extracting and validating `q`");
        const q = (req.query.q as string || "").trim();
        if (!q) {
            console.error("Error: Query param `q` is required");
            res.status(400).json({ message: "Query param `q` is required" });
            return;
        }
      
        console.log("Querying Postgres for songs");
        const songRows = await sql`
          SELECT id, title, thumbnail
          FROM songs
          WHERE title ILIKE ${"%" + q + "%"}
          ORDER BY title
          LIMIT 50
        `;
        const songs = songRows as Array<{ id: string; title: string; thumbnail: string }>;
      
        console.log("Recording search term for songs");
        const token = (req.headers.token as string) || "";
        const userId = req.user!._id;
        console.log(`user urlllll in search song controller:${process.env.User_URL}`)
        axios.patch(
          `${process.env.User_URL}/api/v1/user/${userId}/search-history`,
          { term: q },
          { headers: { token } }
        ).catch(console.error);
      
        console.log("Responding with songs");
        res.json({ songs });
    } catch (error) {
        console.error("Error in searchSong:", error);
        res.status(500).json({ message: "Internal server error" });
    }
  });