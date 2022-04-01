'use strict';

const getInfo = async ( req, res, next) => {
  try {
    res.status(200).json({ message: 'Ok' })
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getInfo
};