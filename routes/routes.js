module.exports = function(schemas) {

  routes = {
    updateSentence: function(req, res) {
      if (req.user) {
        schemas.User.findOneAndUpdate({ _id: req.user._id }, 
                                      { sentence: req.body.sentence },
          function(err) {
            if (err) {
              console.error("Mongoose update error: " + err);
              res.send(500);
            }
            else {
              res.send(200);
            }
          }
        );
      }
      else {
        res.send(401);
      }
    }
  };

  return routes;
};
