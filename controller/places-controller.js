const HttpError = require("../models/http-error");
const uuid = require("uuid");
const { validationResult, check } = require("express-validator");
const getCoordinatesaddress = require("../utils/location");
const User=require('../models/user');
const Place = require("../models/place");
const mongoose  = require("mongoose");
const { startSession } = require("../models/user");
// let DUMMY_PLACES = [
//   {
//     id: "1",
//     title: "Empire State building",
//     description: "One of the most building nice",
//     location: {
//       lat: 45111212,
//       log: 466665,
//     },
//     address: "NY",
//     creator: "u1",
//   },
//   {
//     id: "2",
//     title: "Empire State building",
//     description: "One of the most building nice",
//     location: {
//       lat: 45111212,
//       log: 466665,
//     },
//     address: "Florida",
//     creator: "u2",
//   },
// ];
const getPlaceById = async (req, res, next) => {
  // console.log('getting request in server');
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    const err = new HttpError('couldn"t find  pplace id', 500);

    return next(err);
  }

  //  const place = DUMMY_PLACES.find((p) => p.id === placeId);
  if (!place || place.length === 0) {
    // res.status(404).json({message:'couldn"t find  pplace id'});
    const err = new HttpError('couldn"t find  pplace id', 404);
    return next(err);
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  // console.log(userId);
  let userswithPlaces;
  try {
    // users = await Place.find({ creator: userId });
    userswithPlaces=await User.findById(userId).populate('places');
    //  console.log(users);
  } catch (error) {
    const err = new HttpError('couldn"t find the user id', 500);
    return next(err);
  }

  // const users = DUMMY_PLACES.filter((u) => u.creator === userId);
  if (!userswithPlaces || userswithPlaces.length === 0) {
    return next(new HttpError('couldn"t find the user id', 404));
    // return res.status(404).json({message:'couldn"t find the user id '});
  }
  // console.log(userId)
  res.json({ places: userswithPlaces.places.map(place => place.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {

  const error = validationResult(req);
  console.log(req.body);
  if (!error.isEmpty()) {
    return next(new HttpError("Invalid inputs check the data", 422));
  }

  const { title, description, address } = req.body;

  let coordinates;

  try {
    coordinates = await getCoordinatesaddress(address);
  } catch (error) {
    return next(error);
  }
  // console.log(title);
  const createPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: "dummy_url",
    creator:req.userData.userId
    
  });

  let user;
  try {
    user=await User.findById(req.userData.userId);
    
  } catch (error) {
     const err=new HttpError('failed please try again',500);
     return next(err);
  }
  console.log(user);
  if(!user)
  {
    const error=new HttpError('could not find user',404);
    return next(error);
  }


  try {
    // await createPlace.save();
    const sess=await mongoose.startSession();
    sess.startTransaction();
    await createPlace.save({session:sess});
    user.places.push(createPlace);
    await user.save({session:sess});
    await sess.commitTransaction();

  } catch (err) {
    const error = new HttpError("connection err with moongose", 400);
    return next(error);
  }

  // DUMMY_PLACES.push(createPlace);
  res.status(201).json({ place: createPlace });
};

const deletePlace =async (req, res, next) => {
  const deleteid = req.params.pid;
  let place;
  try {
    place=await Place.findById(deleteid).populate('creator');

    
  } catch (error) {
    const err=new HttpError('couldnot delete',500);
    return next(err);
    

  }
  if(!place)
  {
    const err=new HttpError('couldnot find place for the id',404);
    return next(err);
  }
  if(place.creator.id !==req.userData.userId){
    const error=new HttpError('you are not to allowed to change',401);
    return next(error);
  }

  try {
    // await place.remove()
    const sess=await mongoose.startSession();
    sess.startTransaction();
    await place.remove({session:sess});
    place.creator.places.pull(place);
    await place.creator.save({session:sess});
    await sess.commitTransaction();

  } catch (error) {
    const err=new HttpError('couldnot delete',500);
    return next(err);
    
  }

  // if (!DUMMY_PLACES.filter((p) => p.id !== deleteid)) {
  //   throw new HttpError("coulnot find the place ", 422);
  // }
  // DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== deleteid);
  res.status(200).json({ message: "deleted" });
};
const updatePlaceById = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    throw new HttpError("Enter the details properly", 422);
  }
  const { title, description } = req.body;
  const placeId = req.params.pid;
  console.log(placeId);
  

  let place;
  try{
    place=await Place.findById(placeId);
  }catch(err){
    const error=new HttpError('Counldn"t find the ID',500);
    return next(error);
  }
   if(place.creator.toString()!==req.userData.userId)
   {
    const error=new HttpError('you are not to allowed to change',401);
    return next(error);

   }
  // const updatePlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) };
  // const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);
  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (error) {
    const err=new HttpError('something went wrong',500);
    return next(err);
    
  }

  // DUMMY_PLACES[placeIndex] = updatePlace;
  res.status(200).json({ place: place.toObject({getters:true}) });
};

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.deletePlace = deletePlace;
exports.updatePlaceById = updatePlaceById;
