import express from "express";
import { getAllAlbum, getAllsongs, getAllSongsOfAlbum, getSingleSong, searchAlbum, searchSong } from "./controller.js";
import { isAuth } from "./middleware.js";
const router= express.Router()

router.get("/album/all", getAllAlbum);
router.get('/song/all',getAllsongs)
router.get('/album/:id', getAllSongsOfAlbum);
router.get('/song/:id', getSingleSong)


router.get('/albums/search',isAuth ,searchAlbum)
router.get('/songs/search',isAuth,searchSong)



export default router;