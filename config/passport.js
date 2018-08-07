const  JwtStrategy = require('passport-jwt').Strategy;
const  ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose=require('mongoose');
const User =mongoose.model('users');
const keys=require('../config/keys');
var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports=passport=>{
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
  
    User.findById(jwt_payload.id)
        .then(user=>{
        if (user) {
            return done(null, user);
        }
            return done(null, false);
            // or you could create a new account
        
        
    }).catch(err=>console.log(err))
}));
}