
const express = require('express');
const { selectFields } = require('express-validator/src/select-fields');
const router = express.Router();
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken')
const {check, validationResult} = require('express-validator');
const config = require('config');
const bcrypt = require('bcryptjs');

const User =require('../../models/User');
router.get('/', auth, async (req,res) => {
    try{
        const user = await User.findById(req.user.id).select('-password')
        res.json(user);

    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error1');

    }
}
);

router.post('/',
    [
    
    check('email', 'Please include a valide email'). isEmail(),
    check( 'password','pass required').exists()
],
async(req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    const {email, password} = req.body;

    try{ // See if user exists

        let user = await User.findOne({email});
        if(!user){
           return res.status(400).json({errors: [{msg: 'invalid creds'}]});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if(!isMatch){

            return res
            .status(400)
            .json({errors:[{msg:'invalid cred'}]});
        }


        const payload ={
            user:{
                id: user.id
            }
        }
        jwt.sign(
            payload, 
            config.get('jwtSecret'), 
            {expiresIn:360000},
            (err,token) =>{
            if(err)throw err;
            res.json({token});
            }
        );

     

    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error2')

    }
   
    
});
module.exports = router;