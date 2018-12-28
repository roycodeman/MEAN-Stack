'use strict';

//controller
var jwt = require('jsonwebtoken');

module.exports.data = function (req, res) {

  jwt.verify(req.token, process.env.JWT_KEY, function (err, authData) {

    if (err)
      res.status(403).json(err)
    else
      
      res.json({
        authData: authData
      })

  });
}